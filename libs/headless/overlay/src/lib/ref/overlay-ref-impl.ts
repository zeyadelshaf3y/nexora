import { createId, getViewportRect as getViewportRectFromCore } from '@nexora-ui/core';
import { ReplaySubject, Subject } from 'rxjs';

import { registerCloseableRef, unregisterCloseableRef } from '../close/closeable-ref-registry';
import type { OverlayContainerService } from '../container/overlay-container.service';
import type { Portal } from '../portal/portal';
import type { Placement } from '../position/position-result';
import type { IOverlayStack } from '../stack/overlay-stack.service';

import type { ClosePolicy } from './close-policy';
import { mergeClosePolicy } from './close-policy';
import { CLOSE_REASON_PROGRAMMATIC, type CloseReason } from './close-reason';
import { runOverlayCloseVisualTransition } from './overlay-close-visual';
import type { BeforeCloseCallback, OverlayConfig, PanelDimensionOptions } from './overlay-config';
import {
  resolveOverlayCloseAnimationDurationMs,
  runOverlayBeforeClose,
  runOverlayBeforeOpen,
} from './overlay-config-lifecycle';
import { scheduleOverlayEnterAnimation } from './overlay-enter-animation';
import {
  appendOverlayPaneAndBackdrop,
  createOverlayHostDomState,
  removeOverlayPaneAndBackdrop,
} from './overlay-host-dom';
import {
  applyOverlayPaneSizingFromConfig,
  clearOverlayPaneSizing,
} from './overlay-pane-from-config';
import { applyInitialOverlayPaneAndBackdropStyles } from './overlay-pane-initial-styles';
import {
  addClasses,
  applyStyles,
  DEFAULT_CLOSE_ANIMATION_MS,
  removeClasses,
} from './overlay-pane-styling';
import { runOverlayPositionCycle } from './overlay-position-cycle';
import type { OverlayRef } from './overlay-ref';
import { createOverlayRepositionRegistrations } from './overlay-reposition-registrations';
import {
  overlayHasHostOption,
  resolveOverlayHost,
  resolveOverlayLazyElement,
  resolveOverlayLazyElementOrNull,
} from './overlay-resolve-elements';
import { applyOverlayTransformOriginFromTrigger } from './overlay-transform-origin';
import {
  applyPaneMaxSizesForContainedHost,
  getOverlayBaseViewportRect,
  getOverlayPositioningViewportRect,
} from './overlay-viewport-bounds';

/**
 * Default overlay ref implementation. Orchestrates pane/backdrop DOM, position,
 * scroll/focus strategies, and close lifecycle. Used by {@link OverlayService.create}.
 *
 * Responsibilities are split into:
 * - {@link overlay-pane-styling}: close animation wait and defaults
 * - {@link overlay-pane-initial-styles}: first paint classes/styles for pane and backdrop
 * - {@link overlay-pane-from-config}: ARIA and dimension helpers (used by initial styles)
 * - {@link overlay-config-lifecycle}: beforeOpen/beforeClose and close animation duration
 * - {@link overlay-close-visual}: close animation sequence (transform → closing classes → wait)
 * - {@link overlay-enter-animation}: entering → open and open → closing class transitions / rAF scheduling
 * - {@link overlay-transform-origin}: transform-origin from trigger + placement
 * - {@link overlay-position-cycle}: strategy apply + anchored max-height in one pass
 * - {@link overlay-position-applier}: DOM application of strategy coordinates (used by the cycle)
 * - {@link overlay-viewport-bounds}: viewport / host rect math for sizing and positioning
 * - {@link overlay-resolve-elements}: lazy host / anchor / boundary element resolution
 * - {@link overlay-host-dom}: pane/backdrop mount order for global vs scoped host
 * - {@link overlay-reposition-registrations}: RAF-throttled reposition + scroll/resize listeners
 */
export class OverlayRefImpl implements OverlayRef {
  readonly id: string;
  readonly scopeId: string;
  private readonly closePolicy: ClosePolicy;
  private readonly parentRef: OverlayRef | null;

  private portal: Portal | null = null;
  private pane: HTMLElement | null = null;
  private backdrop: HTMLElement | null = null;
  private host: HTMLElement | null = null;
  private closed = false;
  private closeAnimationDurationOverrideMs: number | undefined;
  // ReplaySubject so an opener that subscribes after `await open()` (i.e. after attach has already
  // emitted) still receives the "opened" event. Injected component content subscribes during attach
  // and is unaffected.
  private readonly afterOpened$ = new ReplaySubject<void>(1);
  private readonly beforeClosed$ = new Subject<CloseReason | undefined>();
  private readonly afterClosed$ = new Subject<CloseReason | undefined>();
  private listenerCleanups: Array<() => void> = [];
  private repositionCancel: (() => void) | null = null;
  private lastPlacement: Placement | null = null;
  private readonly hostDomState = createOverlayHostDomState();
  /** Runtime size overrides applied via {@link updateSize}, merged over the open-time config. */
  private sizeOverrides: Partial<PanelDimensionOptions> = {};
  /** Extra before-close guards registered via {@link addCloseGuard}, run after `config.beforeClose`. */
  private readonly closeGuards: BeforeCloseCallback[] = [];

  constructor(
    private readonly config: OverlayConfig,
    private readonly stack: IOverlayStack,
    private readonly container: OverlayContainerService,
  ) {
    this.id = config.id ?? createId();
    this.scopeId = config.scopeId ?? config.parentRef?.scopeId ?? 'global';
    this.closePolicy = mergeClosePolicy(config.closePolicy, config.hasBackdrop);
    this.parentRef = config.parentRef ?? null;
  }

  /** Attaches the portal content to the overlay pane and starts enter animation. */
  async attach(portal: Portal): Promise<boolean> {
    if (this.closed) return false;

    if (!(await runOverlayBeforeOpen(this.config.beforeOpen))) return false;

    const { pane, backdrop } = this.createAndStylePane();
    this.pane = pane;
    this.backdrop = backdrop;

    const host = resolveOverlayHost(this.config.host, this.container.getContainer());
    this.host = host;
    this.appendToHost(host, pane, backdrop);
    this.applyContainedHostStyles(pane);

    this.attachPortalAndRegisterCloseable(pane, portal);
    this.attachStrategiesAndStartEnterAnimation(pane, backdrop);

    this.afterOpened$.next();
    this.afterOpened$.complete();

    return true;
  }

  private createAndStylePane(): { pane: HTMLElement; backdrop: HTMLElement | null } {
    const hasBackdrop = this.config.hasBackdrop ?? false;
    const { pane, backdrop } = this.container.createPaneElement(this.scopeId, hasBackdrop);
    applyInitialOverlayPaneAndBackdropStyles(pane, backdrop, this.config);

    return { pane, backdrop };
  }

  /** When host is set, caps pane max dimensions to the host's visible rect (inset by boundaries). */
  private applyContainedHostStyles(pane: HTMLElement): void {
    if (!this.hasScopedContentHostAttached()) return;

    this.applyHostScopedMaxSizes(pane, this.config.maxWidth, this.config.maxHeight);
  }

  /** Caps pane max width/height to the content host's visible rect (inset by boundaries). */
  private applyHostScopedMaxSizes(
    pane: HTMLElement,
    maxWidth: string | undefined,
    maxHeight: string | undefined,
  ): void {
    applyPaneMaxSizesForContainedHost(
      pane,
      getOverlayBaseViewportRect(this.config.host, this.host, getViewportRectFromCore),
      this.config.boundaries,
      maxWidth,
      maxHeight,
    );
  }

  private attachPortalAndRegisterCloseable(pane: HTMLElement, portal: Portal): void {
    portal.attach(pane);
    this.portal = portal;

    registerCloseableRef(pane, this);
  }

  private attachStrategiesAndStartEnterAnimation(
    pane: HTMLElement,
    backdrop: HTMLElement | null,
  ): void {
    this.config.scrollStrategy.attach(this);
    this.applyPosition();
    this.stack.register(this);
    this.config.focusStrategy.focusOnOpen(this);
    this.scheduleEnterAnimation(pane, backdrop);
    this.setupRepositionListeners();
  }

  /** Detaches the portal from the pane; does not remove pane from DOM or run close animation. */
  detach(): void {
    if (this.portal) {
      this.portal.detach();
      this.portal = null;
    }
  }

  /** Closes the overlay (runs close animation, detaches, unregisters, emits afterClosed). */
  async close(reason?: CloseReason): Promise<boolean> {
    return this.closeInternal(reason, true);
  }

  private async closeInternal(
    reason: CloseReason | undefined,
    runBeforeClose: boolean,
  ): Promise<boolean> {
    if (this.closed) return false;
    if (await this.isBeforeCloseBlocking(reason, runBeforeClose)) return false;

    this.closed = true;
    this.emitCloseStarting(reason);
    this.teardownListeners();
    this.config.focusStrategy.restoreOnClose(this);

    const pane = this.pane;
    const backdrop = this.backdrop;
    const host = this.host;
    const closeDurationMs = resolveOverlayCloseAnimationDurationMs(
      this.closeAnimationDurationOverrideMs,
      this.config.closeAnimationDurationMs,
      DEFAULT_CLOSE_ANIMATION_MS,
    );

    if (pane && host && closeDurationMs > 0) {
      await runOverlayCloseVisualTransition(pane, backdrop, closeDurationMs, () =>
        this.setTransformOriginFromTrigger(pane),
      );
    }

    this.detachPortalScrollAndStack();

    if (pane && host) {
      unregisterCloseableRef(pane);
      this.removeFromDom(host, pane, backdrop);
    }

    this.clearMountedElementRefs();
    this.config.positionStrategy.detach?.();
    this.afterClosed$.next(reason);
    this.afterClosed$.complete();

    return true;
  }

  /**
   * Emits the "close is committed" lifecycle: completes `afterOpened` (it can no longer emit),
   * emits `beforeClosed` with the reason (only if the overlay actually opened), then completes it.
   * Runs once, before the close animation.
   */
  private emitCloseStarting(reason: CloseReason | undefined): void {
    this.afterOpened$.complete();

    if (this.pane != null) this.beforeClosed$.next(reason);

    this.beforeClosed$.complete();
  }

  /** Detaches portal content, scroll strategy, and stack registration (pane may still be in DOM). */
  private detachPortalScrollAndStack(): void {
    this.detach();
    this.config.scrollStrategy.detach();
    this.stack.unregister(this);
  }

  private clearMountedElementRefs(): void {
    this.pane = null;
    this.backdrop = null;
    this.host = null;
  }

  private async isBeforeCloseBlocking(
    reason: CloseReason | undefined,
    runBeforeClose: boolean,
  ): Promise<boolean> {
    if (!runBeforeClose) return false;

    const effectiveReason = reason ?? CLOSE_REASON_PROGRAMMATIC;
    const guards = [this.config.beforeClose, ...this.closeGuards];

    for (const guard of guards) {
      if (!(await runOverlayBeforeClose(guard, effectiveReason, CLOSE_REASON_PROGRAMMATIC))) {
        return true;
      }
    }

    return false;
  }

  setCloseAnimationDurationMs(durationMs: number | undefined): void {
    this.closeAnimationDurationOverrideMs = durationMs;
  }

  /** Merges size overrides, re-applies pane sizing, and repositions. No-op when detached. */
  updateSize(size: Partial<PanelDimensionOptions>): void {
    this.sizeOverrides = { ...this.sizeOverrides, ...size };

    const pane = this.pane;
    if (!pane) return;

    this.applyCurrentSizing(pane);
    this.applyPosition();
  }

  /**
   * Clears then re-applies pane sizing. Clearing first lets `updateSize` reset a dimension to
   * `auto` by passing `undefined`. Precedence mirrors the open-time order (config sizing, then
   * `panelStyle`) and adds explicit runtime overrides on top, so a `panelStyle` width/max set at
   * open time survives a later `updateSize` that only changes a different dimension. Host-scoped
   * overlays get their max sizes re-capped to the host rect (the viewport-cap path is skipped).
   */
  private applyCurrentSizing(pane: HTMLElement): void {
    const merged = { ...this.config, ...this.sizeOverrides };

    clearOverlayPaneSizing(pane);
    applyOverlayPaneSizingFromConfig(pane, merged);
    applyStyles(pane, this.config.panelStyle);
    this.applySizeOverrideStyles(pane);

    if (this.hasScopedContentHostAttached()) {
      this.applyHostScopedMaxSizes(pane, merged.maxWidth, merged.maxHeight);
    }
  }

  /** Re-applies only the dimensions explicitly set via {@link updateSize}, so they win over `panelStyle`. */
  private applySizeOverrideStyles(pane: HTMLElement): void {
    const o = this.sizeOverrides;
    const s = pane.style;

    if (o.width != null) s.setProperty('width', o.width);
    if (o.height != null) s.setProperty('height', o.height);
    if (o.minWidth != null) s.setProperty('min-width', o.minWidth);
    if (o.minHeight != null) s.setProperty('min-height', o.minHeight);
    if (o.maxWidth != null) s.setProperty('max-width', o.maxWidth);
    if (o.maxHeight != null) s.setProperty('max-height', o.maxHeight);
  }

  /** Adds CSS class(es) to the pane. No-op when detached. */
  addPanelClass(classes: string | string[]): void {
    if (this.pane) addClasses(this.pane, classes);
  }

  /** Removes CSS class(es) from the pane. No-op when detached. */
  removePanelClass(classes: string | string[]): void {
    if (this.pane) removeClasses(this.pane, classes);
  }

  /** Registers a before-close guard; returns a function that removes it. */
  addCloseGuard(guard: BeforeCloseCallback): () => void {
    this.closeGuards.push(guard);

    return () => {
      const index = this.closeGuards.indexOf(guard);
      if (index !== -1) this.closeGuards.splice(index, 1);
    };
  }

  /** Disposes the overlay (closes if still open and completes afterClosed). */
  dispose(): void {
    if (!this.closed) {
      // Dispose is a hard teardown path and should never be vetoed by beforeClose hooks.
      void this.closeInternal(CLOSE_REASON_PROGRAMMATIC, false);
    }
  }

  /** True while the overlay is attached and has not been closed. */
  isOpen(): boolean {
    return !this.closed && this.pane !== null;
  }

  /** Observable that emits once after the overlay is attached and then completes. */
  afterOpened() {
    return this.afterOpened$.asObservable();
  }

  /** Observable that emits the close reason when close is committed (before animation) and then completes. */
  beforeClosed() {
    return this.beforeClosed$.asObservable();
  }

  /** Observable that emits the close reason when the overlay closes and then completes. */
  afterClosed() {
    return this.afterClosed$.asObservable();
  }

  /** Returns the overlay pane element, or null if not attached. */
  getPaneElement(): HTMLElement | null {
    return this.pane;
  }

  /** Returns the backdrop element, or null if no backdrop or not attached. */
  getBackdropElement(): HTMLElement | null {
    return this.backdrop;
  }

  /** Returns the effective close policy (escape, outside, backdrop). */
  getClosePolicy(): Readonly<ClosePolicy> {
    return this.closePolicy;
  }

  /** Returns true if the node is inside the anchor element. */
  containsAnchor(node: Node): boolean {
    const el = this.getResolvedAnchor();

    return el?.contains(node) ?? false;
  }

  getOutsideClickBoundary(): HTMLElement | null {
    return this.getResolvedOutsideClickBoundary();
  }

  /** Returns the parent overlay ref when this overlay is nested, or null. */
  getParentRef(): OverlayRef | null {
    return this.parentRef;
  }

  notifyOutsideClickAttempted(): void {
    // No-op when closePolicy.outside is 'none'.
  }

  /** Re-applies the position strategy (e.g. after viewport or anchor change). */
  reposition(): void {
    if (this.pane) this.applyPosition();
  }

  /** Sets the z-index of the pane and backdrop. */
  setZIndex(z: number): void {
    if (this.pane) this.pane.style.zIndex = String(z);
    if (this.backdrop) this.backdrop.style.zIndex = String(z - 1);
  }

  getBaseZIndex(): number | undefined {
    return this.config.zIndex;
  }

  // ---------------------------------------------------------------------------
  // Private: pane/backdrop DOM
  // ---------------------------------------------------------------------------

  private appendToHost(host: HTMLElement, pane: HTMLElement, backdrop: HTMLElement | null): void {
    appendOverlayPaneAndBackdrop({
      mountTarget: host,
      globalOverlayContainer: this.container.getContainer(),
      pane,
      backdrop,
      hostScoped: overlayHasHostOption(this.config),
      state: this.hostDomState,
    });
  }

  private removeFromDom(host: HTMLElement, pane: HTMLElement, backdrop: HTMLElement | null): void {
    removeOverlayPaneAndBackdrop({
      mountTarget: host,
      pane,
      backdrop,
      hostScoped: overlayHasHostOption(this.config),
      state: this.hostDomState,
    });
  }

  // ---------------------------------------------------------------------------
  // Private: enter/close animation
  // ---------------------------------------------------------------------------

  private getResolvedAnchor(): HTMLElement | undefined {
    return resolveOverlayLazyElement(this.config.anchor);
  }

  /** Scoped `host` option is set and the resolved content host element is available. */
  private hasScopedContentHostAttached(): boolean {
    return overlayHasHostOption(this.config) && this.host != null;
  }

  private getPositioningViewportRect(): DOMRect {
    return getOverlayPositioningViewportRect(
      this.config.host,
      this.host,
      this.config.boundaries,
      getViewportRectFromCore,
    );
  }

  private getResolvedTransformOriginElement(): HTMLElement | undefined {
    return resolveOverlayLazyElement(this.config.transformOriginElement);
  }

  private getResolvedOutsideClickBoundary(): HTMLElement | null {
    return resolveOverlayLazyElementOrNull(this.config.outsideClickBoundary);
  }

  private scheduleEnterAnimation(pane: HTMLElement, backdrop: HTMLElement | null): void {
    scheduleOverlayEnterAnimation({
      pane,
      backdrop,
      isAborted: () => this.closed || this.pane !== pane,
      applyPosition: () => this.applyPosition(),
      applyPositionSecondFrame: this.hasScopedContentHostAttached()
        ? () => this.applyPosition()
        : undefined,
      applyTransformOrigin: () => this.setTransformOriginFromTrigger(pane),
    });
  }

  /**
   * Sets transform-origin to the placement-based point on the trigger (in pane-local px) so the
   * overlay appears to grow from that corner/edge. No-op when no transformOriginElement or no window (SSR/detached).
   */
  private setTransformOriginFromTrigger(pane: HTMLElement): void {
    applyOverlayTransformOriginFromTrigger(
      pane,
      this.getResolvedTransformOriginElement(),
      this.lastPlacement,
    );
  }

  // ---------------------------------------------------------------------------
  // Private: reposition listeners
  // ---------------------------------------------------------------------------

  private setupRepositionListeners(): void {
    const { cancelThrottledReposition, restCleanups } = createOverlayRepositionRegistrations({
      applyPosition: () => this.applyPosition(),
      config: this.config,
      host: this.host,
      getAnchorElement: () => this.getResolvedAnchor(),
      pane: this.pane,
    });

    this.repositionCancel = cancelThrottledReposition;
    this.listenerCleanups.push(...restCleanups);
  }

  private teardownListeners(): void {
    this.repositionCancel?.();
    this.repositionCancel = null;
    const cleanups = this.listenerCleanups;

    for (const cleanup of cleanups) {
      cleanup();
    }

    cleanups.length = 0;
  }

  // ---------------------------------------------------------------------------
  // Private: position
  // ---------------------------------------------------------------------------

  private applyPosition(): void {
    const pane = this.pane;

    if (!pane) return;

    this.lastPlacement = runOverlayPositionCycle(
      pane,
      { ...this.config, ...this.sizeOverrides },
      {
        getViewportRect: () => this.getPositioningViewportRect(),
        getAnchorElement: () => this.getResolvedAnchor(),
        currentPlacement: this.lastPlacement ?? undefined,
      },
    );

    // The position cycle writes `transform-origin` from the placement result. When a
    // `transformOriginElement` (trigger/anchor) is configured, that element is the source of truth
    // for the enter/close scale animation, so re-apply it here. Otherwise a reposition during the
    // open animation (e.g. the pane ResizeObserver's initial callback) would reset the origin to the
    // centered placement value and the overlay would grow from its center instead of the trigger.
    this.setTransformOriginFromTrigger(pane);
  }
}

import {
  inject,
  Injectable,
  isDevMode,
  type TemplateRef,
  type Type,
  type ViewContainerRef,
} from '@angular/core';
import { warnOnce } from '@nexora-ui/core';
import {
  type OverlayConfig,
  type ComponentPortal,
  isComponent,
  NoopFocusStrategy,
  NoopScrollStrategy,
  OverlayService,
  subscribeOnceAfterClosed,
} from '@nexora-ui/overlay';
import {
  applyComponentInputs,
  registerCloseableRef,
  resolveViewContainerRefFromExplicitOptions,
  subscribeComponentOutputs,
  unsubscribeComponentOutputSubscriptions,
} from '@nexora-ui/overlay/internal';

import {
  type SnackbarDefaultNotifyComponent,
  type SnackbarDefaultsConfig,
  type SnackbarNotifyOptions,
  SNACKBAR_DEFAULTS,
} from '../options/snackbar-defaults.config';
import type {
  SnackbarOpenOptions,
  SnackbarOpenOptionsForComponent,
  SnackbarOpenOptionsForTemplate,
} from '../options/snackbar-open-options';
import type { SnackbarPlacement } from '../position/snackbar-placement';
import {
  DEFAULT_SNACKBAR_PADDING,
  SnackbarPositionStrategy,
} from '../position/snackbar-position-strategy';
import type { SnackbarAutoCloseState, SnackbarRef } from '../ref/snackbar-ref';
import { SnackbarRefImpl } from '../ref/snackbar-ref-impl';

import {
  createSnackbarContentPortal,
  createSnackbarOpenInjector,
  type SnackbarInternalRef,
  SNACKBAR_OVERLAY_CLOSE_POLICY,
} from './internal/snackbar-open-helpers';
import {
  SnackbarStackRegistry,
  type SnackbarVisibilityChange,
} from './internal/snackbar-stack-registry';

type SnackbarAutoCloseRef = SnackbarInternalRef & {
  bindAutoCloseControls(controls: { pause: () => void; resume: () => void } | null): void;
  setAutoCloseState(state: SnackbarAutoCloseState): void;
};

/** Default auto-close duration in ms. Override via `options.duration`. */
export const DEFAULT_SNACKBAR_DURATION = 4000;
const AUTO_CLOSE_PROGRESS_TICK_MS = 100;
const ATTR_HIDDEN = 'hidden';
const ATTR_INERT = 'inert';

/** Default snackbar placement. Override via `options.placement`. */
export const DEFAULT_SNACKBAR_PLACEMENT: SnackbarPlacement = 'bottom-end';

/**
 * Headless snackbar service. Opens snackbars with template or component content.
 * Snackbars are positioned at viewport edges and stack per placement. No default
 * styling — user provides panelClass/panelStyle and content. Tree-shakable: only
 * import when using snackbars.
 */
@Injectable({ providedIn: 'root' })
export class SnackbarService {
  private readonly overlay = inject(OverlayService);
  private readonly defaults = inject<SnackbarDefaultsConfig | null>(SNACKBAR_DEFAULTS, {
    optional: true,
  });
  private readonly stack = new SnackbarStackRegistry();

  /**
   * Opens a snackbar. Returns a ref to close it and subscribe to `afterClosed()`.
   * Duration `0` = no auto-close. Pass `groupId` to replace an existing snackbar in the same group.
   *
   * @throws Error if a ViewContainerRef cannot be obtained (pass viewContainerRef in options, pass an injector that provides ViewContainerRef, or ensure the overlay container can be created (DOM available).
   */
  open(
    content: TemplateRef<unknown>,
    options?: SnackbarOpenOptionsForTemplate,
  ): SnackbarRef<unknown>;
  open<T>(content: Type<T>, options?: SnackbarOpenOptionsForComponent<T>): SnackbarRef<T>;
  open<T = unknown>(
    content: TemplateRef<unknown> | Type<T>,
    options: SnackbarOpenOptions = {},
  ): SnackbarRef<T> {
    const placement = options.placement ?? DEFAULT_SNACKBAR_PLACEMENT;
    const duration = options.duration ?? DEFAULT_SNACKBAR_DURATION;
    const groupId = options.groupId;

    const vcr = this.resolveViewContainerRef(options);
    this.stack.closeExistingInGroup(groupId);
    this.stack.setPlacementMaxVisible(
      placement,
      this.resolvePlacementMaxVisibleForOpen(placement, options),
    );

    const refHolder: { current: SnackbarRefImpl<T> | null } = { current: null };

    const getStackOffset = (): number =>
      this.stack.getStackOffsetForRef(placement, refHolder.current, options);

    const overlayRef = this.overlay.create(
      this.buildOverlayConfig(placement, options, getStackOffset),
    );
    refHolder.current = new SnackbarRefImpl<T>(overlayRef);
    const snackbarRef = refHolder.current;
    this.applyVisibilityChanges(this.stack.registerRef(placement, snackbarRef));

    subscribeOnceAfterClosed(snackbarRef, () => {
      this.applyVisibilityChanges(this.stack.unregisterRef(placement, snackbarRef));
      if (groupId) this.stack.unregisterRefByGroupId(groupId, snackbarRef);
      this.stack.repositionPlacementStack(placement);
    });

    if (groupId) this.stack.registerRefByGroupId(groupId, snackbarRef);

    const injector = createSnackbarOpenInjector(content, options, snackbarRef);
    const portal = createSnackbarContentPortal(content, vcr, injector);

    overlayRef.attach(portal).then((opened) => {
      this.handleAttachResult(opened, {
        overlayRef,
        placement,
        snackbarRef: snackbarRef as SnackbarAutoCloseRef,
        groupId,
        portal,
        content,
        options,
        duration,
      });
    });

    return snackbarRef;
  }

  notify<TComponent = SnackbarDefaultNotifyComponent>(
    options: SnackbarNotifyOptions<TComponent>,
  ): SnackbarRef<unknown> {
    const defaults = this.defaults;
    if (!defaults) {
      throw new Error(
        'SnackbarService.notify(): no defaults configured. Provide SNACKBAR_DEFAULTS via provideSnackbarDefaults(...).',
      );
    }
    const mergedOptions: SnackbarOpenOptionsForComponent = {
      ...(defaults.defaultOpenOptions ?? {}),
      ...options,
    };

    return this.open(defaults.component, mergedOptions);
  }

  // ---------------------------------------------------------------------------
  // Private: open flow — view container, group, config, portal, attach
  // ---------------------------------------------------------------------------

  private resolveViewContainerRef(options: SnackbarOpenOptions): ViewContainerRef {
    const vcr = resolveViewContainerRefFromExplicitOptions(
      { viewContainerRef: options.viewContainerRef, injector: options.injector },
      () => this.overlay.getDefaultViewContainerRef(),
    );
    if (!vcr) {
      throw new Error(
        'SnackbarService.open(): could not obtain a ViewContainerRef. Pass viewContainerRef in options, pass an injector that provides ViewContainerRef, or ensure the overlay container can be created (DOM available).',
      );
    }

    return vcr;
  }

  private buildOverlayConfig(
    placement: SnackbarPlacement,
    options: SnackbarOpenOptions,
    getStackOffset: () => number,
  ): OverlayConfig {
    const positionStrategy = new SnackbarPositionStrategy(placement, getStackOffset, {
      padding: options.padding,
    });

    return {
      ...(options.host != null && { host: options.host }),
      positionStrategy,
      scrollStrategy: new NoopScrollStrategy(),
      focusStrategy: new NoopFocusStrategy(),
      hasBackdrop: false,
      closePolicy: SNACKBAR_OVERLAY_CLOSE_POLICY,
      closeAnimationDurationMs: options.closeAnimationDurationMs ?? 0,
      width: options.width,
      maxWidth: this.resolveClampedMaxWidth(
        options.maxWidth,
        options.padding ?? DEFAULT_SNACKBAR_PADDING,
      ),
      panelClass: options.panelClass,
      panelStyle: options.panelStyle,
      ariaLabel: options.ariaLabel,
      ariaLabelledBy: options.ariaLabelledBy,
    };
  }

  private resolveClampedMaxWidth(maxWidth: string | undefined, paddingPx: number): string {
    const viewportCap = `max(0px, calc(100vw - ${Math.max(0, paddingPx) * 2}px))`;
    if (!maxWidth || maxWidth.trim().length === 0) return viewportCap;

    return `min(${maxWidth}, ${viewportCap})`;
  }

  private handleAttachResult(
    opened: boolean,
    params: {
      overlayRef: { dispose: () => void; getPaneElement: () => HTMLElement | null };
      placement: SnackbarPlacement;
      snackbarRef: SnackbarAutoCloseRef;
      groupId: string | undefined;
      portal: ComponentPortal<unknown>;
      content: TemplateRef<unknown> | Type<unknown>;
      options: SnackbarOpenOptions;
      duration: number;
    },
  ): void {
    const { overlayRef, placement, snackbarRef, groupId, portal, content, options, duration } =
      params;
    if (!opened) {
      this.applyVisibilityChanges(this.stack.unregisterRef(placement, snackbarRef));
      if (groupId) this.stack.unregisterRefByGroupId(groupId, snackbarRef);
      overlayRef.dispose();
      this.stack.repositionPlacementStack(placement);

      return;
    }
    this.setupAttachedPane(overlayRef, placement, snackbarRef);
    this.applyComponentBindings(portal, content, options, snackbarRef);
    this.scheduleAutoClose(snackbarRef, duration, {
      pauseOnHover: options.pauseOnHover ?? false,
      showProgress: options.showProgress ?? false,
    });
    // Keep stack layout correct when visibility queue changes during open.
    this.stack.repositionPlacementStack(placement);
  }

  private setupAttachedPane(
    overlayRef: { getPaneElement: () => HTMLElement | null },
    placement: SnackbarPlacement,
    snackbarRef: SnackbarInternalRef,
  ): void {
    const pane = overlayRef.getPaneElement();
    if (!pane) return;

    registerCloseableRef(pane, snackbarRef);
    pane.setAttribute('role', 'status');
    pane.setAttribute('aria-live', 'polite');
    pane.setAttribute('aria-atomic', 'true');
    this.stack.stackMetrics.trackPane(snackbarRef, pane, () =>
      this.stack.repositionPlacementStack(placement),
    );
    this.applyPaneHiddenState(snackbarRef, this.stack.isRefHidden(snackbarRef));
  }

  // ---------------------------------------------------------------------------
  // Private: component bindings
  // ---------------------------------------------------------------------------

  private applyComponentBindings(
    portal: ComponentPortal<unknown>,
    content: TemplateRef<unknown> | Type<unknown>,
    options: SnackbarOpenOptions,
    ref: SnackbarInternalRef,
  ): void {
    if (!isComponent(content)) return;
    const hasInputs = options.inputs ? Object.keys(options.inputs).length > 0 : false;
    const hasOutputs = options.outputs ? Object.keys(options.outputs).length > 0 : false;
    if (!hasInputs && !hasOutputs) return;

    const compRef = portal.componentRef;

    if (!compRef) return;

    if (hasInputs && options.inputs) {
      applyComponentInputs(compRef, content, options.inputs);
    }

    if (hasOutputs && options.outputs) {
      const subs = subscribeComponentOutputs(compRef, content, options.outputs);

      if (subs.length > 0) {
        subscribeOnceAfterClosed(ref, () => unsubscribeComponentOutputSubscriptions(subs));
      }
    }
  }

  private resolveMaxVisibleSnackbars(options: SnackbarOpenOptions): number | undefined {
    const value = options.maxVisibleSnackbars ?? this.defaults?.maxVisibleSnackbars;

    if (value == null) return undefined;

    if (!Number.isFinite(value)) return undefined;

    return Math.floor(value);
  }

  private resolvePlacementMaxVisibleForOpen(
    placement: SnackbarPlacement,
    options: SnackbarOpenOptions,
  ): number | undefined {
    const requested = this.resolveMaxVisibleSnackbars(options);
    const hasActiveRefs = this.stack.hasRefsForPlacement(placement);
    const activeCap = this.stack.getPlacementMaxVisible(placement);

    if (!hasActiveRefs || activeCap === undefined || activeCap === requested) {
      return requested;
    }
    if (isDevMode()) {
      warnOnce(
        `nxr-snackbar-max-visible-conflict-${placement}`,
        [
          `SNACKBAR maxVisibleSnackbars conflict for placement "${placement}".`,
          `Active cap (${activeCap}) is kept until this placement queue is drained.`,
          `Requested value (${requested}) will apply to subsequent queues.`,
        ].join(' '),
      );
    }

    return activeCap;
  }

  private applyVisibilityChanges(changes: readonly SnackbarVisibilityChange[]): void {
    for (const change of changes) {
      this.applyPaneHiddenState(change.ref, change.hidden);
    }
  }

  private applyPaneHiddenState(ref: SnackbarInternalRef, hidden: boolean): void {
    const pane = ref.getPaneElement();
    if (!pane) return;

    if (hidden) {
      pane.setAttribute('data-hidden', 'true');
      pane.setAttribute('aria-hidden', 'true');
      pane.setAttribute(ATTR_HIDDEN, '');
      pane.setAttribute(ATTR_INERT, '');
      pane.style.pointerEvents = 'none';

      return;
    }

    pane.removeAttribute('data-hidden');
    pane.removeAttribute('aria-hidden');
    pane.removeAttribute(ATTR_HIDDEN);
    pane.removeAttribute(ATTR_INERT);
    pane.style.removeProperty('pointer-events');
  }

  private scheduleAutoClose(
    ref: SnackbarAutoCloseRef,
    duration: number,
    options: { pauseOnHover: boolean; showProgress: boolean },
  ): void {
    const pane = ref.getPaneElement();
    const setPaneProgress = (progress: number): void => {
      if (!options.showProgress || !pane) return;
      pane.style.setProperty('--nxr-snackbar-progress', progress.toFixed(4));
    };
    const clearPaneProgress = (): void => {
      if (!options.showProgress || !pane) return;
      pane.style.removeProperty('--nxr-snackbar-progress');
    };

    if (duration <= 0) {
      ref.bindAutoCloseControls(null);
      ref.setAutoCloseState({
        durationMs: 0,
        remainingMs: 0,
        progress: 0,
        paused: false,
      });
      clearPaneProgress();

      return;
    }

    let remainingMs = duration;
    let endAt = Date.now() + duration;
    let paused = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const updateState = (): void => {
      const now = Date.now();
      if (!paused) {
        remainingMs = Math.max(0, endAt - now);
      }
      const progress = Math.max(0, Math.min(1, remainingMs / duration));
      ref.setAutoCloseState({
        durationMs: duration,
        remainingMs,
        progress,
        paused,
      });
      setPaneProgress(progress);
    };

    const clearTimeoutIfNeeded = (): void => {
      if (timeoutId != null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    const scheduleTimeout = (): void => {
      clearTimeoutIfNeeded();
      timeoutId = setTimeout(() => ref.close(), remainingMs);
    };

    const pause = (): void => {
      if (paused) return;

      remainingMs = Math.max(0, endAt - Date.now());
      paused = true;
      clearTimeoutIfNeeded();
      updateState();
    };

    const resume = (): void => {
      if (!paused) return;
      if (remainingMs <= 0) {
        ref.close();

        return;
      }

      paused = false;
      endAt = Date.now() + remainingMs;
      scheduleTimeout();
      updateState();
    };

    const onMouseEnter = (): void => pause();
    const onMouseLeave = (): void => resume();

    ref.bindAutoCloseControls({ pause, resume });
    scheduleTimeout();
    updateState();
    if (options.showProgress) {
      intervalId = setInterval(() => {
        if (!paused) updateState();
      }, AUTO_CLOSE_PROGRESS_TICK_MS);
    }

    if (options.pauseOnHover && pane) {
      pane.addEventListener('mouseenter', onMouseEnter);
      pane.addEventListener('mouseleave', onMouseLeave);
    }

    subscribeOnceAfterClosed(ref, () => {
      clearTimeoutIfNeeded();
      if (intervalId != null) {
        clearInterval(intervalId);
      }
      if (options.pauseOnHover && pane) {
        pane.removeEventListener('mouseenter', onMouseEnter);
        pane.removeEventListener('mouseleave', onMouseLeave);
      }
      clearPaneProgress();
      ref.bindAutoCloseControls(null);
    });
  }
}

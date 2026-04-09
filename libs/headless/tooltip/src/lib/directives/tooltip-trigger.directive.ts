import {
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  Injector,
  input,
  type OnDestroy,
  signal,
  ViewContainerRef,
} from '@angular/core';
import {
  CLOSE_REASON_PROGRAMMATIC,
  createAnchoredOverlayConfig,
  createOutsideClickListener,
  createTriggerDelay,
  DATA_ATTR_TOOLTIP_BRIDGE,
  getContainingOverlayRef,
  handleAnchoredHoverLeave,
  type HoverBridge,
  isInsideOverlayPaneOrBridge,
  NoopFocusStrategy,
  OverlayService,
  OVERLAY_SELECTOR_PANE,
  PANE_ID_PREFIX_TOOLTIP,
  runWithOpenDelay,
  setupAnchoredOverlayOpenedState,
  type OverlayRef,
  type Placement,
  triggerIncludes as overlayTriggerIncludes,
  type ViewportBoundaries,
} from '@nexora-ui/overlay';

import {
  clearTooltipPaneInstantAnimationStyles,
  createTooltipContentHostPortal,
  prepareTooltipPaneForHandoffClose,
  resolveTooltipScrollStrategy,
  TOOLTIP_OVERLAY_CLOSE_POLICY,
} from '../internal';
import { TooltipWarmupService } from '../services/tooltip-warmup.service';

import {
  DEFAULT_TOOLTIP_DEFAULTS_CONFIG,
  TOOLTIP_DEFAULTS_CONFIG,
} from './tooltip-defaults.config';

export type TooltipTrigger = 'hover' | 'focus';
export type TooltipTriggerInput = TooltipTrigger | TooltipTrigger[];

/**
 * Directive that shows a tooltip anchored to the host element on hover/focus.
 *
 * Uses the overlay system for positioning, viewport flipping/clamping, and arrow placement.
 * No focus trap — tooltips are supplementary, non-interactive by default.
 *
 * @example
 * ```html
 * <button nxrTooltip="Save changes">💾</button>
 *
 * <button
 *   nxrTooltip="Delete item"
 *   nxrTooltipPlacement="bottom"
 *   [nxrTooltipDisplayArrow]="true"
 *   [nxrTooltipOpenDelay]="300"
 * >🗑️</button>
 * ```
 */
@Directive({
  selector: '[nxrTooltip]',
  standalone: true,
  exportAs: 'nxrTooltip',
  host: {
    '(focus)': 'onHostFocus()',
    '(blur)': 'onHostBlur()',
    '(mouseenter)': 'onHostMouseEnter()',
    '(mouseleave)': 'onHostMouseLeave($event)',
    '[attr.aria-describedby]': 'paneId()',
  },
})
export class TooltipTriggerDirective implements OnDestroy {
  private readonly hostRef = inject(ElementRef<HTMLElement>);
  private readonly overlay = inject(OverlayService);
  private readonly vcr = inject(ViewContainerRef);
  private readonly injector = inject(Injector);
  private readonly warmup = inject(TooltipWarmupService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly defaults = {
    ...DEFAULT_TOOLTIP_DEFAULTS_CONFIG,
    ...(inject(TOOLTIP_DEFAULTS_CONFIG, { optional: true }) ?? {}),
  };

  /** Tooltip text. */
  readonly nxrTooltip = input.required<string>();

  /** Preferred placement. Default: `'top'`. */
  readonly nxrTooltipPlacement = input<Placement>(this.defaults.placement ?? 'top');

  /** Gap in px between anchor and tooltip. Default: `8`. */
  readonly nxrTooltipOffset = input<number>(this.defaults.offset ?? 8);

  /** When to open. Default: `['hover', 'focus']`. */
  readonly nxrTooltipTrigger = input<TooltipTriggerInput>(
    this.defaults.trigger ?? ['hover', 'focus'],
  );

  /** Show the arrow. Default: `true`. */
  readonly nxrTooltipDisplayArrow = input<boolean>(this.defaults.displayArrow ?? true);

  /** Delay in ms before opening. Skipped during warm-up. Default: `200`. */
  readonly nxrTooltipOpenDelay = input<number>(this.defaults.openDelay ?? 200);

  /** Delay in ms before closing. Default: `0`. */
  readonly nxrTooltipCloseDelay = input<number>(this.defaults.closeDelay ?? 0);

  /** Delay in ms before closing on hover leave. Used when `nxrTooltipCloseDelay` is not set or 0. Default: `100`. */
  readonly nxrTooltipHoverCloseDelay = input<number>(this.defaults.hoverCloseDelay ?? 100);

  /** Delay in ms before closing on focus blur. Used when `nxrTooltipCloseDelay` is not set or 0. */
  readonly nxrTooltipFocusCloseDelay = input<number | undefined>(this.defaults.focusCloseDelay);

  /** When `true`, hovering the tooltip content keeps it open. Default: `false`. */
  readonly nxrTooltipAllowContentHover = input<boolean>(this.defaults.allowContentHover ?? false);

  /** When `true`, direct tooltip-to-tooltip handoff opens instantly (no delay/enter animation). Default: `true`. */
  readonly nxrTooltipInstantOnHandoff = input<boolean>(this.defaults.instantOnHandoff ?? true);

  /** Prevents opening when `true`. Default: `false`. */
  readonly nxrTooltipDisabled = input<boolean>(this.defaults.disabled ?? false);

  /** CSS class(es) applied to the tooltip pane for styling. */
  readonly nxrTooltipPanelClass = input<string | string[] | undefined>(this.defaults.panelClass);
  /** Inline styles applied to the tooltip pane. Prefer `nxrTooltipPanelClass` for reusable styling. */
  readonly nxrTooltipPanelStyle = input<Record<string, string> | undefined>(
    this.defaults.panelStyle,
  );

  /** Arrow dimensions in px. Omit to use default 12×6. */
  readonly nxrTooltipArrowSize = input<{ width: number; height: number } | undefined>(
    this.defaults.arrowSize,
  );

  /** Duration in ms for close animation. Default: `150`. Set `0` for instant close. */
  readonly nxrTooltipCloseAnimationDurationMs = input<number>(
    this.defaults.closeAnimationDurationMs ?? 150,
  );

  /**
   * When `true`, the tooltip is clamped to the viewport so it stays visible when the
   * anchor scrolls partially off-screen. When `false`, the tooltip follows the anchor.
   * Default: `false`.
   */
  readonly nxrTooltipClampToViewport = input<boolean>(this.defaults.clampToViewport ?? false);

  /** Scroll strategy: `'noop'` (stick to trigger) or `'reposition'` (viewport-aware). Default: `'noop'`. */
  readonly nxrTooltipScrollStrategy = input<'noop' | 'reposition'>(
    this.defaults.scrollStrategy ?? 'noop',
  );

  /** Only for reposition strategy; ignored otherwise. When `true` (default), keep tooltip in viewport. */
  readonly nxrTooltipMaintainInViewport = input<boolean>(this.defaults.maintainInViewport ?? true);

  /** Viewport inset in px for tooltip max dimensions. */
  readonly nxrTooltipBoundaries = input<ViewportBoundaries | undefined>(this.defaults.boundaries);

  /** Whether the tooltip is currently open. */
  readonly isOpen = signal(false);

  /** Pane element id when open; `null` when closed. Used for `aria-describedby`. */
  readonly paneId = signal<string | null>(null);

  private overlayRef: OverlayRef | null = null;
  private opening = false;
  private cancelPendingOpen = false;
  private openedBy: TooltipTrigger | null = null;
  private readonly openDelay = createTriggerDelay();
  private readonly focusCloseDelay = createTriggerDelay();
  private hoverBridge: HoverBridge | null = null;
  private hoverBridgeCleanup: (() => void) | null = null;
  private isNestedOverlay = false;
  private outsideClickCleanup: (() => void) | null = null;
  private readonly tooltipInstanceId = this.warmup.createInstanceId();
  private openWithoutAnimation = false;
  private isInstantOpenActive = false;

  // ---------------------------------------------------------------------------
  // Host event handlers
  // ---------------------------------------------------------------------------

  onHostFocus(): void {
    if (!this.triggerIncludes('focus') || this.nxrTooltipDisabled()) return;

    this.prepareOpenAttempt();
    this.scheduleOpen('focus', this.consumeInstantHandoff());
  }

  onHostBlur(): void {
    if (!this.triggerIncludes('focus')) return;

    this.openDelay.cancel();
    this.focusCloseDelay.cancel();

    if (this.opening) {
      this.cancelPendingOpen = true;

      return;
    }

    if (this.openedBy !== 'focus' || !this.overlayRef) return;

    this.restoreInstantOpenStyles();
    this.scheduleFocusClose();
  }

  onHostMouseEnter(): void {
    if (!this.triggerIncludes('hover') || this.nxrTooltipDisabled()) return;

    this.prepareOpenAttempt();
    this.scheduleOpen('hover', this.consumeInstantHandoff());
  }

  onHostMouseLeave(event: MouseEvent): void {
    this.restoreInstantOpenStyles();
    handleAnchoredHoverLeave(event, {
      openDelay: this.openDelay,
      isHoverTrigger: () => this.triggerIncludes('hover'),
      openedBy: this.openedBy,
      overlayRef: this.overlayRef,
      getTriggerElement: () => this.hostRef.nativeElement,
      getPane: () => this.overlayRef?.getPaneElement() ?? null,
      allowContentHover: this.nxrTooltipAllowContentHover(),
      isNestedOverlay: this.isNestedOverlay,
      getCloseDelay: () => this.getHoverCloseDelay(),
      hoverBridge: this.hoverBridge,
      close: () => this.close(),
      opening: this.opening,
      onOpeningLeave: () => (this.cancelPendingOpen = true),
    });
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  open(trigger: TooltipTrigger = 'hover'): void {
    if (this.overlayRef || this.opening) return;
    if (!this.nxrTooltip()) return;

    this.opening = true;
    this.openedBy = trigger;

    const anchor = this.hostRef.nativeElement;
    const portal = createTooltipContentHostPortal(
      this.vcr,
      this.injector,
      this.nxrTooltip(),
      this.nxrTooltipDisplayArrow(),
    );
    const config = createAnchoredOverlayConfig(this.buildOverlayConfig(anchor));
    const ref = this.overlay.create(config);

    ref.attach(portal).then((opened) => {
      this.opening = false;
      if (!this.shouldKeepOpenedOverlay(opened)) {
        this.openedBy = null;
        ref.dispose();

        return;
      }
      this.overlayRef = ref;
      this.isInstantOpenActive = this.openWithoutAnimation;
      this.setupOpenedState(ref);
      this.openWithoutAnimation = false;
    });
  }

  private shouldKeepOpenedOverlay(opened: boolean): boolean {
    const wasCancelled = this.cancelPendingOpen;
    this.cancelPendingOpen = false;

    return opened && !wasCancelled;
  }

  close(): void {
    this.overlayRef?.close(CLOSE_REASON_PROGRAMMATIC);
  }

  ngOnDestroy(): void {
    this.cancelPendingOpen = true;
    this.openDelay.cancel();
    this.focusCloseDelay.cancel();
    this.hoverBridgeCleanup?.();
    this.hoverBridgeCleanup = null;
    this.hoverBridge = null;
    this.removeOutsideClickListener();
    this.warmup.unregister(this.tooltipInstanceId);
    this.overlayRef?.dispose();
    this.overlayRef = null;
    this.isOpen.set(false);
    this.paneId.set(null);
  }

  // ---------------------------------------------------------------------------
  // Private: trigger helpers
  // ---------------------------------------------------------------------------

  private triggerIncludes(t: TooltipTrigger): boolean {
    return overlayTriggerIncludes(this.nxrTooltipTrigger(), t);
  }

  // ---------------------------------------------------------------------------
  // Private: open flow — config
  // ---------------------------------------------------------------------------

  private prepareOpenAttempt(): void {
    this.cancelPendingOpen = false;
    this.openDelay.cancel();
    this.hoverBridge?.cancelClose();
  }

  private consumeInstantHandoff(): boolean {
    if (!this.nxrTooltipInstantOnHandoff()) return false;

    return this.warmup.requestHandoff(this.tooltipInstanceId);
  }

  private buildOverlayConfig(anchor: HTMLElement) {
    const panelStyle = this.nxrTooltipPanelStyle();
    const instantPanelStyle = this.openWithoutAnimation
      ? ({ transition: 'none', animation: 'none' } as Record<string, string>)
      : undefined;

    return {
      anchor,
      placement: this.nxrTooltipPlacement(),
      offset: this.nxrTooltipOffset(),
      clampToViewport: this.nxrTooltipClampToViewport(),
      hasBackdrop: false,
      closePolicy: TOOLTIP_OVERLAY_CLOSE_POLICY,
      scrollStrategy: resolveTooltipScrollStrategy(this.nxrTooltipScrollStrategy()),
      maintainInViewport: this.nxrTooltipMaintainInViewport(),
      boundaries: this.nxrTooltipBoundaries(),
      focusStrategy: new NoopFocusStrategy(),
      closeAnimationDurationMs: this.nxrTooltipCloseAnimationDurationMs(),
      parentRef: getContainingOverlayRef(anchor) ?? undefined,
      panelClass: this.nxrTooltipPanelClass(),
      panelStyle: instantPanelStyle ? { ...(panelStyle ?? {}), ...instantPanelStyle } : panelStyle,
      arrowSize: this.nxrTooltipArrowSize(),
    };
  }

  // ---------------------------------------------------------------------------
  // Private: timeout management
  // ---------------------------------------------------------------------------

  private getHoverCloseDelay(): number {
    return this.nxrTooltipCloseDelay() || this.nxrTooltipHoverCloseDelay();
  }

  private getFocusCloseDelay(): number {
    return (
      this.nxrTooltipCloseDelay() ||
      this.nxrTooltipFocusCloseDelay() ||
      this.nxrTooltipHoverCloseDelay()
    );
  }

  /** Schedules close for hover (bridge) or focus (timeout when no bridge). @internal */
  private scheduleFocusClose(): void {
    const delay = this.getFocusCloseDelay();
    if (this.hoverBridge) {
      if (delay > 0) this.hoverBridge.scheduleClose(delay);
      else this.close();

      return;
    }
    if (delay > 0) this.focusCloseDelay.schedule(delay, () => this.close());
    else this.close();
  }

  /** @internal */
  private scheduleOpen(trigger: TooltipTrigger, immediate = false): void {
    if (this.overlayRef) return;
    this.openWithoutAnimation = immediate;

    runWithOpenDelay(
      this.nxrTooltipOpenDelay(),
      () => {
        if (!this.overlayRef) this.open(trigger);
      },
      this.openDelay,
      { skipDelay: () => immediate },
    );
  }

  // ---------------------------------------------------------------------------
  // Private: overlay setup after open
  // ---------------------------------------------------------------------------

  /** @internal */
  private setupOpenedState(ref: OverlayRef): void {
    const anchor = this.hostRef.nativeElement;
    this.isNestedOverlay = anchor.closest(OVERLAY_SELECTOR_PANE) != null;

    const bridgeRef = { bridge: null as HoverBridge | null, cleanup: null as (() => void) | null };

    setupAnchoredOverlayOpenedState({
      ref,
      anchor,
      paneIdPrefix: PANE_ID_PREFIX_TOOLTIP,
      role: 'tooltip',
      isHoverTrigger: this.triggerIncludes('hover'),
      getHoverCloseDelay: () => this.getHoverCloseDelay(),
      onClose: () => this.close(),
      allowContentHover: this.nxrTooltipAllowContentHover(),
      bridgeAttr: DATA_ATTR_TOOLTIP_BRIDGE,
      onStateChange: ({ paneId, isOpen }) => {
        this.paneId.set(paneId);
        this.isOpen.set(isOpen);
      },
      onClosed: () => {
        this.warmup.notifyClosed(this.tooltipInstanceId);
        this.hoverBridgeCleanup?.();
        this.hoverBridgeCleanup = null;
        this.hoverBridge = null;
        this.removeOutsideClickListener();
        this.overlayRef = null;
        this.openedBy = null;
        this.isInstantOpenActive = false;
        this.isOpen.set(false);
        this.paneId.set(null);
      },
      bridgeRef,
      attachOutsideClick: () => this.attachOutsideClickListener(),
      destroyRef: this.destroyRef,
    });

    this.hoverBridge = bridgeRef.bridge;
    this.hoverBridgeCleanup = bridgeRef.cleanup;
    this.warmup.registerOpened(this.tooltipInstanceId, () => this.forceImmediateCloseForHandoff());
  }

  // ---------------------------------------------------------------------------
  // Private: outside click for focus-triggered tooltips
  // ---------------------------------------------------------------------------

  private attachOutsideClickListener(): void {
    this.removeOutsideClickListener();

    if (this.openedBy !== 'focus') return;

    this.outsideClickCleanup = createOutsideClickListener(
      this.hostRef.nativeElement,
      () => this.overlayRef?.getPaneElement(),
      () => this.close(),
      { considerInside: (target) => isInsideOverlayPaneOrBridge(target) },
    );
  }

  private removeOutsideClickListener(): void {
    this.outsideClickCleanup?.();
    this.outsideClickCleanup = null;
  }

  private forceImmediateCloseForHandoff(): void {
    this.cancelPendingOpen = true;
    this.openDelay.cancel();
    this.focusCloseDelay.cancel();
    this.hoverBridge?.cancelClose();

    if (!this.overlayRef) return;

    prepareTooltipPaneForHandoffClose(this.overlayRef);
    this.close();
  }

  private restoreInstantOpenStyles(): void {
    if (!this.isInstantOpenActive) return;

    clearTooltipPaneInstantAnimationStyles(this.overlayRef?.getPaneElement() ?? null);
    this.isInstantOpenActive = false;
  }
}

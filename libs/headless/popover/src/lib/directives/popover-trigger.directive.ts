import {
  DestroyRef,
  Directive,
  ElementRef,
  effect,
  inject,
  input,
  output,
  signal,
  type OnDestroy,
  type TemplateRef,
  type Type,
  ViewContainerRef,
} from '@angular/core';
import { getActiveElement } from '@nexora-ui/core';
import {
  createAnchoredOverlayConfig,
  createTriggerDelay,
  type OverlayDefaultsConfig,
  DEFAULT_OVERLAY_DEFAULTS_CONFIG,
  DEFAULT_FOCUS_CLOSE_DELAY_MS,
  DEFAULT_HOVER_CLOSE_DELAY_MS,
  type HoverBridge,
  isInsideOverlayPaneOrBridge,
  OverlayService,
  OVERLAY_DEFAULTS_CONFIG,
  OVERLAY_SELECTOR_PANE,
  type BeforeCloseCallback,
  type BeforeOpenCallback,
  type ClosePolicy,
  CLOSE_REASON_PROGRAMMATIC,
  type CloseReason,
  type OverlayRef,
  type Placement,
  triggerIncludes as overlayTriggerIncludes,
  type ViewportBoundaries,
} from '@nexora-ui/overlay';

import {
  ATTACH_RESOLUTION,
  type PopoverAnchoredOverlayInputs,
  type PopoverTriggerHost,
  buildPopoverAnchoredOverlayParams,
  createPopoverContentPortal,
  PopoverExternalAnchorState,
  PopoverFocusCloseCoordinator,
  PopoverOpenLifecycleState,
  popoverHandleBlur,
  popoverHandleClick,
  popoverHandleFocus,
  popoverHandleMouseEnter,
  popoverHandleMouseLeave,
} from '../internal';
import type { PopoverTrigger, PopoverTriggerInput } from '../types/popover-trigger-types';
import { POPOVER_DEFAULTS_CONFIG, type PopoverDefaultsConfig } from './popover-defaults.config';
import {
  buildPopoverDefaults,
  resolvePopoverOverlayVisualInputs,
} from './popover-trigger-overlay-defaults';
import {
  attachPopoverExternalAnchorListeners,
  getPopoverTriggerSignature,
  isPopoverAnchorHovered,
} from './popover-trigger-external-anchor';
import { buildPopoverOverlaySnapshot } from './popover-trigger-overlay-snapshot';
import { runPopoverTriggerOpenedLifecycle } from './popover-trigger-opened-lifecycle';
import {
  handlePopoverExternalAnchorEffect,
  syncPopoverAriaHasPopupEffect,
  syncPopoverExternalAnchorAriaEffect,
} from './popover-trigger-effects';
import { destroyPopoverTriggerState } from './popover-trigger-destroy';
import {
  clearPopoverFocusPaneListener,
  clearPopoverOutsideClickListener,
  createPopoverTriggerListenerState,
  replacePopoverFocusPaneListener,
  replacePopoverOutsideClickListener,
} from './popover-trigger-listener-state';

export type { PopoverTrigger, PopoverTriggerInput };

const POPOVER_BACKDROP_CLASS = 'nxr-popover-backdrop';

/**
 * Directive that opens a popover overlay anchored to the host element.
 *
 * Pass the panel content as a `TemplateRef` or a component `Type`. Use a component when the
 * trigger is inside portaled content (e.g. dialog) to avoid view-context issues. Close behavior:
 * - **click** → outside click / Escape
 * - **focus** → blur (with configurable delay)
 * - **hover** → mouse leave (with bridge gap and configurable delay)
 *
 * All visual aspects (panel classes, backdrop, arrow, animation) are fully customizable via inputs.
 *
 * @example
 * ```html
 * <button [nxrPopover]="panelTpl" nxrPopoverPlacement="bottom">Open</button>
 * <ng-template #panelTpl>Panel content here</ng-template>
 *
 * <!-- Or use a component when inside a dialog/overlay: -->
 * <button [nxrPopover]="MyPopoverContentComponent">Open</button>
 * ```
 */
@Directive({
  selector: '[nxrPopover]',
  standalone: true,
  exportAs: 'nxrPopover',
  host: {
    '(click)': 'onHostClick()',
    '(focus)': 'onHostFocus()',
    '(blur)': 'onHostBlur()',
    '(mouseenter)': 'onHostMouseEnter()',
    '(mouseleave)': 'onHostMouseLeave($event)',
    '[attr.aria-expanded]': 'isOpen()',
    '[attr.aria-haspopup]': 'ariaHasPopup()',
    '[attr.aria-controls]': 'paneId()',
  },
})
export class PopoverTriggerDirective implements OnDestroy {
  private readonly hostRef = inject(ElementRef<HTMLElement>);
  private readonly overlay = inject(OverlayService);
  private readonly vcr = inject(ViewContainerRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly overlayDefaults: OverlayDefaultsConfig = {
    ...DEFAULT_OVERLAY_DEFAULTS_CONFIG,
    ...(inject(OVERLAY_DEFAULTS_CONFIG, { optional: true }) ?? {}),
  };
  private readonly classMergeMode = this.overlayDefaults.classMergeMode ?? 'replace';
  private readonly styleMergeMode = this.overlayDefaults.styleMergeMode ?? 'replace';
  private readonly defaults: PopoverDefaultsConfig = buildPopoverDefaults(
    this.overlayDefaults,
    inject(POPOVER_DEFAULTS_CONFIG, { optional: true }) ?? undefined,
  );
  private readonly externalAnchorState = new PopoverExternalAnchorState();

  // ---------------------------------------------------------------------------
  // Inputs
  // ---------------------------------------------------------------------------

  /** Template or component for the popover panel content. Use a component when trigger is inside a dialog/overlay. */
  readonly nxrPopover = input.required<TemplateRef<unknown> | Type<unknown>>();

  /**
   * ViewContainerRef to use when creating the template portal. Only used when content is a TemplateRef.
   * When the trigger is inside portaled content (e.g. dialog), prefer passing a component instead.
   */
  readonly nxrPopoverViewContainerRef = input<ViewContainerRef | null | undefined>(undefined);

  /** When to open: click (default), focus, or hover. Pass an array to combine. */
  readonly nxrPopoverTrigger = input<PopoverTriggerInput>(this.defaults.trigger ?? 'click');

  /** Preferred placement (12 positions, RTL/LTR aware). Default: `'bottom-start'`. */
  readonly nxrPopoverPlacement = input<Placement>(this.defaults.placement ?? 'bottom-start');

  /** Whether to show a backdrop behind the popover. Default: `false`. */
  readonly nxrPopoverHasBackdrop = input<boolean>(this.defaults.hasBackdrop ?? false);

  /** Gap in px between anchor and panel. Default: `8`. */
  readonly nxrPopoverOffset = input<number>(this.defaults.offset ?? 8);

  /** When `true`, the trigger does not open the popover. Default: `false`. */
  readonly nxrPopoverDisabled = input<boolean>(this.defaults.disabled ?? false);

  /**
   * Optional external anchor element. When set, the popover positions to this element and
   * listens for trigger events (click/focus/hover) on it instead of the directive host.
   */
  readonly nxrPopoverAnchor = input<HTMLElement | null | undefined>(undefined);

  /** When `true`, close the popover on window scroll instead of repositioning. Default: `false`. */
  readonly nxrPopoverCloseOnScroll = input<boolean>(this.defaults.closeOnScroll ?? false);

  /**
   * Scroll strategy: `'noop'` (stick to trigger, height fixed), `'reposition'` (viewport-aware),
   * or `'close'` (close on scroll). Ignored when {@link nxrPopoverCloseOnScroll} is true. Default: `'noop'`.
   */
  readonly nxrPopoverScrollStrategy = input<'noop' | 'reposition' | 'close'>(
    this.defaults.scrollStrategy ?? 'noop',
  );

  /** Only for reposition strategy; ignored otherwise. When `true` (default), keep panel in viewport. */
  readonly nxrPopoverMaintainInViewport = input<boolean>(this.defaults.maintainInViewport ?? true);

  /** Viewport inset in px for panel max dimensions. */
  readonly nxrPopoverBoundaries = input<ViewportBoundaries | undefined>(this.defaults.boundaries);

  /** When `true`, keep the preferred placement and only clamp; don't flip. Default: `false`. */
  readonly nxrPopoverPreferredPlacementOnly = input<boolean>(
    this.defaults.preferredPlacementOnly ?? false,
  );

  /** Called before opening. Return `false` to prevent opening. */
  readonly nxrPopoverBeforeOpen = input<BeforeOpenCallback>();

  /** Called before closing. Return `false` to prevent closing. */
  readonly nxrPopoverBeforeClose = input<BeforeCloseCallback>();

  /** Delay in ms before opening (focus/hover only). Default: `0`. */
  readonly nxrPopoverOpenDelay = input<number>(this.defaults.openDelay ?? 0);

  /** Delay in ms before closing. When set, overrides both hover and focus delays. */
  readonly nxrPopoverCloseDelay = input<number | undefined>(this.defaults.closeDelay);

  /** Delay in ms before closing on hover leave. Used when `nxrPopoverCloseDelay` is not set. Default: `100`. */
  readonly nxrPopoverHoverCloseDelay = input<number>(
    this.defaults.hoverCloseDelay ?? DEFAULT_HOVER_CLOSE_DELAY_MS,
  );

  /** Delay in ms before closing on focus blur. Used when `nxrPopoverCloseDelay` is not set. Default: `150`. */
  readonly nxrPopoverFocusCloseDelay = input<number>(
    this.defaults.focusCloseDelay ?? DEFAULT_FOCUS_CLOSE_DELAY_MS,
  );

  /** When hover trigger: if `true`, hovering the panel or gap keeps the popover open. Default: `true`. */
  readonly nxrPopoverAllowContentHover = input<boolean>(this.defaults.allowContentHover ?? true);

  /** CSS class(es) applied to the popover pane. */
  readonly nxrPopoverPanelClass = input<string | string[] | undefined>(undefined);
  /** Inline styles applied to the popover pane. Prefer `nxrPopoverPanelClass` for reusable styling. */
  readonly nxrPopoverPanelStyle = input<Record<string, string> | undefined>(undefined);
  /** CSS class(es) applied to the popover backdrop (when `nxrPopoverHasBackdrop` is true). */
  readonly nxrPopoverBackdropClass = input<string | string[] | undefined>(undefined);
  /** Generic alias backdrop class input supported across overlay components/directives. */
  readonly nxrBackdropClass = input<string | string[] | undefined>(undefined);
  /** Inline styles applied to the popover backdrop. */
  readonly nxrPopoverBackdropStyle = input<Record<string, string> | undefined>(undefined);
  /** Generic alias backdrop style input supported across overlay components/directives. */
  readonly nxrBackdropStyles = input<Record<string, string> | undefined>(undefined);

  /** Duration in ms to wait for close animation before removing. `0` = instant. Default: `0`. */
  readonly nxrPopoverCloseAnimationDurationMs = input<number>(
    this.defaults.closeAnimationDurationMs ?? 0,
  );

  /** Arrow dimensions in px. Omit to use default 12x6. */
  readonly nxrPopoverArrowSize = input<{ width: number; height: number } | undefined>(
    this.defaults.arrowSize,
  );

  // ---------------------------------------------------------------------------
  // Sizing inputs — all optional, popover sizes to content by default.
  // When maxWidth/maxHeight are provided, the engine caps them at 100vw/100vh.
  // ---------------------------------------------------------------------------

  /** Explicit panel width (e.g. `'300px'`). Default: auto (content-based). */
  readonly nxrPopoverWidth = input<string | undefined>(this.defaults.width);

  /** Explicit panel height (e.g. `'200px'`). Default: auto (content-based). */
  readonly nxrPopoverHeight = input<string | undefined>(this.defaults.height);

  /** Minimum panel width (e.g. `'150px'`). */
  readonly nxrPopoverMinWidth = input<string | undefined>(this.defaults.minWidth);

  /** Maximum panel width (e.g. `'400px'`). Capped by viewport. */
  readonly nxrPopoverMaxWidth = input<string | undefined>(this.defaults.maxWidth);

  /** Minimum panel height (e.g. `'100px'`). */
  readonly nxrPopoverMinHeight = input<string | undefined>(this.defaults.minHeight);

  /** Maximum panel height (e.g. `'300px'`). Capped by viewport. */
  readonly nxrPopoverMaxHeight = input<string | undefined>(this.defaults.maxHeight);

  /**
   * When `true`, the popover panel width is set to match the anchor element's width.
   * Useful for autocomplete, combobox, and select patterns where the dropdown should
   * be the same width as the trigger. Takes precedence over `nxrPopoverWidth`.
   *
   * Default: `false`.
   */
  readonly nxrPopoverMatchAnchorWidth = input<boolean>(this.defaults.matchAnchorWidth ?? false);

  /**
   * When `true` (default), the popover panel is clamped to the viewport so it stays
   * visible even when the anchor scrolls partially off-screen.
   * When `false`, the panel follows the anchor out of the viewport.
   */
  readonly nxrPopoverClampToViewport = input<boolean>(this.defaults.clampToViewport ?? true);

  /**
   * Override the close policy for the overlay. When omitted, the popover uses a sensible default:
   * `escape: 'top'`, `outside: 'top'`, `backdrop: hasBackdrop ? 'self' : 'none'`.
   */
  readonly nxrPopoverClosePolicy = input<Partial<ClosePolicy> | undefined>(undefined);

  /**
   * ARIA role for the popover pane. Default: `'dialog'`.
   * Set to `'menu'`, `'listbox'`, `'tooltip'`, etc. for semantic correctness.
   */
  readonly nxrPopoverRole = input<string>(this.defaults.role ?? 'dialog');

  // ---------------------------------------------------------------------------
  // Outputs
  // ---------------------------------------------------------------------------

  /** Emitted when the popover has finished opening. */
  readonly nxrPopoverOpened = output();

  /** Emitted when the popover has closed (with the close reason). */
  readonly nxrPopoverClosed = output<CloseReason>();

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  /** Whether the popover is currently open. */
  readonly isOpen = signal(false);

  /** Pane element id when open; `null` when closed. Used for `aria-controls`. */
  readonly paneId = signal<string | null>(null);
  /** Mirrors popup semantics on trigger for AT based on configured pane role. */
  readonly ariaHasPopup = signal<string>('dialog');

  private overlayRef: OverlayRef | null = null;
  private readonly openState = new PopoverOpenLifecycleState();
  private readonly openDelay = createTriggerDelay();
  private readonly focusClose = new PopoverFocusCloseCoordinator();
  private hoverBridge: HoverBridge | null = null;
  private hoverBridgeCleanup: (() => void) | null = null;
  private isNestedOverlay = false;
  private readonly listenerState = createPopoverTriggerListenerState();

  /**
   * Stable delegate for {@link popoverHandleClick} / focus / hover handlers (one object, no per-event allocation).
   * Mutable state is read via getters / `getIsNestedOverlay` at call time.
   */
  private readonly popoverActionHost: PopoverTriggerHost = {
    triggerIncludes: (t) => this.triggerIncludes(t),
    nxrPopoverDisabled: () => this.nxrPopoverDisabled(),
    nxrPopoverOpenDelay: () => this.nxrPopoverOpenDelay(),
    nxrPopoverAllowContentHover: () => this.nxrPopoverAllowContentHover(),
    getOverlayRef: () => this.overlayRef,
    open: (trigger) => this.open(trigger),
    close: () => this.close(),
    getOpenedBy: () => this.openState.getOpenedBy(),
    openDelay: this.openDelay,
    focusClose: this.focusClose,
    scheduleFocusCloseCheck: () => this.scheduleFocusCloseCheck(),
    getHoverCloseDelay: () => this.getHoverCloseDelay(),
    getAnchorElement: () => this.getAnchorElement(),
    getIsNestedOverlay: () => this.isNestedOverlay,
    getHoverBridge: () => this.hoverBridge,
  };

  constructor() {
    effect(() => {
      handlePopoverExternalAnchorEffect({
        externalAnchorState: this.externalAnchorState,
        anchor: this.nxrPopoverAnchor() ?? null,
        triggerKey: getPopoverTriggerSignature(this.nxrPopoverTrigger()),
        isOverlayOpen: this.overlayRef != null,
        closeOverlay: () => this.close(),
        attachListeners: (externalAnchor) => this.attachExternalAnchorListeners(externalAnchor),
        hoverEnabled: this.triggerIncludes('hover'),
        disabled: this.nxrPopoverDisabled(),
        isAnchorHovered: (externalAnchor) => isPopoverAnchorHovered(externalAnchor),
        onOpenHoveredAnchor: () => popoverHandleMouseEnter(this.popoverActionHost),
      });
    });

    effect(() => {
      syncPopoverExternalAnchorAriaEffect({
        externalAnchorState: this.externalAnchorState,
        anchor: this.nxrPopoverAnchor() ?? null,
        isOpen: this.isOpen(),
        paneId: this.paneId(),
      });
    });

    effect(() => {
      syncPopoverAriaHasPopupEffect({
        role: this.nxrPopoverRole(),
        setAriaHasPopup: (value) => this.ariaHasPopup.set(value),
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Host event handlers
  // ---------------------------------------------------------------------------

  onHostClick(): void {
    if (this.hasExternalAnchor()) return;
    popoverHandleClick(this.popoverActionHost);
  }

  onHostFocus(): void {
    if (this.hasExternalAnchor()) return;
    popoverHandleFocus(this.popoverActionHost);
  }

  onHostBlur(): void {
    if (this.hasExternalAnchor()) return;
    popoverHandleBlur(this.popoverActionHost);
  }

  onHostMouseEnter(): void {
    if (this.hasExternalAnchor()) return;
    popoverHandleMouseEnter(this.popoverActionHost);
  }

  onHostMouseLeave(event: MouseEvent): void {
    if (this.hasExternalAnchor()) return;
    popoverHandleMouseLeave(this.popoverActionHost, event);
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /** Opens the popover programmatically. */
  open(trigger: PopoverTrigger = 'click'): void {
    if (!this.openState.canStartOpen(this.overlayRef != null)) return;
    this.openState.startOpen(trigger);

    const anchor = this.getAnchorElement();
    const portal = createPopoverContentPortal(
      this.nxrPopover(),
      this.nxrPopoverViewContainerRef() ?? this.vcr,
    );
    const config = createAnchoredOverlayConfig(
      buildPopoverAnchoredOverlayParams(anchor, this.snapshotAnchoredOverlayInputs()),
    );
    const ref = this.overlay.create(config);

    ref.attach(portal).then((opened) => {
      if (!this.isAttachReady(opened)) {
        ref.dispose();

        return;
      }
      this.overlayRef = ref;
      this.setupOpenedState(ref);
    });
  }

  /** Closes the popover if open. */
  close(): void {
    this.overlayRef?.close(CLOSE_REASON_PROGRAMMATIC);
  }

  ngOnDestroy(): void {
    destroyPopoverTriggerState({
      markDestroyed: () => this.openState.markDestroyed(),
      cancelOpenDelay: () => this.openDelay.cancel(),
      cancelFocusClose: () => this.focusClose.cancel(),
      destroyExternalAnchorState: () => this.externalAnchorState.destroy(),
      clearHoverBridgeState: () => this.clearHoverBridgeState(),
      clearFocusPaneListener: () => clearPopoverFocusPaneListener(this.listenerState),
      clearOutsideClickListener: () =>
        clearPopoverOutsideClickListener(this.listenerState, this.focusClose),
      disposeOverlayRef: () => this.overlayRef?.dispose(),
      clearOverlayRef: () => {
        this.overlayRef = null;
      },
      setIsOpen: (open) => this.isOpen.set(open),
      setPaneId: (paneId) => this.paneId.set(paneId),
    });
  }

  // ---------------------------------------------------------------------------
  // Private: trigger helpers
  // ---------------------------------------------------------------------------

  private triggerIncludes(t: PopoverTrigger): boolean {
    return overlayTriggerIncludes(this.nxrPopoverTrigger(), t);
  }

  /** Snapshot of inputs for {@link buildPopoverAnchoredOverlayParams} (single place for open config). */
  private snapshotAnchoredOverlayInputs(): PopoverAnchoredOverlayInputs {
    const visualInputs = resolvePopoverOverlayVisualInputs({
      baseBackdropClass: POPOVER_BACKDROP_CLASS,
      defaultsPanelClass: this.defaults.panelClass,
      defaultsPanelStyle: this.defaults.panelStyle,
      defaultsBackdropClass: this.defaults.backdropClass,
      defaultsBackdropStyle: this.defaults.backdropStyle,
      defaultsNxrBackdropClass: this.overlayDefaults.nxrBackdropClass,
      defaultsNxrBackdropStyles: this.overlayDefaults.nxrBackdropStyles,
      panelClassInput: this.nxrPopoverPanelClass(),
      panelStyleInput: this.nxrPopoverPanelStyle(),
      popoverBackdropClassInput: this.nxrPopoverBackdropClass(),
      popoverBackdropStyleInput: this.nxrPopoverBackdropStyle(),
      nxrBackdropClassInput: this.nxrBackdropClass(),
      nxrBackdropStylesInput: this.nxrBackdropStyles(),
      classMergeMode: this.classMergeMode,
      styleMergeMode: this.styleMergeMode,
    });

    return buildPopoverOverlaySnapshot({
      placement: this.nxrPopoverPlacement(),
      offset: this.nxrPopoverOffset(),
      clampToViewport: this.nxrPopoverClampToViewport(),
      preferredPlacementOnly: this.nxrPopoverPreferredPlacementOnly(),
      hasBackdrop: this.nxrPopoverHasBackdrop(),
      closePolicy: this.nxrPopoverClosePolicy(),
      closeOnScroll: this.nxrPopoverCloseOnScroll(),
      scrollStrategy: this.nxrPopoverScrollStrategy(),
      maintainInViewport: this.nxrPopoverMaintainInViewport(),
      boundaries: this.nxrPopoverBoundaries(),
      closeAnimationDurationMs: this.nxrPopoverCloseAnimationDurationMs(),
      panelClass: visualInputs.panelClass,
      panelStyle: visualInputs.panelStyle,
      backdropClass: visualInputs.backdropClass,
      backdropStyle: visualInputs.backdropStyle,
      arrowSize: this.nxrPopoverArrowSize(),
      beforeOpen: this.nxrPopoverBeforeOpen(),
      beforeClose: this.nxrPopoverBeforeClose(),
      matchAnchorWidth: this.nxrPopoverMatchAnchorWidth(),
      width: this.nxrPopoverWidth(),
      height: this.nxrPopoverHeight(),
      minWidth: this.nxrPopoverMinWidth(),
      maxWidth: this.nxrPopoverMaxWidth(),
      minHeight: this.nxrPopoverMinHeight(),
      maxHeight: this.nxrPopoverMaxHeight(),
    });
  }

  // ---------------------------------------------------------------------------
  // Private: timeout management
  // ---------------------------------------------------------------------------

  private getHoverCloseDelay(): number {
    return this.nxrPopoverCloseDelay() ?? this.nxrPopoverHoverCloseDelay();
  }

  private getFocusCloseDelay(): number {
    return this.nxrPopoverCloseDelay() ?? this.nxrPopoverFocusCloseDelay();
  }

  /** @internal */
  private scheduleFocusCloseCheck(): void {
    this.focusClose.schedule({
      delayMs: this.getFocusCloseDelay(),
      getActiveElement: () => getActiveElement(),
      getAnchorElement: () => this.getAnchorElement(),
      getPaneElement: () => this.overlayRef?.getPaneElement() ?? null,
      isInsideOverlayPaneOrBridge: (target) => isInsideOverlayPaneOrBridge(target),
      close: () => this.close(),
    });
  }

  // ---------------------------------------------------------------------------
  // Private: overlay setup after open
  // ---------------------------------------------------------------------------

  /** @internal */
  private setupOpenedState(ref: OverlayRef): void {
    const anchor = this.getAnchorElement();
    this.isNestedOverlay = anchor.closest(OVERLAY_SELECTOR_PANE) != null;

    const bridgeRef = runPopoverTriggerOpenedLifecycle({
      ref,
      anchor,
      role: this.nxrPopoverRole(),
      isHoverTrigger: this.triggerIncludes('hover'),
      getHoverCloseDelay: () => this.getHoverCloseDelay(),
      onClose: () => this.close(),
      allowContentHover: this.nxrPopoverAllowContentHover(),
      onStateChange: ({ paneId, isOpen }) => {
        this.paneId.set(paneId);
        const wasOpen = this.isOpen();
        this.isOpen.set(isOpen);
        if (isOpen && !wasOpen) this.nxrPopoverOpened.emit();
      },
      closeHandlerParams: {
        clearHoverBridge: () => this.clearHoverBridgeState(),
        removeFocusPaneListeners: () => clearPopoverFocusPaneListener(this.listenerState),
        removeOutsideClickListener: () =>
          clearPopoverOutsideClickListener(this.listenerState, this.focusClose),
        clearOverlayRef: () => {
          this.overlayRef = null;
        },
        clearOpenedBy: () => this.openState.clearOpenedBy(),
        setIsOpen: (open) => this.isOpen.set(open),
        setPaneId: (paneId) => this.paneId.set(paneId),
        consumeClosedTransition: () =>
          this.externalAnchorState.consumeClosedTransition(
            this.nxrPopoverAnchor() ?? null,
            this.triggerIncludes('hover'),
            (anchor) => isPopoverAnchorHovered(anchor),
          ),
        emitClosed: (closeReason) => this.nxrPopoverClosed.emit(closeReason),
        reopenHoveredAnchor: () => popoverHandleMouseEnter(this.popoverActionHost),
      },
      attachOutsideClick: () =>
        replacePopoverOutsideClickListener(this.listenerState, {
          openedBy: this.openState.getOpenedBy(),
          anchor: this.getAnchorElement(),
          getPane: () => this.overlayRef?.getPaneElement() ?? null,
          close: () => this.close(),
          focusClose: this.focusClose,
        }),
      attachFocusPaneListeners: () =>
        replacePopoverFocusPaneListener(this.listenerState, {
          isFocusTrigger: this.triggerIncludes('focus'),
          pane: this.overlayRef?.getPaneElement() ?? null,
          onFocusOut: () => this.scheduleFocusCloseCheck(),
        }),
      destroyRef: this.destroyRef,
    });

    this.hoverBridge = bridgeRef.bridge;
    this.hoverBridgeCleanup = bridgeRef.cleanup;
  }

  private clearHoverBridgeState(): void {
    this.hoverBridgeCleanup?.();
    this.hoverBridgeCleanup = null;
    this.hoverBridge = null;
  }

  private getAnchorElement(): HTMLElement {
    return this.nxrPopoverAnchor() ?? this.hostRef.nativeElement;
  }

  private hasExternalAnchor(): boolean {
    return this.nxrPopoverAnchor() != null;
  }

  private attachExternalAnchorListeners(anchor: HTMLElement): () => void {
    return attachPopoverExternalAnchorListeners({
      anchor,
      includesClick: this.triggerIncludes('click'),
      includesFocus: this.triggerIncludes('focus'),
      includesHover: this.triggerIncludes('hover'),
      host: this.popoverActionHost,
    });
  }

  private isAttachReady(opened: boolean): boolean {
    const resolution = this.openState.resolveAttach(opened, this.overlayRef != null);

    return resolution === ATTACH_RESOLUTION.READY;
  }
}

import { createTriggerDelay } from '@nexora-ui/overlay';

export interface FocusCloseScheduleParams {
  readonly delayMs: number;
  readonly getActiveElement: () => Element | null;
  readonly getAnchorElement: () => HTMLElement;
  readonly getPaneElement: () => HTMLElement | null;
  readonly isInsideOverlayPaneOrBridge: (target: Element) => boolean;
  readonly close: () => void;
}

/**
 * Coordinates delayed close on focus loss while preserving
 * pointer-down intent inside overlay pane/bridge content.
 */
export class PopoverFocusCloseCoordinator {
  private readonly closeDelay = createTriggerDelay();
  private lastPointerDownTarget: Element | null = null;

  /** Stores latest pointer-down target used to preserve focus-close intent. */
  onPointerDown(target: Element): void {
    this.lastPointerDownTarget = target;
  }

  /** Clears stored pointer-down target without touching timers. */
  clearPointerDown(): void {
    this.lastPointerDownTarget = null;
  }

  /** Cancels pending close checks and clears stored pointer-down state. */
  cancel(): void {
    this.closeDelay.cancel();
    this.lastPointerDownTarget = null;
  }

  /** Schedules a delayed close check driven by current focus and pointer intent. */
  schedule(params: FocusCloseScheduleParams): void {
    this.closeDelay.cancel();
    this.closeDelay.schedule(params.delayMs, () => {
      const active = params.getActiveElement();
      const pane = params.getPaneElement();
      const shouldSkip = this.shouldSkipClose(active, pane, params);
      this.clearPointerDown();
      if (shouldSkip) return;
      params.close();
    });
  }

  private shouldSkipClose(
    active: Element | null,
    pane: HTMLElement | null,
    params: Omit<FocusCloseScheduleParams, 'delayMs'>,
  ): boolean {
    const anchor = params.getAnchorElement();
    if (this.isFocusStillInside(active, anchor, pane)) return true;

    return this.wasPointerDownInsidePane(pane, params);
  }

  private isFocusStillInside(
    active: Element | null,
    anchor: HTMLElement,
    pane: HTMLElement | null,
  ): boolean {
    return active != null && (anchor.contains(active) || (pane != null && pane.contains(active)));
  }

  private wasPointerDownInsidePane(
    pane: HTMLElement | null,
    params: Omit<FocusCloseScheduleParams, 'delayMs'>,
  ): boolean {
    if (!this.lastPointerDownTarget || !pane) return false;

    return (
      pane.contains(this.lastPointerDownTarget) ||
      params.isInsideOverlayPaneOrBridge(this.lastPointerDownTarget)
    );
  }
}

export interface ExternalAnchorChangeParams {
  readonly anchor: HTMLElement | null;
  readonly triggerKey: string;
  readonly isOverlayOpen: boolean;
  readonly closeOverlay: () => void;
  readonly attachListeners: (anchor: HTMLElement) => () => void;
  readonly hoverEnabled: boolean;
  readonly disabled: boolean;
  readonly isAnchorHovered: (anchor: HTMLElement) => boolean;
}

export interface ExternalAnchorClosedTransition {
  readonly suppressClosedEmit: boolean;
  readonly reopenHoveredAnchor: boolean;
}

/**
 * Tracks external-anchor lifecycle for popover trigger directives:
 * - listener rebind on anchor/trigger changes
 * - ARIA cleanup for stale anchors
 * - hover handoff across anchor replacement while open
 */
export class PopoverExternalAnchorState {
  private externalAnchorCleanup: (() => void) | null = null;
  private lastExternalAnchor: HTMLElement | null = null;
  private lastExternalAnchorTriggerKey: string | null = null;
  private pendingHoverReopenAnchor: HTMLElement | null = null;

  /**
   * Rebinds external anchor listeners when anchor/trigger identity changes.
   * Returns whether hover-open should run immediately for an already-hovered new anchor.
   */
  handleChange(params: ExternalAnchorChangeParams): { openHoveredAnchorNow: boolean } {
    const {
      anchor,
      triggerKey,
      isOverlayOpen,
      closeOverlay,
      attachListeners,
      hoverEnabled,
      disabled,
      isAnchorHovered,
    } = params;

    if (anchor === this.lastExternalAnchor && triggerKey === this.lastExternalAnchorTriggerKey) {
      return { openHoveredAnchorNow: false };
    }

    this.cleanupCurrentAnchor();
    this.lastExternalAnchor = anchor;
    this.lastExternalAnchorTriggerKey = triggerKey;

    if (!anchor) {
      this.pendingHoverReopenAnchor = null;

      return { openHoveredAnchorNow: false };
    }

    if (isOverlayOpen) closeOverlay();
    this.externalAnchorCleanup = attachListeners(anchor);

    if (!hoverEnabled || disabled || !isAnchorHovered(anchor)) {
      this.pendingHoverReopenAnchor = null;

      return { openHoveredAnchorNow: false };
    }

    if (isOverlayOpen) {
      this.pendingHoverReopenAnchor = anchor;

      return { openHoveredAnchorNow: false };
    }

    this.pendingHoverReopenAnchor = null;

    return { openHoveredAnchorNow: true };
  }

  /** Mirrors popover ARIA state onto the current external anchor element. */
  syncAria(anchor: HTMLElement, isOpen: boolean, paneId: string | null): void {
    anchor.setAttribute('aria-haspopup', 'true');
    anchor.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    if (paneId) anchor.setAttribute('aria-controls', paneId);
    else anchor.removeAttribute('aria-controls');
  }

  /**
   * Consumes pending hover-reopen transition after overlay close.
   * Controls whether close emit should be suppressed and hover reopen should run.
   */
  consumeClosedTransition(
    currentAnchor: HTMLElement | null,
    hoverEnabled: boolean,
    isAnchorHovered: (anchor: HTMLElement) => boolean,
  ): ExternalAnchorClosedTransition {
    const pendingAnchor = this.pendingHoverReopenAnchor;
    if (!pendingAnchor || !hoverEnabled) {
      this.pendingHoverReopenAnchor = null;

      return { suppressClosedEmit: false, reopenHoveredAnchor: false };
    }

    this.pendingHoverReopenAnchor = null;
    if (currentAnchor !== pendingAnchor || !isAnchorHovered(pendingAnchor)) {
      return { suppressClosedEmit: false, reopenHoveredAnchor: false };
    }

    return { suppressClosedEmit: true, reopenHoveredAnchor: true };
  }

  /** Tears down listeners and clears ARIA/state. Safe to call repeatedly. */
  destroy(): void {
    this.cleanupCurrentAnchor();
    this.lastExternalAnchor = null;
    this.lastExternalAnchorTriggerKey = null;
    this.pendingHoverReopenAnchor = null;
  }

  private cleanupCurrentAnchor(): void {
    this.clearAnchorAria(this.lastExternalAnchor);
    this.externalAnchorCleanup?.();
    this.externalAnchorCleanup = null;
  }

  private clearAnchorAria(anchor: HTMLElement | null): void {
    if (!anchor) return;
    anchor.removeAttribute('aria-haspopup');
    anchor.removeAttribute('aria-expanded');
    anchor.removeAttribute('aria-controls');
  }
}

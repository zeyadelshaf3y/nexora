type OpenedBy = 'click' | 'focus' | 'hover';

export const ATTACH_RESOLUTION = {
  READY: 'ready',
  DESTROYED: 'destroyed',
  NOT_OPENED: 'not-opened',
  ALREADY_OPEN: 'already-open',
} as const;

type AttachResolution = (typeof ATTACH_RESOLUTION)[keyof typeof ATTACH_RESOLUTION];

/**
 * Manages open/close lifecycle flags for popover trigger directives.
 * Keeps state transitions explicit and prevents stale flag leakage.
 */
export class PopoverOpenLifecycleState {
  private opening = false;
  private openedBy: OpenedBy | null = null;
  private destroyed = false;

  /** True when opening can begin (not destroyed, not opening, no active overlay). */
  canStartOpen(hasOverlayRef: boolean): boolean {
    return !this.destroyed && !hasOverlayRef && !this.opening;
  }

  /** Marks an open attempt as in-progress and records trigger source. */
  startOpen(trigger: OpenedBy): void {
    this.opening = true;
    this.openedBy = trigger;
  }

  /**
   * Resolves attach result and returns what the caller should do next:
   * - ready: keep new ref
   * - destroyed/not-opened/already-open: dispose new ref
   */
  resolveAttach(opened: boolean, hasOverlayRef: boolean): AttachResolution {
    this.opening = false;
    if (this.destroyed) return this.resetAndResolve(ATTACH_RESOLUTION.DESTROYED);
    if (!opened) return this.resetAndResolve(ATTACH_RESOLUTION.NOT_OPENED);
    if (hasOverlayRef) return this.resetAndResolve(ATTACH_RESOLUTION.ALREADY_OPEN);

    return ATTACH_RESOLUTION.READY;
  }

  /** Returns which trigger opened the current overlay (if any). */
  getOpenedBy(): OpenedBy | null {
    return this.openedBy;
  }

  /** Clears opened-by marker when an overlay fully closes. */
  clearOpenedBy(): void {
    this.openedBy = null;
  }

  /** Marks lifecycle as destroyed and resets all open-related state. */
  markDestroyed(): void {
    this.destroyed = true;
    this.opening = false;
    this.openedBy = null;
  }

  private resetAndResolve(resolution: AttachResolution): AttachResolution {
    this.openedBy = null;

    return resolution;
  }
}

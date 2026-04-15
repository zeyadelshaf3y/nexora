import { observeResize } from '@nexora-ui/core';

/**
 * Tracks snackbar pane heights and keeps them fresh while panes are mounted.
 * This avoids repeated layout reads when computing stack offsets.
 */
export class SnackbarStackMetrics<TRef extends object> {
  private readonly paneHeightByRef = new Map<TRef, number>();
  private readonly paneCleanupByRef = new Map<TRef, () => void>();

  trackPane(ref: TRef, pane: HTMLElement, onHeightChange?: () => void): void {
    this.untrackPane(ref);
    this.paneHeightByRef.set(ref, pane.offsetHeight);

    const cleanup = observeResize(pane, (entry) => {
      this.paneHeightByRef.set(ref, entry.contentRect.height);
      onHeightChange?.();
    });

    this.paneCleanupByRef.set(ref, cleanup);
  }

  getHeight(ref: TRef): number | undefined {
    return this.paneHeightByRef.get(ref);
  }

  untrackPane(ref: TRef): void {
    this.paneCleanupByRef.get(ref)?.();
    this.paneCleanupByRef.delete(ref);
    this.paneHeightByRef.delete(ref);
  }
}

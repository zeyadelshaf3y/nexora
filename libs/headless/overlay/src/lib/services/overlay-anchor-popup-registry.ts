import { Injectable } from '@angular/core';

/**
 * Tracks anchored popups (popover, menu, select, combobox) per trigger element so
 * tooltips on the same anchor can close and stay suppressed while a popup is open.
 */
@Injectable({ providedIn: 'root' })
export class OverlayAnchorPopupRegistry {
  private readonly openCounts = new WeakMap<HTMLElement, number>();
  private readonly tooltipCloseListeners = new WeakMap<HTMLElement, Set<() => void>>();

  /** Whether any anchored popup is currently open on `anchor`. */
  isPopupOpen(anchor: HTMLElement): boolean {
    return (this.openCounts.get(anchor) ?? 0) > 0;
  }

  /**
   * Called when an anchored popup opens on `anchor`.
   * Increments the open count and invokes any registered tooltip close listeners.
   */
  markOpen(anchor: HTMLElement): void {
    const next = (this.openCounts.get(anchor) ?? 0) + 1;
    this.openCounts.set(anchor, next);

    const listeners = this.tooltipCloseListeners.get(anchor);
    if (!listeners) return;

    for (const listener of listeners) {
      listener();
    }
  }

  /** Called when an anchored popup closes on `anchor`. Safe to call multiple times. */
  markClosed(anchor: HTMLElement): void {
    const current = this.openCounts.get(anchor) ?? 0;
    if (current <= 0) return;

    const next = current - 1;
    if (next <= 0) {
      this.openCounts.delete(anchor);
    } else {
      this.openCounts.set(anchor, next);
    }
  }

  /**
   * Registers a callback invoked when a popup opens on the same anchor.
   * Returns an unregister function.
   */
  registerTooltip(anchor: HTMLElement, closeNow: () => void): () => void {
    let listeners = this.tooltipCloseListeners.get(anchor);
    if (!listeners) {
      listeners = new Set();
      this.tooltipCloseListeners.set(anchor, listeners);
    }

    listeners.add(closeNow);

    return () => {
      listeners?.delete(closeNow);
      if (listeners?.size === 0) {
        this.tooltipCloseListeners.delete(anchor);
      }
    };
  }
}

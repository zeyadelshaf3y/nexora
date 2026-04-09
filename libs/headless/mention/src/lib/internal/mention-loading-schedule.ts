import type { WritableSignal } from '@angular/core';

/**
 * Debounced / minimum-duration loading indicator for mention fetches.
 * Keeps timer fields out of {@link MentionControllerImpl}.
 */
export class MentionLoadingSchedule {
  private loadingDelayTimer: ReturnType<typeof setTimeout> | null = null;
  private loadingMinTimer: ReturnType<typeof setTimeout> | null = null;
  private loadingShownAtMs = 0;

  constructor(
    private readonly loading: WritableSignal<boolean>,
    private readonly loadingDebounceMs: number,
    private readonly minLoadingMs: number,
  ) {}

  clearTimers(): void {
    if (this.loadingDelayTimer) {
      clearTimeout(this.loadingDelayTimer);
      this.loadingDelayTimer = null;
    }

    if (this.loadingMinTimer) {
      clearTimeout(this.loadingMinTimer);
      this.loadingMinTimer = null;
    }
  }

  /** Clears timers and forces loading UI off (e.g. full panel reset). */
  reset(): void {
    this.clearTimers();
    this.loadingShownAtMs = 0;
    this.loading.set(false);
  }

  begin(): void {
    this.clearTimers();
    this.loadingShownAtMs = 0;

    if (this.loadingDebounceMs > 0) {
      this.loading.set(false);

      this.loadingDelayTimer = setTimeout(() => {
        this.loadingDelayTimer = null;
        this.loadingShownAtMs = Date.now();
        this.loading.set(true);
      }, this.loadingDebounceMs);

      return;
    }

    this.loadingShownAtMs = Date.now();
    this.loading.set(true);
  }

  end(): void {
    if (this.loadingDelayTimer) {
      clearTimeout(this.loadingDelayTimer);
      this.loadingDelayTimer = null;
      this.loading.set(false);

      return;
    }

    if (!this.loading()) return;

    const elapsed = this.loadingShownAtMs > 0 ? Date.now() - this.loadingShownAtMs : 0;
    const remaining = Math.max(0, this.minLoadingMs - elapsed);

    if (remaining === 0) {
      this.loading.set(false);

      return;
    }

    if (this.loadingMinTimer) {
      clearTimeout(this.loadingMinTimer);
    }

    this.loadingMinTimer = setTimeout(() => {
      this.loadingMinTimer = null;
      this.loading.set(false);
    }, remaining);
  }
}

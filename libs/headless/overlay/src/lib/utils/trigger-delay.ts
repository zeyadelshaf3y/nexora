/**
 * Simple delay manager for trigger directives (tooltip, popover). Avoids duplicated
 * timeout logic and ensures only one scheduled callback is pending at a time.
 * @internal
 */

export interface TriggerDelay {
  /** Schedules a callback after delayMs; cancels any previous schedule. */
  schedule(delayMs: number, fn: () => void): void;
  /** Cancels any scheduled callback. */
  cancel(): void;
}

/**
 * Creates a delay manager. Use one instance for "open" delay and another for "close" delay.
 */
export function createTriggerDelay(): TriggerDelay {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return {
    schedule(delayMs: number, fn: () => void): void {
      if (timeoutId != null) clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        timeoutId = null;

        fn();
      }, delayMs);
    },

    cancel(): void {
      if (timeoutId != null) {
        clearTimeout(timeoutId);

        timeoutId = null;
      }
    },
  };
}

/** Options for {@link runWithOpenDelay}. */
export interface RunWithOpenDelayOptions {
  /** When true, open is run immediately (e.g. tooltip warmup skip). */
  readonly skipDelay?: () => boolean;
}

/**
 * Runs an open callback after an optional delay. Shared by popover and tooltip
 * so hover open delay and "skip delay" (e.g. warmup) logic live in one place.
 *
 * @param delayMs - Delay in ms before opening; use 0 for immediate.
 * @param openFn - Callback to run when opening (after delay or immediately).
 * @param triggerDelay - Delay manager (e.g. from createTriggerDelay()); used when delayMs > 0.
 * @param options - Optional skipDelay(); when it returns true, openFn runs immediately.
 */
export function runWithOpenDelay(
  delayMs: number,
  openFn: () => void,
  triggerDelay: TriggerDelay,
  options?: RunWithOpenDelayOptions,
): void {
  const effectiveDelay = options?.skipDelay?.() ? 0 : delayMs;

  if (effectiveDelay > 0) {
    triggerDelay.schedule(effectiveDelay, openFn);
  } else {
    openFn();
  }
}

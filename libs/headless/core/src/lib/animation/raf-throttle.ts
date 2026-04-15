import { getGlobal } from '../env/get-global';

/**
 * Returns a `{ run, cancel }` pair that schedules `callback` to execute at most
 * once per animation frame.  Repeated `run()` calls within the same frame
 * coalesce into a single invocation.
 *
 * SSR-safe: when `requestAnimationFrame` is unavailable, `run()` invokes the
 * callback synchronously.
 */
export function createRafThrottled(callback: () => void): { run: () => void; cancel: () => void } {
  const win = getGlobal();
  let rafId: number | null = null;

  const run = (): void => {
    if (rafId !== null) return;

    if (!win || typeof win.requestAnimationFrame !== 'function') {
      callback();

      return;
    }

    rafId = win.requestAnimationFrame(() => {
      rafId = null;

      callback();
    });
  };

  const cancel = (): void => {
    if (rafId !== null && win?.cancelAnimationFrame) {
      win.cancelAnimationFrame(rafId);

      rafId = null;
    }
  };

  return { run, cancel };
}

/**
 * Schedules a single execution of `callback` on the next animation frame and
 * returns a cleanup function that cancels it.
 *
 * Convenience wrapper around {@link createRafThrottled} for one-shot use.
 *
 * SSR-safe: invokes the callback synchronously when `requestAnimationFrame`
 * is unavailable.
 */
export function rafThrottle(callback: () => void): () => void {
  const { run, cancel } = createRafThrottled(callback);

  run();

  return cancel;
}

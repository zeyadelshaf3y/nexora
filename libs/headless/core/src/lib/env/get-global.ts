/**
 * Returns the global `window` object when the DOM is available; otherwise `undefined`.
 * Use with `canUseDOM()` or check the return value before using window APIs.
 *
 * @returns `window` in browser, `undefined` in SSR or non-DOM environments
 */
export function getGlobal(): (Window & typeof globalThis) | undefined {
  return typeof window !== 'undefined' ? window : undefined;
}

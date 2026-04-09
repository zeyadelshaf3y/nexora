/**
 * Whether the code is running in an environment where the DOM is available (e.g. browser).
 * Use this to guard any direct access to `window`, `document`, or DOM APIs to avoid SSR errors.
 *
 * @returns `true` when `typeof document !== 'undefined'` and `typeof window !== 'undefined'`
 */
export function canUseDOM(): boolean {
  return typeof document !== 'undefined' && typeof window !== 'undefined';
}

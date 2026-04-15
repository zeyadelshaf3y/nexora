/**
 * If `value` is `undefined`, returns `undefined`. Otherwise returns `value()` when `value` is a
 * function, or `value` as-is. Use for optional config fields typed as `T | (() => T)`.
 */
export function resolveMaybeGetter<T>(value: T | (() => T) | undefined): T | undefined {
  if (value === undefined) return undefined;

  return typeof value === 'function' ? (value as () => T)() : value;
}

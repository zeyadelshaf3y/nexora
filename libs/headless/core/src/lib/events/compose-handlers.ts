/**
 * Composes multiple handlers of the same event type into one. Each handler is called in order;
 * if any handler returns a value, that value is returned. Typically used for optional user
 * handlers plus internal behavior (e.g. preventDefault then call user onClick).
 *
 * Handlers can be undefined; they are skipped. Pure utility; no DOM or environment access.
 *
 * @param handlers - Zero or more functions; undefined entries are ignored
 * @returns A single function that invokes each handler in order and returns the last non-undefined return value.
 * With zero handlers, returns a no-op; with exactly one, returns that handler (same reference).
 */
export function composeHandlers<T extends (...args: unknown[]) => unknown>(
  ...handlers: (T | undefined | null)[]
): T {
  const fns: T[] = [];

  for (const h of handlers) {
    if (typeof h === 'function') fns.push(h as T);
  }

  if (fns.length === 0) {
    return (() => undefined) as T;
  }

  if (fns.length === 1) {
    const [only] = fns;

    return only;
  }

  return ((...args: Parameters<T>) => {
    let result: unknown;

    for (const fn of fns) {
      result = (fn as (...a: unknown[]) => unknown)(...args);
    }

    return result;
  }) as T;
}

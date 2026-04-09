const MAX_WARNED = 500;
const warned = new Set<string>();

/**
 * Logs a console warning only once per message key. Useful to avoid spamming when a condition
 * is repeatedly true (e.g. invalid prop in a hot path).
 *
 * The internal Set is capped at {@link MAX_WARNED} entries to prevent unbounded memory
 * growth in long-running applications.
 *
 * @param key - Unique key for this warning (e.g. "overlay-missing-anchor").
 * @param message - Warning message to log.
 */
export function warnOnce(key: string, message: string): void {
  if (warned.has(key)) return;

  if (warned.size >= MAX_WARNED) return;
  warned.add(key);

  if (typeof console !== 'undefined' && typeof console.warn === 'function') {
    console.warn(`[nexora] ${message}`);
  }
}

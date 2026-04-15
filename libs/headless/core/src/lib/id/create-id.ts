/**
 * Generates a single unique id. Safe to call in any environment (SSR-safe).
 * Use this when you need one id per "instance" (e.g. overlay ref): call once, store the result;
 * do not call on every render to avoid changing identity.
 *
 * Uses `crypto.randomUUID()` when available, otherwise a time + random suffix.
 *
 * @returns A new unique string on each call
 */
export function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `nxr-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

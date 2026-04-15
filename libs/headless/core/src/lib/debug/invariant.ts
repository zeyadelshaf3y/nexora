/**
 * Asserts that a condition is true. Throws an Error with the given message if not.
 * Use for programmer errors / invariants that should never happen in correct usage.
 *
 * @param condition - Must be truthy
 * @param message - Error message when condition is falsy
 * @throws Error when condition is falsy
 */
export function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`[nexora] ${message}`);
  }
}

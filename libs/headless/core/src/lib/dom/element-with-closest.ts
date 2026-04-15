/**
 * Type guard: returns true when the node is an `Element` (which supports `closest()`).
 * Use before calling `closest()` on a `Node` to satisfy TypeScript and avoid runtime errors.
 *
 * @param node - Node to test.
 * @returns `true` when node is an `Element`.
 */
export function hasClosest(node: Node | null | undefined): node is Element {
  return node instanceof Element;
}

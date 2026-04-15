/**
 * Returns whether the container node contains the given node (including when container === node).
 * SSR-safe: returns false if either argument is null/undefined.
 *
 * @param container - Parent (or same) node
 * @param node - Child (or same) node to test
 * @returns true if container contains node or container === node
 */
export function contains(
  container: Node | null | undefined,
  node: Node | null | undefined,
): boolean {
  if (!container || !node) return false;
  if (container === node) return true;

  return container.contains(node);
}

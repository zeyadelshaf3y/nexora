/**
 * First index in {@link items} where {@link sameItem} matches {@link active}.
 * Used when track-key lookup misses (e.g. active is a different instance than list rows).
 */
export function findIndexBySameItem<T>(
  items: readonly T[],
  active: T,
  sameItem: (a: T, b: T) => boolean,
): number {
  return items.findIndex((item) => sameItem(item, active));
}

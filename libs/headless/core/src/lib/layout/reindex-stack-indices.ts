/**
 * After removing one element from `list` at `fromIndex` (and deleting its map entry), rewrites
 * `map` so each `list[j]` maps to `j` for every `j >= fromIndex`.
 *
 * Expects a dense array (no holes); sparse indices are skipped and would leave stale map entries.
 */
export function reindexStackIndicesAfterRemoval<T>(
  list: readonly T[],
  map: Map<T, number>,
  fromIndex: number,
): void {
  const n = list.length;
  for (let j = fromIndex; j < n; j++) {
    const item = list[j];
    if (item === undefined) continue;
    map.set(item, j);
  }
}

/**
 * First index per track-by key. Duplicate keys keep the earliest index only.
 */
export function buildFirstIndexByTrackKey<T>(
  list: readonly T[],
  keyFn: (item: T) => unknown,
): ReadonlyMap<unknown, number> {
  const map = new Map<unknown, number>();
  for (const [i, item] of list.entries()) {
    const k = keyFn(item);
    if (!map.has(k)) {
      map.set(k, i);
    }
  }
  return map;
}

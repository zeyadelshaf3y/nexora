/**
 * DOM-order comparisons for option rows (navigation follows visual order, not registration order).
 */

/** -1 if `a` is before `b` in the document, 1 if after, 0 if same node. */
export function compareOptionElementsDomOrder<E extends { element: HTMLElement }>(
  a: E,
  b: E,
): number {
  if (a.element === b.element) return 0;
  const pos = a.element.compareDocumentPosition(b.element);
  if (pos === 0) return 0;

  const aBeforeB =
    !!(pos & Node.DOCUMENT_POSITION_FOLLOWING) || !!(pos & Node.DOCUMENT_POSITION_CONTAINED_BY);

  return aBeforeB ? -1 : 1;
}

/** Copy sorted by DOM order (e.g. for full scans and cache keys). */
export function sortOptionEntriesByDomOrder<E extends { element: HTMLElement }>(entries: E[]): E[] {
  return entries.slice().sort(compareOptionElementsDomOrder);
}

/** Insertion index for `newEntry` into `sortedByDom` while keeping DOM order. */
export function findDomOrderInsertionIndex<E extends { element: HTMLElement }>(
  sortedByDom: E[],
  newEntry: E,
): number {
  const idx = sortedByDom.findIndex((e) => compareOptionElementsDomOrder(newEntry, e) <= 0);

  return idx === -1 ? sortedByDom.length : idx;
}

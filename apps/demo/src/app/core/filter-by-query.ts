/**
 * Shared filter helper for demo pages: filter a list by a search query on item labels.
 * Reduces duplication across combobox and select demo computeds.
 */

/**
 * Filters items by query string (case-insensitive match on getLabel(item)).
 * @param items - Source list
 * @param query - Search string (trimmed and lowercased internally)
 * @param getLabel - Extract searchable label from each item
 * @param options - Optional: exclude items for which exclude(item) is true (e.g. disabled)
 */
export function filterByQuery<T>(
  items: readonly T[],
  query: string,
  getLabel: (item: T) => string,
  options?: { exclude?: (item: T) => boolean },
): T[] {
  const q = query.toLowerCase().trim();
  const exclude = options?.exclude;
  const base = exclude ? items.filter((i) => !exclude(i)) : [...items];
  if (!q) return base;
  return base.filter((item) => getLabel(item).toLowerCase().includes(q));
}

/**
 * Multi-select value edits (shared rules with {@link ComboboxComponent.unselect}).
 */

export function multiSelectionRemovingEquivalentItems<T>(
  current: readonly T[],
  item: T,
  sameItem: (a: T, b: T) => boolean,
): T[] {
  const next: T[] = [];

  for (const v of current) {
    if (!sameItem(v, item)) next.push(v);
  }

  return next;
}

import { buildFirstIndexByTrackKey } from './build-first-index-by-track-key';

export type VirtualSelectionAccessors<T> = {
  value?: (item: T) => unknown;
};

export type ComputeVirtualSelectedIndexParams<T> = {
  items: readonly T[];
  value: T | null | readonly T[] | undefined;
  multi: boolean;
  compareWith?: (a: unknown, b: unknown) => boolean;
  accessors: VirtualSelectionAccessors<T> | undefined;
  trackKeyFn: (item: T) => unknown;
};

/**
 * First list index to scroll into view for virtual panels.
 *
 * Single: index of the selected value. Multi: minimum index among selected items.
 * With `compareWith`, uses O(n × m) equality; otherwise O(n + m) via `trackKeyFn` + key map.
 *
 * @remarks After `Array.isArray` checks, `value` is still cast (`as T | null`, `as readonly T[]`)
 * when `T` may overlap array types — TypeScript cannot narrow `T | readonly T[]` in those branches
 * (same rationale as listbox `isSelectedLinear` / `buildSelectionSet` and dropdown `computeDisplayValue`).
 */
export function computeVirtualSelectedIndex<T>(
  params: ComputeVirtualSelectedIndexParams<T>,
): number {
  const { items, value: v, multi, compareWith: cmp, accessors: acc, trackKeyFn } = params;
  if (items.length === 0) return -1;

  const sameItem = (a: T, b: T): boolean => {
    if (cmp) return cmp(a, b);
    if (acc?.value) return acc.value(a) === acc.value(b);

    return a === b;
  };

  if (!multi) {
    const single = Array.isArray(v) ? null : (v as T | null);
    if (single == null) return -1;

    return items.findIndex((item) => sameItem(item, single));
  }

  if (!Array.isArray(v) || v.length === 0) return -1;
  const selected = v as readonly T[];

  if (cmp) {
    let best = -1;
    for (const [i, item] of items.entries()) {
      for (const sel of selected) {
        if (sameItem(item, sel)) {
          if (best < 0 || i < best) best = i;
          break;
        }
      }
    }

    return best;
  }

  const indexByKey = buildFirstIndexByTrackKey(items, trackKeyFn);
  let best = -1;
  for (const sel of selected) {
    const idx = indexByKey.get(trackKeyFn(sel));
    if (idx !== undefined && (best < 0 || idx < best)) best = idx;
  }

  return best;
}

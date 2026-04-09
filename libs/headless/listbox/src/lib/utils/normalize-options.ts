/**
 * Pure helpers to derive value, label, and disabled from each option item.
 * No Angular dependency. Used internally for selection reconciliation and typeahead.
 */

import type { ListboxAccessors, NormalizedOption } from '../types';

const DEFAULT_LABEL = (item: unknown): string => (item == null ? '' : String(item));

/**
 * Normalizes a single option item using accessors or primitive defaults.
 * Primitives use the item as value and label; disabled is false.
 *
 * @param item - The option item (primitive or object)
 * @param accessors - Optional; required when T is an object
 * @returns Normalized option with value, label, disabled
 */
export function normalizeOption<T>(
  item: T,
  accessors?: ListboxAccessors<T> | null,
): NormalizedOption<T> {
  if (accessors) {
    const value = accessors.value(item);
    const label = accessors.label(item);
    const disabled = accessors.disabled?.(item) ?? false;

    return {
      item,
      value,
      label: trimLabel(label),
      disabled: Boolean(disabled),
    };
  }

  return {
    item,
    value: item,
    label: trimLabel(DEFAULT_LABEL(item)),
    disabled: false,
  };
}

/**
 * Normalizes an array of options. Options with empty normalized label are still included;
 * typeahead logic should ignore them when matching.
 *
 * @param items - Logical option collection
 * @param accessors - Optional; required when T is an object
 * @returns Array of normalized options
 */
export function normalizeOptions<T>(
  items: readonly T[],
  accessors?: ListboxAccessors<T> | null,
): NormalizedOption<T>[] {
  return items.map((item) => normalizeOption(item, accessors));
}

function trimLabel(label: string): string {
  return typeof label === 'string' ? label.trim() : '';
}

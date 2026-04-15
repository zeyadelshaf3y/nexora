/**
 * Shared display-value helpers for dropdown-style components (select, combobox).
 * Uses a minimal accessor shape so this package does not depend on listbox.
 * Tree-shakable: import only what you use.
 */

/**
 * Minimal accessor for resolving a display label from an item.
 * Select and combobox use ListboxAccessors, which include a required `label`;
 * this type accepts optional `label` so we can fall back to `String(item)` when absent.
 */
export interface DisplayLabelAccessor<T> {
  readonly label?: (item: T) => string;
}

/**
 * Resolves the display label for a single item.
 * Uses `accessors.label` when available, otherwise falls back to `String(item)`.
 */
export function resolveDisplayLabel<T>(
  item: T,
  accessors: DisplayLabelAccessor<T> | undefined,
): string {
  if (accessors?.label) {
    return accessors.label(item);
  }

  return String(item);
}

/**
 * Computes the display string for a trigger (e.g. select/combobox displayValue()).
 *
 * - `null` or empty array → `placeholder`
 * - Single value → label via accessors or `String(value)`
 * - Array of values → comma-separated labels
 *
 * @remarks Scalar branch uses `value as T`: when `T` can be an array type, TypeScript (and the
 * Angular compiler) do not narrow `T | readonly T[]` after `Array.isArray` checks.
 */
export function computeDisplayValue<T>(
  value: T | null | readonly T[],
  accessors: DisplayLabelAccessor<T> | undefined,
  placeholder: string,
): string {
  if (value == null) {
    return placeholder;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return placeholder;

    return value.map((item) => resolveDisplayLabel(item, accessors)).join(', ');
  }

  return resolveDisplayLabel(value as T, accessors);
}

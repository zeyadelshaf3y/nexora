type SingleOrMultiValue<T> = T | null | readonly T[];

/**
 * Whether the bound model has a non-empty selection (for select/combobox-style `value` models).
 * Single: each non-null scalar counts as selected; multi: non-empty array.
 */
export function hasSelectionValue<T>(value: T | null | readonly T[] | undefined): boolean {
  if (value == null) return false;

  return Array.isArray(value) ? value.length > 0 : true;
}

/**
 * Selected values as a read-only array for templates (chips, `*ngFor`, etc.).
 * Multi: the array model or `[]` when not an array; single: `[value]` or `[]`.
 */
export function toSelectedValuesArray<T>(
  value: T | null | readonly T[] | undefined,
  multi: boolean,
): readonly T[] {
  if (multi) {
    return Array.isArray(value) ? value : [];
  }

  return value != null ? ([value] as readonly T[]) : [];
}

export function getEmptySelectionValue<T>(isMulti: boolean): SingleOrMultiValue<T> {
  return isMulti ? ([] as readonly T[]) : null;
}

export function normalizeSingleOrMultiValue<T>(
  value: T | null | readonly T[] | undefined,
  isMulti: boolean,
): SingleOrMultiValue<T> {
  if (value === undefined || value === null) {
    return getEmptySelectionValue<T>(isMulti);
  }

  return isMulti && !Array.isArray(value) ? ([] as readonly T[]) : value;
}

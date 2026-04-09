/**
 * Display-value helpers used by `SelectComponent` only.
 *
 * For custom trigger markup outside the component, import `computeDisplayValue` and
 * `resolveDisplayLabel` from `@nexora-ui/dropdown` (single source of truth; `SelectAccessors` is
 * compatible with dropdown label types).
 */

import {
  computeDisplayValue as computeDisplayValueFromDropdown,
  resolveDisplayLabel,
} from '@nexora-ui/dropdown';

import type { SelectAccessors } from '../types/select-types';

/**
 * Resolve the display label for a single item.
 * Uses `accessors.label` when available, otherwise falls back to `String(item)`.
 */
export function resolveLabel<T>(item: T, accessors: SelectAccessors<T> | undefined): string {
  return resolveDisplayLabel(item, accessors);
}

/**
 * Compute a display string for the trigger's `displayValue()` signal.
 *
 * - `null` or empty array  → `placeholder`
 * - Single value           → label via accessors or String(value)
 * - Array of values        → comma-separated labels
 */
export function computeDisplayValue<T>(
  value: T | null | readonly T[],
  accessors: SelectAccessors<T> | undefined,
  placeholder: string,
): string {
  return computeDisplayValueFromDropdown(value, accessors, placeholder);
}

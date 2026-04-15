/**
 * Resolves an option that may be a static value or a getter.
 * Used so consumers can pass reactive options (e.g. from signal inputs).
 */

import { resolveMaybeGetter } from '@nexora-ui/core';

/** Value or getter for reactive dropdown options. */
export type DropdownOption<T> = T | (() => T);

/**
 * Returns the current value: either the default, or the result of calling a getter / using the value.
 */
export function resolveDropdownOption<T>(value: DropdownOption<T> | undefined, defaultValue: T): T {
  if (value === undefined) return defaultValue;

  return resolveMaybeGetter(value) as T;
}

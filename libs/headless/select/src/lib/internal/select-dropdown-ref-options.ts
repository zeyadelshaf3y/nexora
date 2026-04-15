/**
 * Select-specific {@link DropdownRefOptions}: stable base pane class for overlay styling.
 */

import {
  buildHeadlessDropdownRefOptions,
  type HeadlessDropdownRefOptionsInput,
  type DropdownRefOptions,
} from '@nexora-ui/dropdown';

import { SELECT_BACKDROP_CLASS, SELECT_PANE_CLASS } from '../constants/select-constants';

export type SelectDropdownRefOptionsInput = Omit<
  HeadlessDropdownRefOptionsInput,
  'basePaneClass' | 'baseBackdropClass'
>;

export function buildSelectDropdownRefOptions(
  input: SelectDropdownRefOptionsInput,
): DropdownRefOptions {
  return buildHeadlessDropdownRefOptions({
    ...input,
    basePaneClass: SELECT_PANE_CLASS,
    baseBackdropClass: SELECT_BACKDROP_CLASS,
  });
}

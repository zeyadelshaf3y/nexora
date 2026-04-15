/**
 * Combobox-specific {@link DropdownRefOptions}: base pane class + required focus-restore target.
 */

import {
  buildHeadlessDropdownRefOptions,
  type HeadlessDropdownRefOptionsInput,
  type DropdownRefOptions,
} from '@nexora-ui/dropdown';

import { COMBOBOX_BACKDROP_CLASS, COMBOBOX_PANE_CLASS } from '../constants/combobox-constants';

export type ComboboxDropdownRefOptionsInput = Omit<
  HeadlessDropdownRefOptionsInput,
  'basePaneClass' | 'baseBackdropClass' | 'getFocusRestoreTarget'
> & {
  readonly getFocusRestoreTarget: () => HTMLElement | null;
};

export function buildComboboxDropdownRefOptions(
  input: ComboboxDropdownRefOptionsInput,
): DropdownRefOptions {
  return buildHeadlessDropdownRefOptions({
    ...input,
    basePaneClass: COMBOBOX_PANE_CLASS,
    baseBackdropClass: COMBOBOX_BACKDROP_CLASS,
  });
}

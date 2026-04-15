/**
 * Menu-specific {@link DropdownRefOptions}: stable base pane class for overlay styling.
 */

import {
  buildHeadlessDropdownRefOptions,
  type HeadlessDropdownRefOptionsInput,
  type DropdownRefOptions,
} from '@nexora-ui/dropdown';

import { MENU_BACKDROP_CLASS, MENU_PANE_CLASS } from '../constants/menu-constants';

export type MenuDropdownRefOptionsInput = Omit<
  HeadlessDropdownRefOptionsInput,
  'basePaneClass' | 'baseBackdropClass'
>;

export function buildMenuDropdownRefOptions(
  input: MenuDropdownRefOptionsInput,
): DropdownRefOptions {
  return buildHeadlessDropdownRefOptions({
    ...input,
    basePaneClass: MENU_PANE_CLASS,
    baseBackdropClass: MENU_BACKDROP_CLASS,
  });
}

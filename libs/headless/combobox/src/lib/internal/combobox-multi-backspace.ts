/**
 * Multi combobox: Backspace with an empty input removes the last selected value.
 */

import { KEY_BACKSPACE } from '../constants/combobox-constants';

export function tryComboboxMultiBackspaceRemoveLast<T>(args: {
  readonly event: KeyboardEvent;
  readonly isMulti: boolean;
  readonly inputValue: string;
  readonly hasValue: boolean;
  readonly getSelectedArray: () => readonly T[] | null | undefined;
  readonly unselect: (item: T) => void;
}): boolean {
  const { event, isMulti, inputValue, hasValue, getSelectedArray, unselect } = args;

  if (!isMulti || event.key !== KEY_BACKSPACE || inputValue !== '' || !hasValue) {
    return false;
  }

  const current = getSelectedArray();
  if (!current || current.length === 0) return false;

  const last = current.at(-1);
  if (last === undefined) return false;

  event.preventDefault();
  unselect(last);

  return true;
}

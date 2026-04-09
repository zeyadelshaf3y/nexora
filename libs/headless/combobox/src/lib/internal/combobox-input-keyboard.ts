/**
 * Input keydown routing for {@link ComboboxComponent} (multi backspace, open keys, listbox forward).
 */

import { handleClosedTriggerOpenKey, type DropdownRef } from '@nexora-ui/dropdown';

import { COMBOBOX_OPEN_KEYS } from '../constants/combobox-constants';

import { tryComboboxMultiBackspaceRemoveLast } from './combobox-multi-backspace';

export function handleComboboxInputKeydown<T>(args: {
  readonly event: KeyboardEvent;
  readonly isDisabled: boolean;
  readonly isMulti: boolean;
  readonly inputValue: string;
  readonly hasValue: boolean;
  readonly isOpen: boolean;
  readonly getSelectedArray: () => readonly T[] | null;
  readonly unselect: (item: T) => void;
  readonly open: () => void;
  readonly dropdownRef: DropdownRef;
  readonly forwardKeydownToListbox: (event: KeyboardEvent) => void;
}): void {
  if (args.isDisabled) return;

  if (
    tryComboboxMultiBackspaceRemoveLast({
      event: args.event,
      isMulti: args.isMulti,
      inputValue: args.inputValue,
      hasValue: args.hasValue,
      getSelectedArray: args.getSelectedArray,
      unselect: args.unselect,
    })
  ) {
    return;
  }

  if (!args.isOpen) {
    handleClosedTriggerOpenKey(args.event, COMBOBOX_OPEN_KEYS, args.open);
    return;
  }

  args.dropdownRef.handleTriggerKeydown(args.event, args.forwardKeydownToListbox);
}

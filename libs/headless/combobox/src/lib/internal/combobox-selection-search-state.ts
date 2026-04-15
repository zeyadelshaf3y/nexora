import type { Signal, WritableSignal } from '@angular/core';
import { normalizeSingleOrMultiValue } from '@nexora-ui/dropdown';

import { queueComboboxInputFocus } from './combobox-focus-utils';

type ComboboxValue<T> = T | null | readonly T[];

export function normalizeSelectionValue<T>(
  valueOrValues: T | null | readonly T[] | undefined,
  isMulti: boolean,
): ComboboxValue<T> {
  return normalizeSingleOrMultiValue(valueOrValues, isMulti);
}

interface ApplySelectionChangeParams<T> {
  readonly newValue: ComboboxValue<T>;
  readonly isMulti: boolean;
  readonly isOpen: boolean;
  readonly value: WritableSignal<ComboboxValue<T>>;
  readonly inputValue: WritableSignal<string>;
  readonly onChange?: (value: ComboboxValue<T>) => void;
  readonly syncInputToDisplay: () => void;
  readonly closeWithSelection: () => void;
  readonly focusInput: () => void;
}

export function applySelectionChange<T>(params: ApplySelectionChangeParams<T>): void {
  const {
    newValue,
    isMulti,
    isOpen,
    value,
    inputValue,
    onChange,
    syncInputToDisplay,
    closeWithSelection,
    focusInput,
  } = params;
  value.set(newValue);
  onChange?.(newValue);
  if (isMulti) {
    inputValue.set('');
    if (!isOpen) syncInputToDisplay();
    queueComboboxInputFocus(() => focusInput());
  } else {
    closeWithSelection();
  }
}

export function clearSearchState(
  inputValue: WritableSignal<string>,
  isEditing: WritableSignal<boolean>,
  isMulti: boolean,
): void {
  inputValue.set('');
  if (!isMulti) isEditing.set(false);
}

interface SetSearchQueryParams {
  readonly query: string;
  readonly isMulti: boolean;
  readonly isOpen: boolean;
  readonly isDisabled: boolean;
  readonly openPanel?: boolean;
  readonly inputValue: Signal<string>;
  readonly setInputValue: (value: string) => void;
  readonly setIsEditing: (editing: boolean) => void;
  readonly syncInputToDisplay: () => void;
  readonly open: () => Promise<boolean>;
}

export function setSearchQuery(params: SetSearchQueryParams): void {
  const {
    query,
    isMulti,
    isOpen,
    isDisabled,
    openPanel,
    inputValue,
    setInputValue,
    setIsEditing,
    syncInputToDisplay,
    open,
  } = params;
  if (inputValue() !== query) setInputValue(query);
  if (!isMulti) setIsEditing(true);
  syncInputToDisplay();
  const shouldOpen = openPanel !== false && !isOpen && !isDisabled;
  if (shouldOpen) void open();
}

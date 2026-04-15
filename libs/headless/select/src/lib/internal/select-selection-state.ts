import type { WritableSignal } from '@angular/core';
import { getEmptySelectionValue, normalizeSingleOrMultiValue } from '@nexora-ui/dropdown';

type SelectValue<T> = T | null | readonly T[];

export function getEmptySelectValue<T>(isMulti: boolean): SelectValue<T> {
  return getEmptySelectionValue<T>(isMulti);
}

export function normalizeWriteValue<T>(
  value: T | null | readonly T[],
  isMulti: boolean,
): SelectValue<T> {
  return normalizeSingleOrMultiValue(value, isMulti);
}

interface ApplySelectionValueParams<T> {
  readonly value: SelectValue<T>;
  readonly isMulti: boolean;
  readonly setValue: WritableSignal<SelectValue<T>>;
  readonly onChange?: (value: SelectValue<T>) => void;
  readonly closeWithSelection: () => void;
}

export function applySelectionValue<T>(params: ApplySelectionValueParams<T>): void {
  const { value, isMulti, setValue, onChange, closeWithSelection } = params;
  setValue.set(value);
  onChange?.(value);
  if (!isMulti) closeWithSelection();
}

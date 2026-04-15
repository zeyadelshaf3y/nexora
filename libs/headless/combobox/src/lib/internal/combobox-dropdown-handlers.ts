/**
 * Dropdown open/close transitions for {@link ComboboxComponent}.
 */

import type { WritableSignal } from '@angular/core';
import { applyClosedTransition, applyOpenedTransition } from '@nexora-ui/dropdown';
import type { ListboxDirective } from '@nexora-ui/listbox/internal';
import type { CloseReason } from '@nexora-ui/overlay';

import { applyComboboxAfterClosed } from './combobox-close-behavior';
import type { ComboboxFocusOpenState } from './combobox-focus-open-state';

export function handleComboboxDropdownOpened(args: {
  readonly isDestroying: boolean;
  readonly isOpenSignal: WritableSignal<boolean>;
  readonly emitOpened: () => void;
  readonly afterOpened: () => void;
}): void {
  applyOpenedTransition({
    setOpen: (isOpen) => args.isOpenSignal.set(isOpen),
    emitOpened: () => {
      if (!args.isDestroying) args.emitOpened();
    },
    afterOpened: args.afterOpened,
  });
}

export function handleComboboxDropdownClosed<T>(args: {
  readonly isDestroying: boolean;
  readonly reason: CloseReason | undefined;
  readonly wasClosingViaToggle: boolean;
  readonly isOpenSignal: WritableSignal<boolean>;
  readonly listboxRef: WritableSignal<ListboxDirective<T> | null>;
  readonly emitClosed: (reason: CloseReason | undefined) => void;
  readonly markTouched?: () => void;
  readonly focusOpenState: ComboboxFocusOpenState;
  readonly syncSearchToValue: () => void;
  readonly focusInput: () => void;
}): void {
  applyClosedTransition({
    clearListbox: () => args.listboxRef.set(null),
    setOpen: (isOpen) => args.isOpenSignal.set(isOpen),
    emitClosed: (closeReason) => {
      if (!args.isDestroying) args.emitClosed(closeReason);
    },
    markTouched: args.markTouched,
    reason: args.reason,
    afterClosed: (closeReason) => {
      applyComboboxAfterClosed({
        reason: closeReason,
        wasClosingViaToggle: args.wasClosingViaToggle,
        focusOpenState: args.focusOpenState,
        syncSearchToValue: args.syncSearchToValue,
        focusInput: args.focusInput,
      });
    },
  });
}

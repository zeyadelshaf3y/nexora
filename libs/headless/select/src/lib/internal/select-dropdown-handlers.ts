/**
 * Dropdown open/close transitions for {@link SelectComponent} (shared apply* wiring).
 */

import type { WritableSignal } from '@angular/core';
import { applyClosedTransition, applyOpenedTransition } from '@nexora-ui/dropdown';
import type { ListboxDirective } from '@nexora-ui/listbox/internal';
import type { CloseReason } from '@nexora-ui/overlay';

export function handleSelectDropdownOpened(args: {
  readonly isDestroying: boolean;
  readonly isOpenSignal: WritableSignal<boolean>;
  readonly emitOpened: () => void;
}): void {
  applyOpenedTransition({
    setOpen: (isOpen) => args.isOpenSignal.set(isOpen),
    emitOpened: () => {
      if (!args.isDestroying) args.emitOpened();
    },
  });
}

export function handleSelectDropdownClosed<T>(args: {
  readonly isDestroying: boolean;
  readonly reason: CloseReason | undefined;
  readonly isOpenSignal: WritableSignal<boolean>;
  readonly listboxRef: WritableSignal<ListboxDirective<T> | null>;
  readonly emitClosed: (reason: CloseReason | undefined) => void;
  readonly markTouched?: () => void;
}): void {
  applyClosedTransition({
    clearListbox: () => args.listboxRef.set(null),
    setOpen: (isOpen) => args.isOpenSignal.set(isOpen),
    emitClosed: (closeReason) => {
      if (!args.isDestroying) args.emitClosed(closeReason);
    },
    markTouched: args.markTouched,
    reason: args.reason,
  });
}

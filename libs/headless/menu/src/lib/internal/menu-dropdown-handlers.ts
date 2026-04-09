/**
 * Dropdown open/close transitions for {@link MenuComponent}.
 */

import type { WritableSignal } from '@angular/core';
import { applyClosedTransition, applyOpenedTransition } from '@nexora-ui/dropdown';
import type { ListboxDirective } from '@nexora-ui/listbox';
import type { CloseReason } from '@nexora-ui/overlay';

export function handleMenuDropdownOpened(args: {
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

export function handleMenuDropdownClosed<T>(args: {
  readonly isDestroying: boolean;
  readonly reason: CloseReason | undefined;
  readonly isOpenSignal: WritableSignal<boolean>;
  readonly listboxRef: WritableSignal<ListboxDirective<T> | null>;
  readonly emitClosed: (reason: CloseReason | undefined) => void;
}): void {
  applyClosedTransition({
    clearListbox: () => args.listboxRef.set(null),
    setOpen: (isOpen) => args.isOpenSignal.set(isOpen),
    emitClosed: (closeReason) => {
      if (!args.isDestroying) args.emitClosed(closeReason);
    },
    reason: args.reason,
  });
}

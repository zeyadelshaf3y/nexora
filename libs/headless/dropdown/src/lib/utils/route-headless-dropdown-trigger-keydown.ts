/**
 * Routes trigger `keydown` for headless anchored controls that use {@link OPEN_KEYS} when closed
 * (select, menu) and {@link DropdownRef.handleTriggerKeydown} when open.
 */

import { OPEN_KEYS } from '../constants/dropdown-constants';
import type { DropdownRef } from '../ref/dropdown-ref';

import { handleClosedTriggerOpenKey } from './trigger-open-keys';

export function routeHeadlessDropdownTriggerKeydown(args: {
  readonly event: KeyboardEvent;
  readonly isDisabled: boolean;
  readonly isOpen: boolean;
  readonly open: () => void;
  readonly dropdownRef: DropdownRef;
  readonly forwardKeydown: (event: KeyboardEvent) => void;
}): void {
  if (args.isDisabled) return;

  if (!args.isOpen) {
    handleClosedTriggerOpenKey(args.event, OPEN_KEYS, args.open);
    return;
  }

  args.dropdownRef.handleTriggerKeydown(args.event, args.forwardKeydown);
}

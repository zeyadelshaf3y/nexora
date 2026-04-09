/**
 * Shared destroy sequence for anchored dropdown hosts (select, combobox, menu) that keep a
 * listbox ref and open signal in sync with {@link DropdownRef}.
 */

import type { DropdownRef } from '../ref/dropdown-ref';

export function teardownAnchoredDropdownHostState(args: {
  readonly beginHostDestroy: () => void;
  readonly dropdownRef: DropdownRef;
  readonly detachListboxRef: () => void;
  readonly clearOpenState: () => void;
}): void {
  args.beginHostDestroy();
  args.dropdownRef.destroy();
  args.detachListboxRef();
  args.clearOpenState();
}

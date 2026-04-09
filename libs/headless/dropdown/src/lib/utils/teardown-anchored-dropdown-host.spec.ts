import { describe, expect, it, vi } from 'vitest';

import type { DropdownRef } from '../ref/dropdown-ref';

import { teardownAnchoredDropdownHostState } from './teardown-anchored-dropdown-host';

describe('teardownAnchoredDropdownHostState', () => {
  it('runs begin, destroy, detach listbox, clear open in order and calls destroy once', () => {
    const order: string[] = [];
    const destroy = vi.fn(() => order.push('destroy'));
    const dropdownRef = { destroy } as unknown as DropdownRef;

    teardownAnchoredDropdownHostState({
      beginHostDestroy: () => order.push('begin'),
      dropdownRef,
      detachListboxRef: () => order.push('detach'),
      clearOpenState: () => order.push('clear'),
    });

    expect(order).toEqual(['begin', 'destroy', 'detach', 'clear']);
    expect(destroy).toHaveBeenCalledOnce();
  });
});

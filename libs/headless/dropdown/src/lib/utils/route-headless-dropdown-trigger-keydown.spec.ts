import { describe, expect, it, vi } from 'vitest';

import { routeHeadlessDropdownTriggerKeydown } from './route-headless-dropdown-trigger-keydown';

describe('routeHeadlessDropdownTriggerKeydown', () => {
  it('when closed and key is Enter, prevents default and opens', () => {
    const open = vi.fn();
    const handleTriggerKeydown = vi.fn();
    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
    const preventDefault = vi.spyOn(event, 'preventDefault');

    routeHeadlessDropdownTriggerKeydown({
      event,
      isDisabled: false,
      isOpen: false,
      open,
      dropdownRef: { handleTriggerKeydown } as never,
      forwardKeydown: vi.fn(),
    });

    expect(preventDefault).toHaveBeenCalled();
    expect(open).toHaveBeenCalledOnce();
    expect(handleTriggerKeydown).not.toHaveBeenCalled();
  });

  it('when open, forwards to dropdownRef.handleTriggerKeydown', () => {
    const open = vi.fn();
    const handleTriggerKeydown = vi.fn();
    const forwardKeydown = vi.fn();
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true });

    routeHeadlessDropdownTriggerKeydown({
      event,
      isDisabled: false,
      isOpen: true,
      open,
      dropdownRef: { handleTriggerKeydown } as never,
      forwardKeydown,
    });

    expect(open).not.toHaveBeenCalled();
    expect(handleTriggerKeydown).toHaveBeenCalledOnce();
    expect(handleTriggerKeydown.mock.calls[0][0]).toBe(event);
    expect(handleTriggerKeydown.mock.calls[0][1]).toBe(forwardKeydown);
  });

  it('no-op when disabled', () => {
    const open = vi.fn();
    const handleTriggerKeydown = vi.fn();
    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });

    routeHeadlessDropdownTriggerKeydown({
      event,
      isDisabled: true,
      isOpen: false,
      open,
      dropdownRef: { handleTriggerKeydown } as never,
      forwardKeydown: vi.fn(),
    });

    expect(open).not.toHaveBeenCalled();
    expect(handleTriggerKeydown).not.toHaveBeenCalled();
  });
});

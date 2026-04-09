import { handleClosedTriggerOpenKey } from './trigger-open-keys';

describe('handleClosedTriggerOpenKey', () => {
  it('prevents default and opens when key is allowed', () => {
    const open = vi.fn();
    const event = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true });
    const preventSpy = vi.spyOn(event, 'preventDefault');

    const handled = handleClosedTriggerOpenKey(event, new Set(['Enter']), open);

    expect(handled).toBe(true);
    expect(preventSpy).toHaveBeenCalled();
    expect(open).toHaveBeenCalledTimes(1);
  });

  it('does nothing when key is not allowed', () => {
    const open = vi.fn();
    const event = new KeyboardEvent('keydown', { key: 'x', cancelable: true });
    const preventSpy = vi.spyOn(event, 'preventDefault');

    const handled = handleClosedTriggerOpenKey(event, new Set(['Enter']), open);

    expect(handled).toBe(false);
    expect(preventSpy).not.toHaveBeenCalled();
    expect(open).not.toHaveBeenCalled();
  });
});

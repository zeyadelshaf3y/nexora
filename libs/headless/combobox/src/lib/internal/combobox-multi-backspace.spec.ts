import { describe, expect, it, vi } from 'vitest';

import { tryComboboxMultiBackspaceRemoveLast } from './combobox-multi-backspace';

describe('tryComboboxMultiBackspaceRemoveLast', () => {
  it('returns false when not multi', () => {
    const unselect = vi.fn();
    const ok = tryComboboxMultiBackspaceRemoveLast({
      event: new KeyboardEvent('keydown', { key: 'Backspace' }),
      isMulti: false,
      inputValue: '',
      hasValue: true,
      getSelectedArray: () => [1],
      unselect,
    });
    expect(ok).toBe(false);
    expect(unselect).not.toHaveBeenCalled();
  });

  it('returns false when input has text', () => {
    const ok = tryComboboxMultiBackspaceRemoveLast({
      event: new KeyboardEvent('keydown', { key: 'Backspace' }),
      isMulti: true,
      inputValue: 'x',
      hasValue: true,
      getSelectedArray: () => [1],
      unselect: vi.fn(),
    });
    expect(ok).toBe(false);
  });

  it('unselects last item and prevents default when conditions match', () => {
    const unselect = vi.fn();
    const event = new KeyboardEvent('keydown', { key: 'Backspace', cancelable: true });
    const preventDefault = vi.spyOn(event, 'preventDefault');

    const ok = tryComboboxMultiBackspaceRemoveLast({
      event,
      isMulti: true,
      inputValue: '',
      hasValue: true,
      getSelectedArray: () => [10, 20, 30],
      unselect,
    });

    expect(ok).toBe(true);
    expect(preventDefault).toHaveBeenCalled();
    expect(unselect).toHaveBeenCalledWith(30);
  });
});

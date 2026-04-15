import { describe, expect, it, vi } from 'vitest';

import { queueComboboxInputFocus, shouldOpenPanelOnInputInteraction } from './combobox-focus-utils';

describe('combobox-focus-utils', () => {
  it('shouldOpenPanelOnInputInteraction returns true for enabled closed interaction', () => {
    expect(
      shouldOpenPanelOnInputInteraction({
        openPanelOnFocus: true,
        isDisabled: false,
        shouldSkipOpen: false,
        isOpen: false,
      }),
    ).toBe(true);
  });

  it('shouldOpenPanelOnInputInteraction returns false when disabled/skip/open', () => {
    expect(
      shouldOpenPanelOnInputInteraction({
        openPanelOnFocus: true,
        isDisabled: true,
        shouldSkipOpen: false,
      }),
    ).toBe(false);
    expect(
      shouldOpenPanelOnInputInteraction({
        openPanelOnFocus: true,
        isDisabled: false,
        shouldSkipOpen: true,
      }),
    ).toBe(false);
    expect(
      shouldOpenPanelOnInputInteraction({
        openPanelOnFocus: true,
        isDisabled: false,
        shouldSkipOpen: false,
        isOpen: true,
      }),
    ).toBe(false);
  });

  it('queueComboboxInputFocus schedules callback in microtask', async () => {
    const focusSpy = vi.fn();

    queueComboboxInputFocus(focusSpy);
    expect(focusSpy).not.toHaveBeenCalled();

    await Promise.resolve();
    expect(focusSpy).toHaveBeenCalledTimes(1);
  });
});

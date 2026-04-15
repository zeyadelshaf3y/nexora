import { CLOSE_REASON_OUTSIDE, CLOSE_REASON_SELECTION } from '@nexora-ui/overlay';

import { applyComboboxAfterClosed } from './combobox-close-behavior';
import { ComboboxFocusOpenState } from './combobox-focus-open-state';

describe('applyComboboxAfterClosed', () => {
  it('queues skip-next-open when not toggle-closed and reason is not outside', async () => {
    const focusState = new ComboboxFocusOpenState();
    const syncSearchToValue = vi.fn();
    const focusInput = vi.fn();

    applyComboboxAfterClosed({
      reason: undefined,
      wasClosingViaToggle: false,
      focusOpenState: focusState,
      syncSearchToValue,
      focusInput,
    });

    expect(syncSearchToValue).toHaveBeenCalledTimes(1);
    expect(focusState.consumeFocusRestore()).toBe(true);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(focusState.consumeFocusRestore()).toBe(false);
    expect(focusInput).not.toHaveBeenCalled();
  });

  it('does not queue skip-next-open for outside or toggle close', () => {
    const outsideState = new ComboboxFocusOpenState();
    applyComboboxAfterClosed({
      reason: CLOSE_REASON_OUTSIDE,
      wasClosingViaToggle: false,
      focusOpenState: outsideState,
      syncSearchToValue: vi.fn(),
      focusInput: vi.fn(),
    });
    expect(outsideState.consumeFocusRestore()).toBe(false);

    const toggleState = new ComboboxFocusOpenState();
    applyComboboxAfterClosed({
      reason: CLOSE_REASON_SELECTION,
      wasClosingViaToggle: true,
      focusOpenState: toggleState,
      syncSearchToValue: vi.fn(),
      focusInput: vi.fn(),
    });
    expect(toggleState.consumeFocusRestore()).toBe(false);
  });

  it('refocuses after selection close', async () => {
    const focusInput = vi.fn();
    applyComboboxAfterClosed({
      reason: CLOSE_REASON_SELECTION,
      wasClosingViaToggle: false,
      focusOpenState: new ComboboxFocusOpenState(),
      syncSearchToValue: vi.fn(),
      focusInput,
    });

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(focusInput).toHaveBeenCalledTimes(1);
  });
});

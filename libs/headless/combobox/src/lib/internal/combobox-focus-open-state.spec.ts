import { ComboboxFocusOpenState } from './combobox-focus-open-state';

describe('ComboboxFocusOpenState', () => {
  it('returns false by default when focus restore is consumed', () => {
    const state = new ComboboxFocusOpenState();
    expect(state.consumeFocusRestore()).toBe(false);
  });

  it('returns true once after marking skip-next-open', async () => {
    const state = new ComboboxFocusOpenState();
    state.markSkipNextOpen();

    expect(state.consumeFocusRestore()).toBe(true);

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(state.consumeFocusRestore()).toBe(false);
  });

  it('can reset skip-next-open via queued reset', async () => {
    const state = new ComboboxFocusOpenState();
    state.markSkipNextOpen();
    state.queueSkipReset();

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(state.consumeFocusRestore()).toBe(false);
  });
});

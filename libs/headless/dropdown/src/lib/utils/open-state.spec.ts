import { CLOSE_REASON_OUTSIDE, CLOSE_REASON_SELECTION } from '@nexora-ui/overlay';

import {
  applyClosedTransition,
  applyOpenedTransition,
  canOpenDropdown,
  shouldQueueSkipNextOpenOnFocus,
  shouldRefocusAfterSelectionClose,
} from './open-state';

describe('canOpenDropdown', () => {
  it('returns true only when open preconditions are met', () => {
    expect(
      canOpenDropdown({
        isOverlayOpen: false,
        isDisabled: false,
        hasAnchor: true,
        hasPanel: true,
      }),
    ).toBe(true);
  });

  it('returns false when already open, disabled, or missing anchor/panel', () => {
    expect(
      canOpenDropdown({
        isOverlayOpen: true,
        isDisabled: false,
        hasAnchor: true,
        hasPanel: true,
      }),
    ).toBe(false);
    expect(
      canOpenDropdown({
        isOverlayOpen: false,
        isDisabled: true,
        hasAnchor: true,
        hasPanel: true,
      }),
    ).toBe(false);
    expect(
      canOpenDropdown({
        isOverlayOpen: false,
        isDisabled: false,
        hasAnchor: false,
        hasPanel: true,
      }),
    ).toBe(false);
    expect(
      canOpenDropdown({
        isOverlayOpen: false,
        isDisabled: false,
        hasAnchor: true,
        hasPanel: false,
      }),
    ).toBe(false);
  });
});

describe('applyOpenedTransition', () => {
  it('sets open, emits opened, and runs optional hook', () => {
    const setOpen = vi.fn();
    const emitOpened = vi.fn();
    const afterOpened = vi.fn();

    applyOpenedTransition({ setOpen, emitOpened, afterOpened });

    expect(setOpen).toHaveBeenCalledWith(true);
    expect(emitOpened).toHaveBeenCalledTimes(1);
    expect(afterOpened).toHaveBeenCalledTimes(1);
  });
});

describe('applyClosedTransition', () => {
  it('clears state, sets closed, runs optional hooks, and emits reason', () => {
    const clearListbox = vi.fn();
    const setOpen = vi.fn();
    const emitClosed = vi.fn();
    const afterClosed = vi.fn();
    const markTouched = vi.fn();

    applyClosedTransition({
      clearListbox,
      setOpen,
      emitClosed,
      reason: CLOSE_REASON_SELECTION,
      afterClosed,
      markTouched,
    });

    expect(clearListbox).toHaveBeenCalledTimes(1);
    expect(setOpen).toHaveBeenCalledWith(false);
    expect(afterClosed).toHaveBeenCalledWith(CLOSE_REASON_SELECTION);
    expect(emitClosed).toHaveBeenCalledWith(CLOSE_REASON_SELECTION);
    expect(markTouched).toHaveBeenCalledTimes(1);
  });
});

describe('close-policy helpers', () => {
  it('queues skip-next-open except toggle or outside close', () => {
    expect(shouldQueueSkipNextOpenOnFocus(undefined, false)).toBe(true);
    expect(shouldQueueSkipNextOpenOnFocus(CLOSE_REASON_SELECTION, false)).toBe(true);
    expect(shouldQueueSkipNextOpenOnFocus(CLOSE_REASON_OUTSIDE, false)).toBe(false);
    expect(shouldQueueSkipNextOpenOnFocus(CLOSE_REASON_SELECTION, true)).toBe(false);
  });

  it('refocuses only when close reason is selection', () => {
    expect(shouldRefocusAfterSelectionClose(CLOSE_REASON_SELECTION)).toBe(true);
    expect(shouldRefocusAfterSelectionClose(CLOSE_REASON_OUTSIDE)).toBe(false);
    expect(shouldRefocusAfterSelectionClose(undefined)).toBe(false);
  });
});

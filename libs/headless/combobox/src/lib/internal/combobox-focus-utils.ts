export interface ComboboxOpenOnInteractionState {
  readonly openPanelOnFocus: boolean;
  readonly isDisabled: boolean;
  readonly shouldSkipOpen: boolean;
  readonly isOpen?: boolean;
}

/** Shared gate for input focus/click-driven open behavior. */
export function shouldOpenPanelOnInputInteraction(
  state: Readonly<ComboboxOpenOnInteractionState>,
): boolean {
  if (!state.openPanelOnFocus || state.isDisabled || state.shouldSkipOpen) {
    return false;
  }

  if (state.isOpen != null && state.isOpen) {
    return false;
  }

  return true;
}

/** Queue focus restore to run after toggle/close settles. */
export function queueComboboxInputFocus(focusInput: () => void): void {
  queueMicrotask(focusInput);
}

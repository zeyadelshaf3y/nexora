import {
  shouldQueueSkipNextOpenOnFocus,
  shouldRefocusAfterSelectionClose,
} from '@nexora-ui/dropdown';
import type { CloseReason } from '@nexora-ui/overlay';

import type { ComboboxFocusOpenState } from './combobox-focus-open-state';
import { queueComboboxInputFocus } from './combobox-focus-utils';

interface ComboboxAfterClosedParams {
  readonly reason: CloseReason | undefined;
  readonly wasClosingViaToggle: boolean;
  readonly focusOpenState: ComboboxFocusOpenState;
  readonly syncSearchToValue: () => void;
  readonly focusInput: () => void;
}

export function applyComboboxAfterClosed(params: ComboboxAfterClosedParams): void {
  const { reason, wasClosingViaToggle, focusOpenState, syncSearchToValue, focusInput } = params;

  if (shouldQueueSkipNextOpenOnFocus(reason, wasClosingViaToggle)) {
    focusOpenState.markSkipNextOpen();
    focusOpenState.queueSkipReset();
  }

  // After panel close: single shows selected label; multi clears the query input.
  syncSearchToValue();

  if (shouldRefocusAfterSelectionClose(reason)) {
    queueComboboxInputFocus(() => focusInput());
  }
}

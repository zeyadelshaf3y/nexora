/**
 * Constants for the headless combobox.
 * Used for CSS class names and invariant messages to avoid duplication and magic strings.
 */

import { OPEN_KEYS } from '@nexora-ui/dropdown';

/** Host class applied to the combobox root element. */
export const COMBOBOX_HOST_CLASS = 'nxr-combobox';

/** Base class applied to the overlay pane that contains the listbox. */
export const COMBOBOX_PANE_CLASS = 'nxr-combobox-pane';

/** Base class applied to the overlay backdrop for combobox panels. */
export const COMBOBOX_BACKDROP_CLASS = 'nxr-combobox-backdrop';

/** Dev-mode invariant: missing input directive. */
export const INVARIANT_MESSAGE_INPUT_REQUIRED =
  '<nxr-combobox> requires a child with [nxrComboboxInput]. Add an input with nxrComboboxInput.';

/** Dev-mode invariant: missing panel template. */
export const INVARIANT_MESSAGE_PANEL_REQUIRED =
  '<nxr-combobox> requires a child <ng-template nxrComboboxPanel>. Add <ng-template nxrComboboxPanel>...</ng-template>.';

/** Key for Backspace (multi mode: empty input removes last chip). */
export const KEY_BACKSPACE = 'Backspace';

const COMBOBOX_OPEN_KEYS_SET = new Set<string>();

for (const key of OPEN_KEYS) {
  if (key !== ' ') COMBOBOX_OPEN_KEYS_SET.add(key);
}

/** Closed-state open keys for combobox input (Space intentionally excluded). */
export const COMBOBOX_OPEN_KEYS: ReadonlySet<string> = COMBOBOX_OPEN_KEYS_SET;

/**
 * Approximate item count above which consumers should consider filtering or virtual scroll.
 * Used in JSDoc only; the component does not enforce a limit.
 */
export const LARGE_LIST_ITEM_THRESHOLD = 100;

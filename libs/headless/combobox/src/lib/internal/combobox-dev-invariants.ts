/**
 * Dev-mode structure checks for {@link ComboboxComponent}.
 */

import { invariant } from '@nexora-ui/core';

import {
  INVARIANT_MESSAGE_INPUT_REQUIRED,
  INVARIANT_MESSAGE_PANEL_REQUIRED,
} from '../constants/combobox-constants';

export function assertComboboxContentStructure(args: {
  readonly inputPresent: boolean;
  readonly useVirtualPanel: boolean;
  readonly panelPresent: boolean;
}): void {
  invariant(args.inputPresent, INVARIANT_MESSAGE_INPUT_REQUIRED);
  if (!args.useVirtualPanel) {
    invariant(args.panelPresent, INVARIANT_MESSAGE_PANEL_REQUIRED);
  }
}

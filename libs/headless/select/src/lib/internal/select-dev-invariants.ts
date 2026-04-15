/**
 * Dev-mode structure checks for {@link SelectComponent}.
 */

import { invariant } from '@nexora-ui/core';

const TRIGGER_MESSAGE =
  '<nxr-select> requires a child element with the [nxrSelectTrigger] directive. ' +
  'Add a <button nxrSelectTrigger> inside <nxr-select>.';

const PANEL_MESSAGE =
  '<nxr-select> requires a child <ng-template nxrSelectPanel>. ' +
  'Add <ng-template nxrSelectPanel>...</ng-template> inside <nxr-select>.';

export function assertSelectContentStructure(args: {
  readonly triggerPresent: boolean;
  readonly useVirtualPanel: boolean;
  readonly panelPresent: boolean;
}): void {
  invariant(args.triggerPresent, TRIGGER_MESSAGE);
  if (!args.useVirtualPanel) {
    invariant(args.panelPresent, PANEL_MESSAGE);
  }
}

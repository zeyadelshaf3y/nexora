/**
 * Dev-mode structure checks for {@link MenuComponent}.
 */

import { invariant } from '@nexora-ui/core';

const TRIGGER_MESSAGE =
  '<nxr-menu> requires a child element with the [nxrMenuTrigger] directive. ' +
  'Add a <button nxrMenuTrigger> inside <nxr-menu>.';

const PANEL_MESSAGE =
  '<nxr-menu> requires a child <ng-template nxrMenuPanel>. ' +
  'Add <ng-template nxrMenuPanel>...</ng-template> inside <nxr-menu>.';

export function assertMenuContentStructure(args: {
  readonly triggerPresent: boolean;
  readonly panelPresent: boolean;
}): void {
  invariant(args.triggerPresent, TRIGGER_MESSAGE);
  invariant(args.panelPresent, PANEL_MESSAGE);
}

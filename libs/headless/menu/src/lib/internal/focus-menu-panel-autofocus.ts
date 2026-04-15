/**
 * After the menu overlay opens, focus the first `[autofocus]` / `[data-autofocus]` target in the pane.
 */

import { safeFocus } from '@nexora-ui/core';
import type { OverlayRef } from '@nexora-ui/overlay';

export function focusMenuPanelAutofocusTarget(overlayRef: OverlayRef | null): void {
  if (!overlayRef) return;

  queueMicrotask(() => {
    const pane = overlayRef.getPaneElement();
    if (!pane) return;
    const target = pane.querySelector<HTMLElement>('[autofocus], [data-autofocus]');
    safeFocus(target);
  });
}

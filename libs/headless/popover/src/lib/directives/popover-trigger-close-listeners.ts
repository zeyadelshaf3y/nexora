import { listen } from '@nexora-ui/core';
import { createOutsideClickListener, isInsideOverlayPaneOrBridge } from '@nexora-ui/overlay';

import type { PopoverFocusCloseCoordinator } from '../internal';

export function attachPopoverFocusPaneListener(params: {
  isFocusTrigger: boolean;
  pane: HTMLElement | null;
  onFocusOut: () => void;
}): (() => void) | null {
  if (!params.isFocusTrigger || params.pane == null) return null;

  return listen(params.pane, 'focusout', params.onFocusOut);
}

export function attachPopoverOutsideClickListener(params: {
  openedBy: 'click' | 'focus' | 'hover' | null;
  anchor: HTMLElement;
  getPane: () => HTMLElement | null;
  close: () => void;
  focusClose: PopoverFocusCloseCoordinator;
}): (() => void) | null {
  if (params.openedBy === 'click') return null;

  return createOutsideClickListener(params.anchor, params.getPane, params.close, {
    considerInside: (target) => isInsideOverlayPaneOrBridge(target),
    onPointerDown: (element) => {
      params.focusClose.onPointerDown(element);
    },
  });
}

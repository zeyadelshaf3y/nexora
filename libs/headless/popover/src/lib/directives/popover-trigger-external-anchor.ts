import { listen } from '@nexora-ui/core';

import {
  popoverHandleBlur,
  popoverHandleClick,
  popoverHandleFocus,
  popoverHandleMouseEnter,
  popoverHandleMouseLeave,
  type PopoverTriggerHost,
} from '../internal';
import type { PopoverTriggerInput } from '../types/popover-trigger-types';

export function getPopoverTriggerSignature(trigger: PopoverTriggerInput): string {
  if (!Array.isArray(trigger)) return trigger;

  return trigger.slice().sort().join('|');
}

export function isPopoverAnchorHovered(element: HTMLElement): boolean {
  try {
    return element.matches(':hover');
  } catch {
    return false;
  }
}

export function attachPopoverExternalAnchorListeners(params: {
  anchor: HTMLElement;
  includesClick: boolean;
  includesFocus: boolean;
  includesHover: boolean;
  host: PopoverTriggerHost;
}): () => void {
  const unsubs: Array<() => void> = [];

  if (params.includesClick) {
    unsubs.push(listen(params.anchor, 'click', () => popoverHandleClick(params.host)));
  }
  if (params.includesFocus) {
    unsubs.push(listen(params.anchor, 'focus', () => popoverHandleFocus(params.host)));
    unsubs.push(listen(params.anchor, 'blur', () => popoverHandleBlur(params.host)));
  }
  if (params.includesHover) {
    unsubs.push(listen(params.anchor, 'mouseenter', () => popoverHandleMouseEnter(params.host)));
    unsubs.push(
      listen(params.anchor, 'mouseleave', (event) =>
        popoverHandleMouseLeave(params.host, event as MouseEvent),
      ),
    );
  }

  return () => {
    for (const off of unsubs) {
      off();
    }
  };
}

import { handleAnchoredHoverLeave, runWithOpenDelay } from '@nexora-ui/overlay';

import type { PopoverTriggerHost } from './popover-trigger-user-actions.types';

export function popoverHandleMouseEnter(host: PopoverTriggerHost): void {
  if (!host.triggerIncludes('hover') || host.nxrPopoverDisabled()) return;

  host.openDelay.cancel();
  host.getHoverBridge()?.cancelClose();
  if (host.getOverlayRef()) return;
  runWithOpenDelay(
    host.nxrPopoverOpenDelay(),
    () => {
      if (!host.getOverlayRef()) host.open('hover');
    },
    host.openDelay,
  );
}

export function popoverHandleMouseLeave(host: PopoverTriggerHost, event: MouseEvent): void {
  handleAnchoredHoverLeave(event, {
    openDelay: host.openDelay,
    isHoverTrigger: () => host.triggerIncludes('hover'),
    openedBy: host.getOpenedBy(),
    overlayRef: host.getOverlayRef(),
    getTriggerElement: () => host.getAnchorElement(),
    getPane: () => host.getOverlayRef()?.getPaneElement() ?? null,
    allowContentHover: host.nxrPopoverAllowContentHover(),
    isNestedOverlay: host.getIsNestedOverlay(),
    getCloseDelay: () => host.getHoverCloseDelay(),
    hoverBridge: host.getHoverBridge(),
    close: () => host.close(),
  });
}

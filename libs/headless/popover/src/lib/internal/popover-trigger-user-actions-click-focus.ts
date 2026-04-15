import { CLOSE_REASON_PROGRAMMATIC } from '@nexora-ui/overlay';

import type { PopoverTriggerHost } from './popover-trigger-user-actions.types';

export function popoverHandleClick(host: PopoverTriggerHost): void {
  if (!host.triggerIncludes('click') || host.nxrPopoverDisabled()) return;

  const ref = host.getOverlayRef();
  if (ref) {
    ref.close(CLOSE_REASON_PROGRAMMATIC);

    return;
  }
  host.open('click');
}

export function popoverHandleFocus(host: PopoverTriggerHost): void {
  if (!host.triggerIncludes('focus') || host.nxrPopoverDisabled()) return;

  host.openDelay.cancel();
  host.focusClose.cancel();
  const delay = host.nxrPopoverOpenDelay();

  if (delay > 0 && !host.getOverlayRef()) {
    host.openDelay.schedule(delay, () => {
      if (!host.getOverlayRef()) host.open('focus');
    });
  } else if (!host.getOverlayRef()) {
    host.open('focus');
  }
}

export function popoverHandleBlur(host: PopoverTriggerHost): void {
  if (!host.triggerIncludes('focus') || host.getOpenedBy() !== 'focus') return;

  host.openDelay.cancel();
  if (!host.getOverlayRef()) return;

  host.scheduleFocusCloseCheck();
}

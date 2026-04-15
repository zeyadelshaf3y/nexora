import { CLOSE_REASON_PROGRAMMATIC, type CloseReason } from '@nexora-ui/overlay';

export type PopoverTriggerClosedHandlerParams = {
  clearHoverBridge: () => void;
  removeFocusPaneListeners: () => void;
  removeOutsideClickListener: () => void;
  clearOverlayRef: () => void;
  clearOpenedBy: () => void;
  setIsOpen: (open: boolean) => void;
  setPaneId: (paneId: string | null) => void;
  consumeClosedTransition: () => { suppressClosedEmit: boolean; reopenHoveredAnchor: boolean };
  emitClosed: (reason: CloseReason) => void;
  reopenHoveredAnchor: () => void;
};

export function handlePopoverTriggerClosedState(
  params: {
    reason: unknown;
  } & PopoverTriggerClosedHandlerParams,
): void {
  params.clearHoverBridge();
  params.removeFocusPaneListeners();
  params.removeOutsideClickListener();
  params.clearOverlayRef();
  params.clearOpenedBy();
  params.setIsOpen(false);
  params.setPaneId(null);

  const transition = params.consumeClosedTransition();
  if (!transition.suppressClosedEmit) {
    params.emitClosed((params.reason as CloseReason) ?? CLOSE_REASON_PROGRAMMATIC);
  }
  if (transition.reopenHoveredAnchor) {
    params.reopenHoveredAnchor();
  }
}

export function createPopoverTriggerClosedHandler(
  params: PopoverTriggerClosedHandlerParams,
): (reason?: unknown) => void {
  return (reason?: unknown) => {
    handlePopoverTriggerClosedState({
      reason,
      ...params,
    });
  };
}

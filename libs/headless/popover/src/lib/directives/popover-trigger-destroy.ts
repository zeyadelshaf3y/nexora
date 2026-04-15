export type PopoverTriggerDestroyParams = {
  markDestroyed: () => void;
  cancelOpenDelay: () => void;
  cancelFocusClose: () => void;
  destroyExternalAnchorState: () => void;
  clearHoverBridgeState: () => void;
  clearFocusPaneListener: () => void;
  clearOutsideClickListener: () => void;
  disposeOverlayRef: () => void;
  clearOverlayRef: () => void;
  setIsOpen: (open: boolean) => void;
  setPaneId: (paneId: string | null) => void;
};

/** Shared teardown order for `PopoverTriggerDirective` to keep destruction predictable. */
export function destroyPopoverTriggerState(params: PopoverTriggerDestroyParams): void {
  params.markDestroyed();
  params.cancelOpenDelay();
  params.cancelFocusClose();
  params.destroyExternalAnchorState();
  params.clearHoverBridgeState();
  params.clearFocusPaneListener();
  params.clearOutsideClickListener();
  params.disposeOverlayRef();
  params.clearOverlayRef();
  params.setIsOpen(false);
  params.setPaneId(null);
}

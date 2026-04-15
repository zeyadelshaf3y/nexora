import { type DestroyRef } from '@angular/core';
import {
  DATA_ATTR_POPOVER_BRIDGE,
  PANE_ID_PREFIX_POPOVER,
  setupAnchoredOverlayOpenedState,
  type HoverBridge,
  type OverlayRef,
} from '@nexora-ui/overlay';

export function setupPopoverTriggerOpenedState(params: {
  ref: OverlayRef;
  anchor: HTMLElement;
  role: string;
  isHoverTrigger: boolean;
  getHoverCloseDelay: () => number;
  onClose: () => void;
  allowContentHover: boolean;
  onStateChange: (state: { paneId: string | null; isOpen: boolean }) => void;
  onClosed: (reason?: unknown) => void;
  bridgeRef: { bridge: HoverBridge | null; cleanup: (() => void) | null };
  attachOutsideClick: () => void;
  attachFocusPaneListeners: () => void;
  destroyRef: DestroyRef;
}): void {
  setupAnchoredOverlayOpenedState({
    ref: params.ref,
    anchor: params.anchor,
    paneIdPrefix: PANE_ID_PREFIX_POPOVER,
    role: params.role,
    isHoverTrigger: params.isHoverTrigger,
    getHoverCloseDelay: params.getHoverCloseDelay,
    onClose: params.onClose,
    allowContentHover: params.allowContentHover,
    bridgeAttr: DATA_ATTR_POPOVER_BRIDGE,
    onStateChange: params.onStateChange,
    onClosed: params.onClosed,
    bridgeRef: params.bridgeRef,
    attachOutsideClick: params.attachOutsideClick,
    attachFocusPaneListeners: params.attachFocusPaneListeners,
    destroyRef: params.destroyRef,
  });
}

import { type DestroyRef } from '@angular/core';
import { type HoverBridge, type OverlayRef } from '@nexora-ui/overlay';

import {
  createPopoverTriggerClosedHandler,
  type PopoverTriggerClosedHandlerParams,
} from './popover-trigger-closed-state';
import { setupPopoverTriggerOpenedState } from './popover-trigger-opened-state';

export type PopoverTriggerOpenedLifecycleParams = {
  ref: OverlayRef;
  anchor: HTMLElement;
  role: string;
  isHoverTrigger: boolean;
  getHoverCloseDelay: () => number;
  onClose: () => void;
  allowContentHover: boolean;
  onStateChange: (state: { paneId: string | null; isOpen: boolean }) => void;
  closeHandlerParams: PopoverTriggerClosedHandlerParams;
  attachOutsideClick: () => void;
  attachFocusPaneListeners: () => void;
  destroyRef: DestroyRef;
};

export type PopoverTriggerBridgeRef = {
  bridge: HoverBridge | null;
  cleanup: (() => void) | null;
};

/**
 * Wires opened-state callbacks and returns the hover bridge references produced by the overlay layer.
 */
export function runPopoverTriggerOpenedLifecycle(
  params: PopoverTriggerOpenedLifecycleParams,
): PopoverTriggerBridgeRef {
  const bridgeRef = { bridge: null as HoverBridge | null, cleanup: null as (() => void) | null };
  const handleClosed = createPopoverTriggerClosedHandler(params.closeHandlerParams);

  setupPopoverTriggerOpenedState({
    ref: params.ref,
    anchor: params.anchor,
    role: params.role,
    isHoverTrigger: params.isHoverTrigger,
    getHoverCloseDelay: params.getHoverCloseDelay,
    onClose: params.onClose,
    allowContentHover: params.allowContentHover,
    onStateChange: params.onStateChange,
    onClosed: handleClosed,
    bridgeRef,
    attachOutsideClick: params.attachOutsideClick,
    attachFocusPaneListeners: params.attachFocusPaneListeners,
    destroyRef: params.destroyRef,
  });

  return bridgeRef;
}

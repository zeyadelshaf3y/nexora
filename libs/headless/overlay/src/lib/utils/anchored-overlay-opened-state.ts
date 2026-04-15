/**
 * Shared setup for anchored overlay "opened state" (tooltip, popover).
 * Centralizes: pane id/role, hover bridge attachment, outside-click and focus-pane
 * attachment, and afterClosed subscription with cleanup.
 * @internal
 */

import type { DestroyRef } from '@angular/core';

import { OVERLAY_SELECTOR_PANE } from '../defaults/overlay-attributes';
import { createHoverBridgeAndAttach, type HoverBridge } from '../hover/hover-bridge';
import type { OverlayRef } from '../ref/overlay-ref';

import { afterClosedOnceUntilDestroyed } from './after-closed-once-until-destroyed';
import { subscribeOnceAfterClosed } from './subscribe-once-after-closed';

function subscribeAnchoredAfterClosed(
  ref: OverlayRef,
  next: (reason: unknown) => void,
  destroyRef: DestroyRef | undefined,
): { unsubscribe: () => void } {
  if (destroyRef) {
    afterClosedOnceUntilDestroyed(ref, destroyRef).subscribe(next);

    return { unsubscribe: () => {} };
  }

  const sub = subscribeOnceAfterClosed(ref, next);

  return { unsubscribe: () => sub.unsubscribe() };
}

export interface AnchoredOverlayOpenedStateOptions {
  readonly ref: OverlayRef;
  readonly anchor: HTMLElement;
  readonly paneIdPrefix: string;
  readonly role: string;
  readonly isHoverTrigger: boolean;
  readonly getHoverCloseDelay: () => number;
  readonly onClose: () => void;
  readonly allowContentHover: boolean;
  readonly bridgeAttr: string;
  readonly onStateChange: (state: { paneId: string | null; isOpen: boolean }) => void;
  /** Called when the overlay has closed. Reason is the value from afterClosed (e.g. CloseReason). */
  readonly onClosed: (reason?: unknown) => void;
  /** Filled by this function; used by directive for hoverBridge?.cancelClose() etc. */
  readonly bridgeRef: { bridge: HoverBridge | null; cleanup: (() => void) | null };
  readonly attachOutsideClick?: () => void;
  readonly attachFocusPaneListeners?: () => void;
  /** When set, afterClosed subscription is cleaned up automatically on destroy; returned unsubscribe is a no-op. */
  readonly destroyRef?: DestroyRef;
}

/**
 * Sets up pane id/role, optional hover bridge, outside-click and focus-pane listeners,
 * and afterClosed subscription. Calls onClosed when the overlay closes.
 * Returns an object with unsubscribe() for the afterClosed subscription.
 */
export function setupAnchoredOverlayOpenedState(options: AnchoredOverlayOpenedStateOptions): {
  unsubscribe: () => void;
} {
  const {
    ref,
    anchor,
    paneIdPrefix,
    role,
    isHoverTrigger,
    getHoverCloseDelay,
    onClose,
    allowContentHover,
    bridgeAttr,
    onStateChange,
    onClosed,
    bridgeRef,
    attachOutsideClick,
    attachFocusPaneListeners,
    destroyRef,
  } = options;

  const pane = ref.getPaneElement();
  const id = pane ? `${paneIdPrefix}-${ref.id}` : null;

  if (pane && id) {
    pane.id = id;
    pane.setAttribute('role', role);
  }

  onStateChange({ paneId: id, isOpen: true });

  bridgeRef.bridge = null;
  bridgeRef.cleanup = null;

  if (isHoverTrigger && pane) {
    const isNestedOverlay = anchor.closest(OVERLAY_SELECTOR_PANE) != null;
    const { bridge, detach } = createHoverBridgeAndAttach(
      {
        anchor,
        pane,
        getCloseDelay: getHoverCloseDelay,
        onClose,
        bridgeAttr,
        treatAnyOverlayPaneAsInside: !isNestedOverlay,
      },
      allowContentHover,
    );
    bridgeRef.bridge = bridge;
    bridgeRef.cleanup = detach;
  }

  attachOutsideClick?.();
  attachFocusPaneListeners?.();

  const next = (reason: unknown) => {
    bridgeRef.cleanup?.();
    bridgeRef.bridge = null;
    bridgeRef.cleanup = null;
    onClosed(reason);
  };

  return subscribeAnchoredAfterClosed(ref, next, destroyRef);
}

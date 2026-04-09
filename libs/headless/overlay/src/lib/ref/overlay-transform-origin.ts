import { getResolvedDir } from '@nexora-ui/core';

import { getTriggerOriginPoint } from '../position/placement-utils';
import type { Placement } from '../position/position-result';

import { setTransformOriginFromViewportPoint } from './overlay-viewport-bounds';

/** Pane top-left in viewport coordinates. Null when `defaultView` is missing (SSR / detached). */
export function getPaneComputedPositionOrigin(
  pane: HTMLElement,
): { left: number; top: number } | null {
  const win = pane.ownerDocument?.defaultView;

  if (!win) return null;

  const computed = win.getComputedStyle(pane);
  const left = parseFloat(computed.getPropertyValue('left')) || parseFloat(pane.style.left) || 0;
  const top = parseFloat(computed.getPropertyValue('top')) || parseFloat(pane.style.top) || 0;

  return { left, top };
}

/**
 * Sets `transform-origin` on the pane from a trigger element and last placement so enter/close
 * animations can grow from the trigger edge/corner.
 */
export function applyOverlayTransformOriginFromTrigger(
  pane: HTMLElement,
  triggerElement: HTMLElement | undefined,
  lastPlacement: Placement | null,
): void {
  if (!triggerElement?.getBoundingClientRect) return;

  const triggerRect = triggerElement.getBoundingClientRect();
  const dir = getResolvedDir(triggerElement);

  const viewportPoint =
    lastPlacement != null
      ? getTriggerOriginPoint(triggerRect, lastPlacement, dir)
      : {
          x: triggerRect.left + triggerRect.width / 2,
          y: triggerRect.top + triggerRect.height / 2,
        };

  const paneOrigin = getPaneComputedPositionOrigin(pane);

  if (paneOrigin == null) return;

  setTransformOriginFromViewportPoint(pane, viewportPoint, paneOrigin);
}

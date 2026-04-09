/**
 * Internal helper: applies or clears arrow-related CSS variables on the overlay pane.
 * Used when the position strategy returns arrowOffset (e.g. AnchoredStrategy for popovers).
 * Keeps arrow logic separate from overlay ref and preserves tree-shaking (not part of public API).
 * @internal
 */

import { rectsIntersect } from '@nexora-ui/core';

import { DEFAULT_ARROW_HEIGHT, DEFAULT_ARROW_WIDTH } from '../defaults/constants';
import type { ArrowSide } from '../position/position-result';
import type { ArrowSize } from '../ref/overlay-config';

/** Re-export for backward compatibility and tests. */
export { DEFAULT_ARROW_HEIGHT, DEFAULT_ARROW_WIDTH };

export interface ApplyArrowStylesParams {
  readonly pane: HTMLElement;
  readonly arrowOffset: { x: number; y: number };
  readonly arrowSide: ArrowSide | undefined;
  readonly arrowSize: ArrowSize;
  readonly anchorInViewport: boolean;
}

const ARROW_VAR_X = '--nxr-arrow-x';
const ARROW_VAR_Y = '--nxr-arrow-y';
const ARROW_VAR_SIDE = '--nxr-arrow-side';
const ARROW_VAR_ROTATE = '--nxr-arrow-rotate';
const ARROW_VAR_VISIBLE = '--nxr-arrow-visible';
const ARROW_VAR_WIDTH = '--nxr-arrow-width';
const ARROW_VAR_HEIGHT = '--nxr-arrow-height';
const ARROW_INSET_PX = 1;

const ROTATE_BY_SIDE: Record<ArrowSide, string> = {
  top: '0deg',
  bottom: '180deg',
  start: '-90deg',
  end: '90deg',
};

/**
 * Reads the pane's computed border-radius and returns the largest corner
 * value. Used as extra edge padding so the arrow never overlaps a rounded corner.
 *
 * `getComputedStyle` always returns resolved pixel values for border-radius,
 * so `parseFloat` is safe regardless of the authored CSS unit.
 */
function getArrowEdgePadding(pane: HTMLElement): number {
  try {
    const win = pane.ownerDocument?.defaultView;

    if (!win) return 0;

    const cs = win.getComputedStyle(pane);

    return Math.max(
      parseFloat(cs.borderTopLeftRadius) || 0,
      parseFloat(cs.borderTopRightRadius) || 0,
      parseFloat(cs.borderBottomLeftRadius) || 0,
      parseFloat(cs.borderBottomRightRadius) || 0,
    );
  } catch {
    return 0;
  }
}

/**
 * Clamps the arrow's anchor-center offset so the arrow element stays
 * within the panel boundaries and clears any rounded corners.
 *
 * The minimum distance from each edge is `arrowWidth / 2` (so the arrow
 * element doesn't overflow) **plus** the panel's border-radius (so the
 * arrow sits on the flat portion of the edge, not inside the curve).
 *
 * For top/bottom sides the arrow moves along X.
 * For start/end sides the arrow moves along Y (using `aw` — the arrow's
 * visual height after 90° rotation).
 */
function clampArrowOffset(
  offset: { x: number; y: number },
  side: ArrowSide,
  size: ArrowSize,
  paneWidth: number,
  paneHeight: number,
  edgePadding: number,
): { x: number; y: number } {
  const pad = size.width / 2 + edgePadding;

  if (side === 'top' || side === 'bottom') {
    if (paneWidth <= pad * 2) return offset;

    return {
      x: Math.max(pad, Math.min(paneWidth - pad, offset.x)),
      y: offset.y,
    };
  }

  if (paneHeight <= pad * 2) return offset;

  return {
    x: offset.x,
    y: Math.max(pad, Math.min(paneHeight - pad, offset.y)),
  };
}

/**
 * Offsets arrow position so its base is flush with the pane edge and it is
 * centered on the anchor axis.  The base ^ shape points up; rotation around
 * its center produces V / < / > for the other three sides.
 *
 * Because the directive now uses `transform-origin: center` (no translate),
 * we handle both centering and edge-flush positioning here.
 *
 * A small inward inset avoids hairline seams between the panel and arrow that
 * can appear on some browsers due to clip-path anti-aliasing.
 */
function offsetArrowPosition(
  x: number,
  y: number,
  side: ArrowSide,
  size: ArrowSize,
): { x: number; y: number } {
  const { width: aw, height: ah } = size;
  switch (side) {
    case 'top':
      return { x: x - aw / 2, y: -ah + ARROW_INSET_PX };
    case 'bottom':
      return { x: x - aw / 2, y: y - ARROW_INSET_PX };
    case 'end':
      return { x: x - ah / 2 - ARROW_INSET_PX, y: y - ah / 2 };
    case 'start':
      return { x: x - aw + ah / 2 + ARROW_INSET_PX, y: y - ah / 2 };
    default:
      return { x, y };
  }
}

/**
 * Applies arrow CSS variables to the pane. Call when result.arrowOffset is set.
 * The arrow offset is clamped to the panel bounds and border-radius so the
 * arrow never overflows or overlaps a rounded corner.
 */
export function applyArrowStyles(params: ApplyArrowStylesParams): void {
  const { pane, arrowOffset, arrowSide, arrowSize, anchorInViewport } = params;
  const side = arrowSide ?? 'top';
  const edgePadding = getArrowEdgePadding(pane);
  const clamped = clampArrowOffset(
    arrowOffset,
    side,
    arrowSize,
    pane.offsetWidth,
    pane.offsetHeight,
    edgePadding,
  );

  const { x: ox, y: oy } = offsetArrowPosition(clamped.x, clamped.y, side, arrowSize);

  pane.style.setProperty(ARROW_VAR_X, `${ox}px`);
  pane.style.setProperty(ARROW_VAR_Y, `${oy}px`);
  pane.style.setProperty(ARROW_VAR_VISIBLE, anchorInViewport ? 'visible' : 'hidden');
  pane.style.setProperty(ARROW_VAR_WIDTH, `${arrowSize.width}px`);
  pane.style.setProperty(ARROW_VAR_HEIGHT, `${arrowSize.height}px`);

  if (arrowSide) {
    pane.style.setProperty(ARROW_VAR_SIDE, arrowSide);
    pane.style.setProperty(ARROW_VAR_ROTATE, ROTATE_BY_SIDE[arrowSide]);
  }

  pane.style.overflow = 'visible';
}

/**
 * Removes arrow CSS variables from the pane. Call when result.arrowOffset is not set.
 */
export function clearArrowStyles(pane: HTMLElement): void {
  pane.style.removeProperty(ARROW_VAR_X);
  pane.style.removeProperty(ARROW_VAR_Y);
  pane.style.removeProperty(ARROW_VAR_SIDE);
  pane.style.removeProperty(ARROW_VAR_ROTATE);
  pane.style.removeProperty(ARROW_VAR_VISIBLE);
  pane.style.removeProperty(ARROW_VAR_WIDTH);
  pane.style.removeProperty(ARROW_VAR_HEIGHT);
  pane.style.overflow = '';
}

/** Returns whether the anchor rect intersects the viewport (for hiding arrow when anchor is off-screen). */
export function isAnchorInViewport(
  anchorRect: DOMRect | undefined,
  viewportRect: DOMRect,
): boolean {
  return rectsIntersect(anchorRect, viewportRect);
}

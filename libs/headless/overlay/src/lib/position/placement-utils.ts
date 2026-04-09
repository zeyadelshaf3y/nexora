/**
 * Shared placement geometry for anchored overlays. Single source of truth for the 12 placements
 * and RTL/LTR so overlay position and transform-origin stay in sync.
 * @internal
 */

import type { Placement } from './position-result';

/** Direction for start/end resolution. */
export type PlacementDir = 'ltr' | 'rtl';

/**
 * Returns the viewport (x, y) of the trigger point that should be the transform origin
 * for the given placement. Handles RTL: start/end map to left/right by dir.
 */
export function getTriggerOriginPoint(
  triggerRect: DOMRect,
  placement: Placement,
  dir: PlacementDir,
): { x: number; y: number } {
  const isRtl = dir === 'rtl';
  const startX = isRtl ? triggerRect.right : triggerRect.left;
  const endX = isRtl ? triggerRect.left : triggerRect.right;
  const centerX = triggerRect.left + triggerRect.width / 2;
  const topY = triggerRect.top;
  const bottomY = triggerRect.bottom;
  const centerY = triggerRect.top + triggerRect.height / 2;

  switch (placement) {
    case 'top-start':
      return { x: startX, y: topY };
    case 'top':
      return { x: centerX, y: topY };
    case 'top-end':
      return { x: endX, y: topY };
    case 'bottom-start':
      return { x: startX, y: bottomY };
    case 'bottom':
      return { x: centerX, y: bottomY };
    case 'bottom-end':
      return { x: endX, y: bottomY };
    case 'start-top':
      return { x: startX, y: topY };
    case 'start':
      return { x: startX, y: centerY };
    case 'start-end':
      return { x: startX, y: bottomY };
    case 'end-start':
      return { x: endX, y: topY };
    case 'end':
      return { x: endX, y: centerY };
    case 'end-end':
      return { x: endX, y: bottomY };
    default:
      return {
        x: centerX,
        y: triggerRect.top + triggerRect.height / 2,
      };
  }
}

/**
 * Returns the CSS transform-origin keyword for the given placement and direction.
 * Used by position strategies so pane origin matches the trigger edge/corner (RTL-aware).
 */
export function getTransformOriginKeyword(placement: Placement, dir: PlacementDir): string {
  const isRtl = dir === 'rtl';
  switch (placement) {
    case 'top-start':
      return isRtl ? 'right bottom' : 'left bottom';
    case 'top':
      return 'center bottom';
    case 'top-end':
      return isRtl ? 'left bottom' : 'right bottom';
    case 'bottom-start':
      return isRtl ? 'right top' : 'left top';
    case 'bottom':
      return 'center top';
    case 'bottom-end':
      return isRtl ? 'left top' : 'right top';
    case 'start-top':
      return isRtl ? 'left top' : 'right top';
    case 'start':
      return isRtl ? 'left center' : 'right center';
    case 'start-end':
      return isRtl ? 'left bottom' : 'right bottom';
    case 'end-start':
      return isRtl ? 'right top' : 'left top';
    case 'end':
      return isRtl ? 'right center' : 'left center';
    case 'end-end':
      return isRtl ? 'right bottom' : 'left bottom';
    default:
      return 'center center';
  }
}

/** Overlay (x, y) and transform-origin for a placement relative to anchor. Used by AnchoredStrategy. */
export function placementToRect(
  placement: Placement,
  anchorRect: DOMRect,
  overlaySize: { width: number; height: number },
  offset: number,
  dir: PlacementDir,
): { x: number; y: number; transformOrigin: string } {
  const isRtl = dir === 'rtl';
  const overlayStartAlignedLeft = isRtl ? anchorRect.right - overlaySize.width : anchorRect.left;
  const overlayEndAlignedLeft = isRtl ? anchorRect.left : anchorRect.right - overlaySize.width;
  const centerX = anchorRect.left + (anchorRect.width - overlaySize.width) / 2;
  const centerY = anchorRect.top + (anchorRect.height - overlaySize.height) / 2;

  const transformOrigin = getTransformOriginKeyword(placement, dir);

  const xForVerticalPlacement = (p: Placement): number =>
    p.endsWith('start')
      ? overlayStartAlignedLeft
      : p.endsWith('end')
        ? overlayEndAlignedLeft
        : centerX;

  const yForHorizontalPlacement = (p: Placement): number =>
    p.endsWith('-top') || p.endsWith('-start')
      ? anchorRect.top
      : p.endsWith('-end')
        ? anchorRect.bottom - overlaySize.height
        : centerY;

  switch (placement) {
    case 'top-start':
    case 'top':
    case 'top-end':
      return {
        x: xForVerticalPlacement(placement),
        y: anchorRect.top - overlaySize.height - offset,
        transformOrigin,
      };

    case 'bottom-start':
    case 'bottom':
    case 'bottom-end':
      return {
        x: xForVerticalPlacement(placement),
        y: anchorRect.bottom + offset,
        transformOrigin,
      };

    case 'start-top':
    case 'start':
    case 'start-end':
      return {
        x: isRtl ? anchorRect.right + offset : anchorRect.left - overlaySize.width - offset,
        y: yForHorizontalPlacement(placement),
        transformOrigin,
      };

    case 'end-start':
    case 'end':
    case 'end-end':
      return {
        x: isRtl ? anchorRect.left - overlaySize.width - offset : anchorRect.right + offset,
        y: yForHorizontalPlacement(placement),
        transformOrigin,
      };
  }
}

export function fitsInViewport(
  x: number,
  y: number,
  w: number,
  h: number,
  viewport: DOMRect,
  padding: number,
): boolean {
  return (
    x >= viewport.left + padding &&
    y >= viewport.top + padding &&
    x + w <= viewport.right - padding &&
    y + h <= viewport.bottom - padding
  );
}

export function clampToViewport(
  x: number,
  y: number,
  w: number,
  h: number,
  viewport: DOMRect,
  padding: number,
): { x: number; y: number } {
  const minX = viewport.left + padding;
  const minY = viewport.top + padding;
  const maxX = viewport.right - padding - w;
  const maxY = viewport.bottom - padding - h;

  return {
    x: Math.max(minX, Math.min(maxX, x)),
    y: Math.max(minY, Math.min(maxY, y)),
  };
}

/**
 * Returns true when the anchor rect lies entirely inside the viewport (including padding).
 * Used for placement order: when the anchor is inside we try the normal fallback order.
 */
export function isAnchorFullyInsideViewport(
  anchor: DOMRect,
  viewport: DOMRect,
  padding: number,
): boolean {
  return (
    anchor.left >= viewport.left + padding &&
    anchor.top >= viewport.top + padding &&
    anchor.right <= viewport.right - padding &&
    anchor.bottom <= viewport.bottom - padding
  );
}

/**
 * Returns true when the anchor rect has no overlap with the viewport (fully above, below, or to the side).
 * Used to detect when the trigger has left the viewport so the panel can follow it (e.g. reposition + maintainInViewport false).
 */
export function isAnchorFullyOutOfViewport(
  anchor: DOMRect,
  viewport: DOMRect,
  padding: number,
): boolean {
  return (
    anchor.right <= viewport.left + padding ||
    anchor.left >= viewport.right - padding ||
    anchor.bottom <= viewport.top + padding ||
    anchor.top >= viewport.bottom - padding
  );
}

/**
 * Gap computation between anchor and overlay pane for the hover bridge.
 * Uses pane layout rect (no transform) so the gap is correct during enter/exit animations.
 * @internal
 */

const MIN_GAP_SIZE = 1;

/** Gap rectangle in viewport coordinates. */
export interface GapRect {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

interface Bounds {
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
}

function rectToBounds(r: DOMRect): Bounds {
  return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
}

/** Pane rect from layout (ignores CSS transform) so bridge is correct with enter/exit animations. */
export function getPaneLayoutRect(pane: HTMLElement): Bounds | null {
  const win = pane.ownerDocument?.defaultView;

  if (!win) return null;

  const cs = win.getComputedStyle(pane);
  const pos = cs.position;

  if (pos !== 'fixed' && pos !== 'absolute') return null;

  const left = parseFloat(cs.left) || 0;
  const top = parseFloat(cs.top) || 0;
  const w = pane.offsetWidth;
  const h = pane.offsetHeight;

  if (pos === 'absolute' && pane.offsetParent) {
    const parentRect = pane.offsetParent.getBoundingClientRect();

    return {
      left: parentRect.left + left,
      right: parentRect.left + left + w,
      top: parentRect.top + top,
      bottom: parentRect.top + top + h,
    };
  }

  return { left, right: left + w, top, bottom: top + h };
}

/** Gap bounds between two rects; null if they overlap. */
function getGapBounds(anchor: Bounds, pane: Bounds): Bounds | null {
  if (pane.top >= anchor.bottom) {
    return {
      left: Math.min(anchor.left, pane.left),
      right: Math.max(anchor.right, pane.right),
      top: anchor.bottom,
      bottom: pane.top,
    };
  }

  if (pane.bottom <= anchor.top) {
    return {
      left: Math.min(anchor.left, pane.left),
      right: Math.max(anchor.right, pane.right),
      top: pane.bottom,
      bottom: anchor.top,
    };
  }

  if (pane.right <= anchor.left) {
    return {
      left: pane.right,
      right: anchor.left,
      top: Math.min(anchor.top, pane.top),
      bottom: Math.max(anchor.bottom, pane.bottom),
    };
  }

  if (pane.left >= anchor.right) {
    return {
      left: anchor.right,
      right: pane.left,
      top: Math.min(anchor.top, pane.top),
      bottom: Math.max(anchor.bottom, pane.bottom),
    };
  }

  return null;
}

function boundsToGapRect(bounds: Bounds): GapRect | null {
  const width = bounds.right - bounds.left;
  const height = bounds.bottom - bounds.top;

  if (width < MIN_GAP_SIZE || height < MIN_GAP_SIZE) return null;

  return { left: bounds.left, top: bounds.top, width, height };
}

/** Returns true if two gap rects are equal or both null. */
export function gapEquals(a: GapRect | null, b: GapRect | null): boolean {
  if (a === b) return true;

  if (!a || !b) return false;

  return a.left === b.left && a.top === b.top && a.width === b.width && a.height === b.height;
}

/**
 * Computes the gap rectangle between anchor and pane in viewport coordinates.
 * Uses pane layout rect (ignores transform) so the result is correct during animations.
 */
export function computeGapRect({
  anchor,
  pane,
}: {
  readonly anchor: HTMLElement;
  readonly pane: HTMLElement;
}): GapRect | null {
  const anchorBounds = rectToBounds(anchor.getBoundingClientRect());
  const paneBounds = getPaneLayoutRect(pane) ?? rectToBounds(pane.getBoundingClientRect());
  const gapBounds = getGapBounds(anchorBounds, paneBounds);

  return gapBounds != null ? boundsToGapRect(gapBounds) : null;
}

/** Rect-like shape for layout calculations. Pure types and helpers; no DOM access. */
export interface Rect {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly width: number;
  readonly height: number;
}

/** Returns whether two rects overlap in 2D (both must be defined). */
function rectsOverlap(a: Rect | DOMRect, b: Rect | DOMRect): boolean {
  return a.right >= b.left && a.left <= b.right && a.bottom >= b.top && a.top <= b.bottom;
}

/**
 * Returns whether two rects intersect (overlap) in 2D.
 *
 * When either rect is `undefined`, returns `true` (assumes intersection).
 * This is intentional: callers like `isAnchorInViewport` treat a missing
 * anchor as "assume visible" so the arrow stays shown.
 *
 * @param a - First rect (or undefined).
 * @param b - Second rect (or undefined).
 * @returns `true` if the rects overlap or either is undefined.
 */
export function rectsIntersect(
  a: Rect | DOMRect | undefined,
  b: Rect | DOMRect | undefined,
): boolean {
  if (!a || !b) return true;

  return rectsOverlap(a, b);
}

/**
 * Strict version of {@link rectsIntersect} that returns `false` when either
 * rect is `undefined` or `null`. Use this when missing data should mean
 * "no intersection" rather than "assume visible".
 *
 * @param a - First rect (or undefined/null).
 * @param b - Second rect (or undefined/null).
 * @returns `true` only if both rects are defined and overlap.
 */
export function rectsIntersectStrict(
  a: Rect | DOMRect | undefined | null,
  b: Rect | DOMRect | undefined | null,
): boolean {
  if (!a || !b) return false;

  return rectsOverlap(a, b);
}

/**
 * Creates a `Rect` from position and size.
 *
 * @param left - X position of the left edge.
 * @param top - Y position of the top edge.
 * @param width - Width of the rect.
 * @param height - Height of the rect.
 */
export function rectFromSize(left: number, top: number, width: number, height: number): Rect {
  return {
    left,
    top,
    right: left + width,
    bottom: top + height,
    width,
    height,
  };
}

/**
 * Placement families and ordering for anchored overlay flip/fallback logic.
 * Each family is three placements on one side of the anchor (e.g. bottom-start, bottom, bottom-end).
 * @internal
 */

import type { Placement } from './position-result';

/** All 12 placements in a canonical order for fallback. */
export const ALL_PLACEMENTS: readonly Placement[] = [
  'bottom-start',
  'bottom',
  'bottom-end',
  'top-start',
  'top',
  'top-end',
  'start-top',
  'start',
  'start-end',
  'end-start',
  'end',
  'end-end',
];

const ALL_PLACEMENT_INDEX = new Map<Placement, number>();

ALL_PLACEMENTS.forEach((p, i) => {
  ALL_PLACEMENT_INDEX.set(p, i);
});

export const TOP_PLACEMENTS: readonly Placement[] = ['top-start', 'top', 'top-end'];
export const BOTTOM_PLACEMENTS: readonly Placement[] = ['bottom-start', 'bottom', 'bottom-end'];
export const START_PLACEMENTS: readonly Placement[] = ['start-top', 'start', 'start-end'];
export const END_PLACEMENTS: readonly Placement[] = ['end-start', 'end', 'end-end'];

const TOP_PLACEMENT_SET = new Set<Placement>(TOP_PLACEMENTS);
const BOTTOM_PLACEMENT_SET = new Set<Placement>(BOTTOM_PLACEMENTS);
const START_PLACEMENT_SET = new Set<Placement>(START_PLACEMENTS);
const END_PLACEMENT_SET = new Set<Placement>(END_PLACEMENTS);

/** Index 0 = start/top alignment, 1 = center, 2 = end/bottom alignment. Used to map any placement into a family. */
type AlignmentIndex = 0 | 1 | 2;

function alignmentIndex(placement: Placement): AlignmentIndex {
  if (
    placement === 'bottom-start' ||
    placement === 'top-start' ||
    placement === 'start-top' ||
    placement === 'end-start'
  ) {
    return 0;
  }
  if (
    placement === 'bottom' ||
    placement === 'top' ||
    placement === 'start' ||
    placement === 'end'
  ) {
    return 1;
  }

  return 2;
}

export function placementToBottomFamily(placement: Placement): Placement {
  return BOTTOM_PLACEMENTS[alignmentIndex(placement)];
}

export function placementToTopFamily(placement: Placement): Placement {
  return TOP_PLACEMENTS[alignmentIndex(placement)];
}

export function placementToEndFamily(placement: Placement): Placement {
  return END_PLACEMENTS[alignmentIndex(placement)];
}

export function placementToStartFamily(placement: Placement): Placement {
  return START_PLACEMENTS[alignmentIndex(placement)];
}

/** Fallback order: preferred first, then the rest of ALL_PLACEMENTS. */
export function fallbackOrder(preferred: Placement): Placement[] {
  const idx = ALL_PLACEMENT_INDEX.get(preferred);
  if (idx === undefined) return [preferred, ...ALL_PLACEMENTS];

  const rest = ALL_PLACEMENTS.filter((_, i) => i !== idx);

  return [preferred, ...rest];
}

/** Order a family with the given placement first. */
export function orderWithFirst(first: Placement, family: readonly Placement[]): Placement[] {
  return [first, ...family.filter((p) => p !== first)];
}

export function isTopPlacement(placement: Placement): boolean {
  return TOP_PLACEMENT_SET.has(placement);
}

export function isBottomPlacement(placement: Placement): boolean {
  return BOTTOM_PLACEMENT_SET.has(placement);
}

export function isStartPlacement(placement: Placement): boolean {
  return START_PLACEMENT_SET.has(placement);
}

export function isEndPlacement(placement: Placement): boolean {
  return END_PLACEMENT_SET.has(placement);
}

/** Which viewport edge the anchor is fully past (anchor fully outside viewport on that side). */
export type AnchorViewportEdge = 'top' | 'bottom' | 'start' | 'end';

/**
 * Returns which single viewport edge the anchor is fully outside of, or null if anchor is inside or off multiple edges.
 * Order of check: top, bottom, start, end (first match wins).
 */
export function getAnchorViewportEdge(
  anchorRect: DOMRect,
  viewportRect: DOMRect,
  padding: number,
  dir: 'ltr' | 'rtl',
): AnchorViewportEdge | null {
  const anchorOffTop = anchorRect.bottom <= viewportRect.top + padding;
  if (anchorOffTop) return 'top';

  const anchorOffBottom = anchorRect.top >= viewportRect.bottom - padding;
  if (anchorOffBottom) return 'bottom';

  const anchorOffStart =
    dir === 'ltr'
      ? anchorRect.right <= viewportRect.left + padding
      : anchorRect.left >= viewportRect.right - padding;
  if (anchorOffStart) return 'start';

  const anchorOffEnd =
    dir === 'ltr'
      ? anchorRect.left >= viewportRect.right - padding
      : anchorRect.right <= viewportRect.left + padding;
  if (anchorOffEnd) return 'end';

  return null;
}

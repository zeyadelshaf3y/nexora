/**
 * Pure index math for {@link NxrListboxVirtualScrollHandler} keyboard navigation.
 * Keeps RTL and horizontal/vertical rules in one testable place.
 */

import type { ListboxScrollAlignment } from '../types';

export function computeVirtualListKeyNavigationIndex(args: {
  readonly key: string;
  readonly currentIndex: number;
  readonly count: number;
  readonly isVerticalNav: boolean;
  readonly rtl: boolean;
}): number | null {
  const { key, currentIndex, count, isVerticalNav, rtl } = args;

  switch (key) {
    case 'ArrowDown':
      return isVerticalNav ? currentIndex + 1 : currentIndex;
    case 'ArrowUp':
      return isVerticalNav ? currentIndex - 1 : currentIndex;
    case 'ArrowRight':
      return !isVerticalNav ? (rtl ? currentIndex - 1 : currentIndex + 1) : currentIndex;
    case 'ArrowLeft':
      return !isVerticalNav ? (rtl ? currentIndex + 1 : currentIndex - 1) : currentIndex;
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return null;
  }
}

/**
 * Alignment for virtual scroll: Arrow keys use `nearest` to avoid jumping when the row is
 * already visible; Home/End pin to extents.
 */
export function virtualScrollAlignmentForListboxKey(key: string): ListboxScrollAlignment {
  if (key === 'Home') return 'start';
  if (key === 'End') return 'end';

  return 'nearest';
}

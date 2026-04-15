import { canUseDOM } from '../env/can-use-dom';

const SCROLL_OVERFLOW_REGEX = /(auto|scroll|overlay)/;

function hasScrollableOverflow(overflow: string, overflowX: string, overflowY: string): boolean {
  return (
    SCROLL_OVERFLOW_REGEX.test(overflow) ||
    SCROLL_OVERFLOW_REGEX.test(overflowX) ||
    SCROLL_OVERFLOW_REGEX.test(overflowY)
  );
}

function isScrollableParent(parent: HTMLElement): boolean {
  const { overflow, overflowX, overflowY } = getComputedStyle(parent);

  return hasScrollableOverflow(overflow, overflowX, overflowY);
}

/**
 * Returns the scrollable parent elements of the given element, in order from nearest to root.
 * Only includes elements that have overflow that creates a scroll container (scroll, auto, overlay).
 * SSR-safe: returns empty array when DOM is not available.
 *
 * @param element - Element whose scroll parents to collect
 * @returns Array of scroll parent HTMLElements
 */
export function scrollParents(element: HTMLElement | null | undefined): HTMLElement[] {
  if (!canUseDOM() || !element?.parentElement) return [];

  const parents: HTMLElement[] = [];
  let parent: HTMLElement | null = element.parentElement;

  while (parent) {
    if (isScrollableParent(parent)) {
      parents.push(parent);
    }
    parent = parent.parentElement;
  }

  return parents;
}

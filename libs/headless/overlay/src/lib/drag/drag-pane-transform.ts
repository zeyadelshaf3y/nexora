import type { DragDismissAxis } from './drag-dismiss-vector';

/** Applies dismiss-axis translate transform to an overlay pane during drag. */
export function applyDragTransform(
  pane: HTMLElement,
  axis: DragDismissAxis,
  offsetPx: number,
): void {
  pane.style.transform = axis === 'x' ? `translateX(${offsetPx}px)` : `translateY(${offsetPx}px)`;
}

/** Removes inline transform from the pane (snap-back / teardown). */
export function clearDragTransform(pane: HTMLElement): void {
  pane.style.removeProperty('transform');
}

/** Fully off-screen offset along the dismiss axis in pixels. */
export function getOffScreenOffsetPx(
  pane: HTMLElement,
  axis: DragDismissAxis,
  dismissSign: 1 | -1,
): number {
  const size = axis === 'x' ? pane.offsetWidth : pane.offsetHeight;

  return dismissSign * size;
}

import type { NxrListboxVirtualScrollHandler } from '../types';

/**
 * Resolves the logical virtual index for the active option: {@link NxrListboxVirtualScrollHandler.getCurrentIndex},
 * then optional {@link NxrListboxVirtualScrollHandler.resolveIndexForActive} when the first returns -1.
 */
export function resolveListboxVirtualScrollIndex<T>(
  handler: NxrListboxVirtualScrollHandler<T>,
  active: T | null,
  sameItem: (a: T, b: T) => boolean,
): number {
  if (active == null) return -1;
  let idx = handler.getCurrentIndex(active);
  if (idx >= 0) return idx;
  const resolve = handler.resolveIndexForActive;
  if (typeof resolve === 'function') {
    idx = resolve.call(handler, active, sameItem);
  }

  return idx;
}

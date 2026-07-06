import type { DrawerPlacement } from '../position/drawer-strategy';

import type { DragDismissAxis, DragDismissVector } from './drag-dismiss-vector';
import { getOffScreenOffsetPx } from './drag-pane-transform';

const DRAWER_PLACEMENT_PREFIX = 'drawer-';

type TextDir = 'ltr' | 'rtl';

/** Parses `data-placement="drawer-end"` into a {@link DrawerPlacement}. */
export function parseDrawerPanePlacement(pane: HTMLElement): DrawerPlacement | null {
  const raw = pane.getAttribute('data-placement');

  if (!raw?.startsWith(DRAWER_PLACEMENT_PREFIX)) return null;

  const placement = raw.slice(DRAWER_PLACEMENT_PREFIX.length) as DrawerPlacement;

  if (
    placement === 'top' ||
    placement === 'bottom' ||
    placement === 'start' ||
    placement === 'end'
  ) {
    return placement;
  }

  return null;
}

function resolveTextDir(pane: HTMLElement): TextDir {
  const dir = pane.closest('[dir]')?.getAttribute('dir') ?? pane.ownerDocument?.documentElement.dir;

  return dir === 'rtl' ? 'rtl' : 'ltr';
}

/** Resolves drag dismiss axis and sign for a drawer pane placement and text direction. */
export function resolveDrawerDragDismissVector(
  placement: DrawerPlacement,
  dir: TextDir,
): DragDismissVector {
  switch (placement) {
    case 'top':
      return { axis: 'y', dismissSign: -1 };
    case 'bottom':
      return { axis: 'y', dismissSign: 1 };
    case 'start':
      return { axis: 'x', dismissSign: dir === 'rtl' ? 1 : -1 };
    case 'end':
      return { axis: 'x', dismissSign: dir === 'rtl' ? -1 : 1 };
  }
}

export function resolveDrawerDragDismissVectorFromPane(
  pane: HTMLElement,
): DragDismissVector | null {
  const placement = parseDrawerPanePlacement(pane);

  if (!placement) return null;

  return resolveDrawerDragDismissVector(placement, resolveTextDir(pane));
}

/** Logical edge where the drag handle belongs (opposite the hinge edge). */
export type DrawerDragHandleEdge = 'block-start' | 'block-end' | 'inline-start' | 'inline-end';

/** Maps drawer placement to the handle edge consumers should target for styling/positioning. */
export function resolveDrawerDragHandleEdge(placement: DrawerPlacement): DrawerDragHandleEdge {
  switch (placement) {
    case 'top':
      return 'block-end';
    case 'bottom':
      return 'block-start';
    case 'start':
      return 'inline-end';
    case 'end':
      return 'inline-start';
  }
}

export function getPaneSizeAlongAxis(pane: HTMLElement, axis: DragDismissAxis): number {
  return axis === 'x' ? pane.offsetWidth : pane.offsetHeight;
}

export function getDrawerOffScreenOffset(
  pane: HTMLElement,
  axis: DragDismissAxis,
  dismissSign: 1 | -1,
): number {
  return getOffScreenOffsetPx(pane, axis, dismissSign);
}

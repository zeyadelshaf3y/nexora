/**
 * Tracks whether an overlay ref is mid drag-to-close gesture.
 * Used to suppress reposition and backdrop/outside dismiss during drag.
 * @internal
 */

import type { OverlayRef } from '../ref/overlay-ref';

const DRAGGING_KEY: unique symbol = Symbol.for('@nexora-ui/overlay#dragging-ref');

type GlobalWithDragging = typeof globalThis & {
  [DRAGGING_KEY]?: WeakMap<OverlayRef, boolean>;
};

function draggingMap(): WeakMap<OverlayRef, boolean> {
  const g = globalThis as GlobalWithDragging;

  return (g[DRAGGING_KEY] ??= new WeakMap<OverlayRef, boolean>());
}

export function setOverlayDragging(ref: OverlayRef, dragging: boolean): void {
  if (dragging) {
    draggingMap().set(ref, true);
  } else {
    draggingMap().delete(ref);
  }
}

export function isOverlayDragging(ref: OverlayRef): boolean {
  return draggingMap().get(ref) === true;
}

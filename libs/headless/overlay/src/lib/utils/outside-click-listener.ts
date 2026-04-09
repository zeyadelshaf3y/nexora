/**
 * Capture-phase pointerdown listener that calls a callback when the target
 * is outside the anchor and overlay pane. Used by popover/tooltip (focus/hover
 * triggers) to close on outside click; blur alone is unreliable for non-focusable areas.
 *
 * Target is resolved to an Element (text nodes use parentElement) so clicks on
 * text inside the panel are treated as inside. considerInside and onPointerDown receive that Element.
 *
 * @internal
 */

import { listen } from '@nexora-ui/core';

export interface OutsideClickOptions {
  /** When true for the resolved target element, the click is treated as inside and onOutsideClick is not called. */
  readonly considerInside?: (target: Element) => boolean;
  /** Called on every pointerdown with the resolved target element (e.g. to avoid closing on focus-blur when the user clicked inside the pane). */
  readonly onPointerDown?: (el: Element) => void;
}

/**
 * Creates a capture-phase pointerdown listener. Calls onOutsideClick when the
 * target is outside anchor, getPane(), and considerInside(target). Resolves
 * target to an Element (text node → parentElement) before all checks.
 */
export function createOutsideClickListener(
  anchor: HTMLElement,
  getPane: () => HTMLElement | null | undefined,
  onOutsideClick: () => void,
  options?: OutsideClickOptions,
): () => void {
  const doc = anchor.ownerDocument;
  if (!doc) return () => {};
  const considerInside = options?.considerInside;
  const onPointerDown = options?.onPointerDown;

  return listen(
    doc,
    'pointerdown',
    (e: Event) => {
      const el = resolveEventElement(e);
      if (!el) return;

      onPointerDown?.(el);

      if (anchor.contains(el)) return;
      if (getPane()?.contains(el)) return;
      if (considerInside?.(el)) return;

      onOutsideClick();
    },
    true,
  );
}

function resolveEventElement(event: Event): Element | null {
  const path =
    'composedPath' in event && typeof event.composedPath === 'function' ? event.composedPath() : [];

  let pathNode: Node | undefined;

  for (const entry of path) {
    if (entry instanceof Node) {
      pathNode = entry;

      break;
    }
  }
  const target = pathNode ?? (event.target instanceof Node ? event.target : null);
  if (!target) return null;

  return target instanceof Element ? target : target.parentElement;
}

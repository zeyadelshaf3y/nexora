/**
 * Invisible fixed-position element used as the overlay anchor (caret or trigger rect).
 *
 * Positioning must not round-trip client rects through `style.left/top` — on mobile
 * (soft keyboard / visualViewport pan) that write is lossy and the panel drifts from
 * the `@`. Instead, {@link bindMentionVirtualAnchorRect} overrides
 * `getBoundingClientRect` so the overlay reads the live caret/trigger rect directly
 * (same coordinate space as a real DOM trigger).
 */

export type MentionVirtualAnchorRectGetter = () => DOMRect | null;

function applyAnchorRect(virtualAnchor: HTMLElement, rect: DOMRect): void {
  virtualAnchor.style.left = `${rect.left}px`;
  virtualAnchor.style.top = `${rect.top}px`;
  virtualAnchor.style.width = `${Math.max(rect.width, 1)}px`;
  virtualAnchor.style.height = `${Math.max(rect.height, 1)}px`;
}

/**
 * Returns a DOMRect suitable for overlay anchoring. Zero-width carets become 1×height
 * so start/end placement math stays stable without shifting the origin.
 */
export function normalizeMentionAnchorRect(rect: DOMRect): DOMRect {
  return new DOMRect(rect.left, rect.top, Math.max(rect.width, 1), Math.max(rect.height, 1));
}

/**
 * Makes the virtual anchor report a live caret/trigger rect to the overlay engine.
 */
export function bindMentionVirtualAnchorRect(
  virtualAnchor: HTMLElement,
  getRect: MentionVirtualAnchorRectGetter,
): void {
  virtualAnchor.getBoundingClientRect = () => {
    const rect = getRect();
    if (!rect) {
      return HTMLElement.prototype.getBoundingClientRect.call(virtualAnchor);
    }

    return normalizeMentionAnchorRect(rect);
  };
}

export function createMentionVirtualAnchorElement(
  rect: DOMRect | null,
  dir?: string,
  getRect?: MentionVirtualAnchorRectGetter,
): HTMLElement {
  if (typeof document === 'undefined') {
    throw new Error('createMentionVirtualAnchorElement requires a browser Document');
  }

  const virtualAnchor = document.createElement('div');
  virtualAnchor.setAttribute('aria-hidden', 'true');

  if (dir) virtualAnchor.dir = dir;

  virtualAnchor.style.position = 'fixed';
  virtualAnchor.style.pointerEvents = 'none';
  virtualAnchor.style.width = '1px';
  virtualAnchor.style.height = '1px';
  virtualAnchor.style.visibility = 'hidden';

  // Styled box is only a fallback when the live getter returns null.
  if (rect) applyAnchorRect(virtualAnchor, rect);

  if (getRect) {
    bindMentionVirtualAnchorRect(virtualAnchor, getRect);
  }

  document.body.appendChild(virtualAnchor);

  return virtualAnchor;
}

export function removeMentionVirtualAnchorElement(el: HTMLElement | null): void {
  el?.parentNode?.removeChild(el);
}

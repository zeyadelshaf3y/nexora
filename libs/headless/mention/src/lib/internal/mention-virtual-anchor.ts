/**
 * Invisible fixed-position element used as the overlay anchor (caret or trigger rect).
 */

function applyAnchorRect(virtualAnchor: HTMLElement, rect: DOMRect): void {
  virtualAnchor.style.left = `${rect.left}px`;
  virtualAnchor.style.top = `${rect.top}px`;
  virtualAnchor.style.width = `${rect.width}px`;
  virtualAnchor.style.height = `${rect.height}px`;
}

export function createMentionVirtualAnchorElement(rect: DOMRect | null, dir?: string): HTMLElement {
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

  if (rect) applyAnchorRect(virtualAnchor, rect);

  document.body.appendChild(virtualAnchor);

  return virtualAnchor;
}

export function positionMentionVirtualAnchor(
  virtualAnchor: HTMLElement,
  rect: DOMRect | null,
): void {
  if (!rect) return;

  applyAnchorRect(virtualAnchor, rect);
}

export function removeMentionVirtualAnchorElement(el: HTMLElement | null): void {
  el?.parentNode?.removeChild(el);
}

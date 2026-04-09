/**
 * Focuses the element if it exists and supports focus. No-op when element is null/undefined
 * or when not connected to a document (e.g. SSR). Avoids throwing when focus is not allowed.
 *
 * @param element - Element to focus. Accepts `Element` or `HTMLElement`.
 */
export function safeFocus(element: Element | HTMLElement | null | undefined): void {
  const focusable = asFocusableElement(element);
  if (!focusable) return;

  try {
    focusable.focus({
      preventScroll: true,
    });
  } catch {
    // Some elements in some contexts cannot receive focus; ignore.
  }
}

function asFocusableElement(element: Element | HTMLElement | null | undefined): HTMLElement | null {
  if (!element || typeof (element as HTMLElement).focus !== 'function') return null;

  return element as HTMLElement;
}

import { canUseDOM } from '../env/can-use-dom';

/**
 * Returns the document for the given element, or the global document when DOM is available.
 * SSR-safe: returns `undefined` when document is not available.
 *
 * @param element - Optional element or document whose ownerDocument to return.
 * @returns The owning document, or `undefined` in SSR.
 */
export function ownerDocument(element?: Element | Document | null): Document | undefined {
  if (element) {
    if (element instanceof Document) return element;

    return element.ownerDocument ?? undefined;
  }

  return canUseDOM() ? document : undefined;
}

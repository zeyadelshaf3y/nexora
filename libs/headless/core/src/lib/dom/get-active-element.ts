import { ownerDocument } from './owner-document';

/**
 * Returns the currently focused element in the given document, or null.
 * SSR-safe: returns null when document is not available.
 *
 * Note: `activeElement` can be any `Element` (including `SVGElement`, `MathMLElement`, etc.).
 * If you need an `HTMLElement` specifically, narrow the result with `instanceof`.
 *
 * @param doc - Document to query; if omitted, uses global document when available.
 * @returns The active element or null.
 */
export function getActiveElement(doc?: Document | null): Element | null {
  const resolvedDoc = doc ?? ownerDocument();

  return resolvedDoc?.activeElement ?? null;
}

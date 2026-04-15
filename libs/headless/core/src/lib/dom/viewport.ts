import { getGlobal } from '../env/get-global';

import { ownerDocument } from './owner-document';

/**
 * Returns the layout viewport rect (origin 0,0, size matching the viewport).
 * Uses document.documentElement.clientWidth/Height to match the CSS layout viewport;
 * falls back to window.innerWidth/innerHeight when client dimensions are 0.
 * SSR-safe: returns a zero rect when document/window is not available.
 *
 * @param doc - Optional document; when omitted uses ownerDocument()
 * @returns DOMRect(0, 0, width, height) in viewport coordinates
 */
export function getViewportRect(doc?: Document | null): DOMRect {
  const resolvedDoc = doc ?? ownerDocument();
  if (!resolvedDoc) return new DOMRect(0, 0, 0, 0);

  const documentElement = resolvedDoc.documentElement;
  const clientWidth = documentElement.clientWidth;
  const clientHeight = documentElement.clientHeight;
  const globalWin = getGlobal();
  const width = resolveViewportAxis(clientWidth, globalWin?.innerWidth);
  const height = resolveViewportAxis(clientHeight, globalWin?.innerHeight);

  return new DOMRect(0, 0, width, height);
}

function resolveViewportAxis(clientAxis: number, windowAxis: number | undefined): number {
  return clientAxis > 0 ? clientAxis : (windowAxis ?? 0);
}

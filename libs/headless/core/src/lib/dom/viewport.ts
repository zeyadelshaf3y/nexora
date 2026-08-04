import { getGlobal } from '../env/get-global';

import { ownerDocument } from './owner-document';

/**
 * Returns the visible viewport rect in layout (fixed-position) coordinates.
 *
 * Prefers {@link VisualViewport} when available so overlays clamp/flip against the
 * area actually on screen (mobile soft keyboard, pinch-zoom). Falls back to the
 * CSS layout viewport (`documentElement.clientWidth/Height`, then `innerWidth/Height`)
 * when visual viewport is missing or reports a zero size. SSR-safe: returns a zero
 * rect when document/window is not available.
 *
 * @param doc - Optional document; when omitted uses ownerDocument()
 * @returns DOMRect for the visible viewport (may have a non-zero origin when the
 *   visual viewport is panned relative to the layout viewport)
 */
export function getViewportRect(doc?: Document | null): DOMRect {
  const resolvedDoc = doc ?? ownerDocument();
  if (!resolvedDoc) return new DOMRect(0, 0, 0, 0);

  const globalWin = getGlobal();
  const visual = readVisualViewportRect(globalWin);
  if (visual) return visual;

  const documentElement = resolvedDoc.documentElement;
  const clientWidth = documentElement.clientWidth;
  const clientHeight = documentElement.clientHeight;
  const width = resolveViewportAxis(clientWidth, globalWin?.innerWidth);
  const height = resolveViewportAxis(clientHeight, globalWin?.innerHeight);

  return new DOMRect(0, 0, width, height);
}

function readVisualViewportRect(
  globalWin: (Window & typeof globalThis) | undefined,
): DOMRect | null {
  const vv = globalWin?.visualViewport;
  if (!vv) return null;

  const width = vv.width;
  const height = vv.height;
  if (!(width > 0) || !(height > 0)) return null;

  return new DOMRect(vv.offsetLeft, vv.offsetTop, width, height);
}

function resolveViewportAxis(clientAxis: number, windowAxis: number | undefined): number {
  return clientAxis > 0 ? clientAxis : (windowAxis ?? 0);
}

import type { OverlayConfig, ViewportBoundaries } from './overlay-config';
import { overlayHasHostOption } from './overlay-resolve-elements';

/**
 * Insets a viewport/host rectangle by optional boundary offsets (CSS inset-like).
 */
export function applyBoundariesToRect(
  rect: DOMRect,
  boundaries: ViewportBoundaries | undefined,
): DOMRect {
  if (!boundaries) return rect;

  const top = boundaries.top ?? 0;
  const right = boundaries.right ?? 0;
  const bottom = boundaries.bottom ?? 0;
  const left = boundaries.left ?? 0;
  const x = rect.left + left;
  const y = rect.top + top;
  const w = Math.max(0, rect.width - left - right);
  const h = Math.max(0, rect.height - top - bottom);

  return new DOMRect(x, y, w, h);
}

/** CSS `max-width` / `max-height` value: consumer cap wrapped in `min(..., viewport px)`. */
export function formatMaxSize(configValue: string | undefined, pxValue: number): string {
  const viewportValue = `${pxValue}px`;

  return configValue ? `min(${configValue}, ${viewportValue})` : viewportValue;
}

/** Sets pane transform-origin so the given viewport point becomes the origin (pane-local px). */
export function setTransformOriginFromViewportPoint(
  pane: HTMLElement,
  viewportPoint: { x: number; y: number },
  paneOrigin: { left: number; top: number },
): void {
  const originX = viewportPoint.x - paneOrigin.left;
  const originY = viewportPoint.y - paneOrigin.top;
  pane.style.transformOrigin = `${originX}px ${originY}px`;
}

/**
 * Clips a host element's bounding rect to the visible viewport rectangle.
 * When the intersection is empty, returns `visible` so positioning falls back to full viewport.
 */
export function intersectHostRectWithVisibleViewport(hostRect: DOMRect, visible: DOMRect): DOMRect {
  const vpRight = visible.width;
  const vpBottom = visible.height;
  const left = Math.max(0, hostRect.left);
  const top = Math.max(0, hostRect.top);
  const right = Math.min(vpRight, hostRect.right);
  const bottom = Math.min(vpBottom, hostRect.bottom);
  const width = Math.max(0, right - left);
  const height = Math.max(0, bottom - top);

  if (width <= 0 || height <= 0) {
    return visible;
  }

  return new DOMRect(left, top, width, height);
}

/**
 * Base rectangle for overlay positioning and host-contained max sizes: the visible viewport,
 * or the content host rect clipped to the viewport when a host option is set and `resolvedHost` is non-null.
 */
export function getOverlayBaseViewportRect(
  hostOption: OverlayConfig['host'],
  resolvedHost: HTMLElement | null,
  getViewportRect: () => DOMRect,
): DOMRect {
  if (overlayHasHostOption({ host: hostOption }) && resolvedHost) {
    return intersectHostRectWithVisibleViewport(
      resolvedHost.getBoundingClientRect(),
      getViewportRect(),
    );
  }

  return getViewportRect();
}

/** Effective positioning viewport: base rect inset by {@link ViewportBoundaries}. */
export function getOverlayPositioningViewportRect(
  hostOption: OverlayConfig['host'],
  resolvedHost: HTMLElement | null,
  boundaries: ViewportBoundaries | undefined,
  getViewportRect: () => DOMRect,
): DOMRect {
  return applyBoundariesToRect(
    getOverlayBaseViewportRect(hostOption, resolvedHost, getViewportRect),
    boundaries,
  );
}

/** Caps pane max width/height using a host-visible rect and optional viewport boundaries. */
export function applyPaneMaxSizesForContainedHost(
  pane: HTMLElement,
  hostVisibleRect: DOMRect,
  boundaries: ViewportBoundaries | undefined,
  maxWidth: string | undefined,
  maxHeight: string | undefined,
): void {
  const effective = applyBoundariesToRect(hostVisibleRect, boundaries);
  pane.style.maxWidth = formatMaxSize(maxWidth, effective.width);
  pane.style.maxHeight = formatMaxSize(maxHeight, effective.height);
}

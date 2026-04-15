import { getViewportRect as getViewportRectFromCore } from '@nexora-ui/core';

import type { OverlayConfig } from './overlay-config';
import { overlayHasHostOption } from './overlay-resolve-elements';
import { applyBoundariesToRect, formatMaxSize } from './overlay-viewport-bounds';

/** Subset of {@link OverlayConfig} used for initial pane ARIA attributes. */
export type OverlayPaneA11yFromConfig = Pick<
  OverlayConfig,
  'hasBackdrop' | 'ariaRole' | 'ariaModal' | 'ariaLabel' | 'ariaLabelledBy'
>;

/** Applies role, aria-modal, aria-label, and aria-labelledby from overlay config. */
export function applyOverlayPaneA11yFromConfig(
  pane: HTMLElement,
  config: OverlayPaneA11yFromConfig,
): void {
  const hasBackdrop = config.hasBackdrop ?? false;
  const role = config.ariaRole ?? (hasBackdrop ? 'dialog' : undefined);
  const ariaModal = config.ariaModal ?? (hasBackdrop ? true : undefined);

  if (role) pane.setAttribute('role', role);
  if (ariaModal !== undefined) pane.setAttribute('aria-modal', String(ariaModal));
  if (config.ariaLabel) pane.setAttribute('aria-label', config.ariaLabel);
  if (config.ariaLabelledBy) pane.setAttribute('aria-labelledby', config.ariaLabelledBy);
}

/** Subset of {@link OverlayConfig} for initial width/height and viewport-capped max sizes. */
export type OverlayPaneSizingFromConfig = Pick<
  OverlayConfig,
  'width' | 'height' | 'minWidth' | 'minHeight' | 'maxWidth' | 'maxHeight' | 'host' | 'boundaries'
>;

/**
 * Applies width/height/min* on the pane. When **`overlayHasHostOption(config)`** is false, sets max-*
 * capped to the effective viewport (optionally inset by `boundaries`). Host-scoped max sizes are
 * applied separately.
 *
 * @param getViewportRect — injectable for tests; defaults to {@link getViewportRectFromCore}.
 */
export function applyOverlayPaneSizingFromConfig(
  pane: HTMLElement,
  config: OverlayPaneSizingFromConfig,
  getViewportRect: () => DOMRect = getViewportRectFromCore,
): void {
  const s = pane.style;

  if (config.width) s.setProperty('width', config.width);
  if (config.height) s.setProperty('height', config.height);
  if (config.minWidth) s.setProperty('min-width', config.minWidth);
  if (config.minHeight) s.setProperty('min-height', config.minHeight);

  if (!overlayHasHostOption(config)) {
    const effective = applyBoundariesToRect(getViewportRect(), config.boundaries);
    s.setProperty('max-width', formatMaxSize(config.maxWidth, effective.width));
    s.setProperty('max-height', formatMaxSize(config.maxHeight, effective.height));
  }
}

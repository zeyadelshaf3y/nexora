import { resolveMaybeGetter } from '@nexora-ui/core';

import type { OverlayConfig } from './overlay-config';

/** True when `config.host` is set (scoped / dashboard layout: backdrop on content host, pane in overlay container). */
export function overlayHasHostOption(config: Pick<OverlayConfig, 'host'>): boolean {
  return !!config.host;
}

/** True when `config.anchor` is set (anchored positioning). */
export function overlayHasAnchorOption(config: Pick<OverlayConfig, 'anchor'>): boolean {
  return !!config.anchor;
}

/** Resolves the mount host: content host when `host` is set, otherwise the global overlay container. */
export function resolveOverlayHost(
  host: OverlayConfig['host'],
  globalOverlayContainer: HTMLElement,
): HTMLElement {
  return resolveMaybeGetter(host) ?? globalOverlayContainer;
}

/** Resolves `T` or `() => T` from config; returns `undefined` when absent. */
export function resolveOverlayLazyElement<T extends HTMLElement>(
  element: T | (() => T) | undefined,
): T | undefined {
  return resolveMaybeGetter(element);
}

export function resolveOverlayLazyElementOrNull<T extends HTMLElement>(
  element: T | (() => T) | undefined,
): T | null {
  return resolveOverlayLazyElement(element) ?? null;
}

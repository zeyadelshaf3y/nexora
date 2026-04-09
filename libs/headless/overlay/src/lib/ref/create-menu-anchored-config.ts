/**
 * Preset for menu-style anchored overlays.
 *
 * Uses placement default `bottom-start` and does not set fallbackPlacements,
 * so AnchoredStrategy uses fallbackOrder('bottom-start') and tries the full
 * 12-position list (bottom-start, bottom, bottom-end, then top/sides). Same
 * close policy, scroll strategy, and noop focus as dropdown.
 */

import { NoopFocusStrategy } from '../focus/noop-focus-strategy';

import type { BaseAnchoredPresetParams } from './anchored-preset-params';
import { createAnchoredOverlayConfig } from './create-anchored-overlay-config';
import type { ArrowSize, OverlayConfig } from './overlay-config';

/** Stateless; safe to share. */
const NOOP_FOCUS = new NoopFocusStrategy();

/**
 * Options for building a menu-style anchored overlay config.
 * Extends {@link BaseAnchoredPresetParams} with optional {@link ArrowSize}.
 */
export type CreateMenuAnchoredConfigParams = BaseAnchoredPresetParams & {
  /** Arrow dimensions (px). When set, the position strategy returns arrowOffset for the pane. */
  readonly arrowSize?: ArrowSize;
};

/**
 * Builds an {@link OverlayConfig} for menu-style panels.
 * Default placement is 'bottom-start'; fallbackPlacements are omitted so the
 * anchored strategy uses its full 12-position fallback order.
 */
export function createMenuAnchoredConfig(params: CreateMenuAnchoredConfigParams): OverlayConfig {
  const {
    anchor,
    placement = 'bottom-start',
    offset = 4,
    scrollStrategy,
    closeAnimationDurationMs,
    parentRef,
    panelClass,
    backdropClass,
    panelStyle,
    backdropStyle,
    maxHeight,
    width,
    hasBackdrop = false,
    beforeOpen,
    beforeClose,
    arrowSize,
    maintainInViewport,
    boundaries,
  } = params;

  return createAnchoredOverlayConfig({
    anchor,
    placement,
    fallbackPlacements: undefined,
    clampToViewport: true,
    closePolicy: { escape: 'top', outside: 'top' },
    offset,
    hasBackdrop,
    scrollStrategy,
    focusStrategy: NOOP_FOCUS,
    closeAnimationDurationMs,
    parentRef,
    panelClass,
    backdropClass,
    panelStyle,
    backdropStyle,
    maxHeight,
    width,
    beforeOpen,
    beforeClose,
    arrowSize,
    maintainInViewport,
    boundaries,
  });
}

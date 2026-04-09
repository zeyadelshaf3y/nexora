/**
 * Preset for dropdown-style anchored overlays (select, combobox, autocomplete).
 *
 * Uses vertical-only fallbacks (top/bottom), configurable backdrop, escape and
 * outside-click close. Select and Combobox can share this so config logic is not duplicated.
 */

import { NoopFocusStrategy } from '../focus/noop-focus-strategy';
import type { Placement } from '../position/position-strategy';

import type { BaseAnchoredPresetParams } from './anchored-preset-params';
import { createAnchoredOverlayConfig } from './create-anchored-overlay-config';
import type { OverlayConfig } from './overlay-config';

/** Dropdown panels flip only between top and bottom, never start/end. */
const DROPDOWN_FALLBACK_PLACEMENTS: readonly Placement[] = ['bottom', 'top'];

/** Stateless; safe to share. */
const NOOP_FOCUS = new NoopFocusStrategy();

/** Options for building a dropdown-style anchored overlay config. */
export type CreateDropdownAnchoredConfigParams = BaseAnchoredPresetParams;

/**
 * Builds an {@link OverlayConfig} for dropdown-style panels (select, combobox, autocomplete).
 * Uses vertical fallbacks, configurable backdrop (default false), escape/outside close,
 * and noop focus so the trigger keeps focus. Pass anchor and options; overlay owns the common defaults.
 */
export function createDropdownAnchoredConfig(
  params: CreateDropdownAnchoredConfigParams,
): OverlayConfig {
  const {
    anchor,
    placement = 'bottom',
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
    maintainInViewport,
    boundaries,
  } = params;

  return createAnchoredOverlayConfig({
    anchor,
    placement,
    fallbackPlacements: DROPDOWN_FALLBACK_PLACEMENTS,
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
    maintainInViewport,
    boundaries,
  });
}

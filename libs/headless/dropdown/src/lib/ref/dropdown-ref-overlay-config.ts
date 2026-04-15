/**
 * Resolves {@link DropdownRefOptions} and builds {@link OverlayConfig} for menu vs dropdown presets.
 */

import {
  createDropdownAnchoredConfig,
  createMenuAnchoredConfig,
  getContainingOverlayRef,
  type ArrowSize,
  type BeforeCloseCallback,
  type BeforeOpenCallback,
  type OverlayConfig,
  type Placement,
  type ScrollStrategy,
  type ViewportBoundaries,
} from '@nexora-ui/overlay';

import {
  DEFAULT_CLOSE_ANIMATION_MS,
  DEFAULT_MAX_HEIGHT,
  DEFAULT_OFFSET,
  SCROLL_STRATEGY_MAP,
} from '../constants/dropdown-constants';
import { resolveDropdownOption } from '../utils/resolve-option';

import type { DropdownConfigPreset, DropdownRefOptions } from './dropdown-ref-options';

/** Resolved values passed to menu/dropdown anchored config builders. */
export interface ResolvedDropdownOverlayOptions {
  readonly preset: DropdownConfigPreset;
  readonly placement: Placement;
  readonly offset: number;
  readonly scrollStrategy: ScrollStrategy;
  readonly closeAnimationDurationMs: number;
  readonly maxHeight: string;
  readonly matchTriggerWidth: boolean;
  readonly hasBackdrop: boolean;
  readonly panelClass: string | string[] | undefined;
  readonly backdropClass: string | string[] | undefined;
  readonly panelStyle: Record<string, string> | undefined;
  readonly backdropStyle: Record<string, string> | undefined;
  readonly arrowSize: ArrowSize | undefined;
  readonly maintainInViewport: boolean | undefined;
  readonly boundaries: ViewportBoundaries | undefined;
  readonly beforeOpen: BeforeOpenCallback | undefined;
  readonly beforeClose: BeforeCloseCallback | undefined;
}

export function resolveDropdownOverlayOptions(
  options: DropdownRefOptions,
): ResolvedDropdownOverlayOptions {
  const preset = resolveDropdownOption(options.configPreset, 'dropdown');
  const defaultPlacement = preset === 'menu' ? 'bottom-start' : 'bottom';
  const scrollStrategyKey = resolveDropdownOption(options.scrollStrategy, 'noop');

  return {
    preset,
    placement: resolveDropdownOption(options.placement, defaultPlacement),
    offset: resolveDropdownOption(options.offset, DEFAULT_OFFSET),
    scrollStrategy: SCROLL_STRATEGY_MAP[scrollStrategyKey](),
    closeAnimationDurationMs: resolveDropdownOption(
      options.closeAnimationDurationMs,
      DEFAULT_CLOSE_ANIMATION_MS,
    ),
    maxHeight: resolveDropdownOption(options.maxHeight, DEFAULT_MAX_HEIGHT),
    matchTriggerWidth: resolveDropdownOption(options.matchTriggerWidth, true),
    hasBackdrop: resolveDropdownOption(options.hasBackdrop, false),
    panelClass: resolveDropdownOption(options.panelClass, undefined),
    backdropClass: resolveDropdownOption(options.backdropClass, undefined),
    panelStyle: resolveDropdownOption(options.panelStyle, undefined),
    backdropStyle: resolveDropdownOption(options.backdropStyle, undefined),
    arrowSize: resolveDropdownOption(options.arrowSize, undefined),
    maintainInViewport: resolveDropdownOption(options.maintainInViewport, true),
    boundaries: resolveDropdownOption(options.boundaries, undefined),
    beforeOpen: resolveDropdownOption(options.beforeOpen, undefined),
    beforeClose: resolveDropdownOption(options.beforeClose, undefined),
  };
}

export function buildDropdownOverlayConfig(
  anchor: HTMLElement,
  resolved: ResolvedDropdownOverlayOptions,
): OverlayConfig {
  const baseParams = {
    anchor,
    placement: resolved.placement,
    offset: resolved.offset,
    scrollStrategy: resolved.scrollStrategy,
    closeAnimationDurationMs: resolved.closeAnimationDurationMs,
    parentRef: getContainingOverlayRef(anchor) ?? undefined,
    panelClass: resolved.panelClass,
    backdropClass: resolved.backdropClass,
    panelStyle: resolved.panelStyle,
    backdropStyle: resolved.backdropStyle,
    maxHeight: resolved.maxHeight,
    width: resolved.matchTriggerWidth ? `${anchor.offsetWidth}px` : undefined,
    hasBackdrop: resolved.hasBackdrop,
    beforeOpen: resolved.beforeOpen,
    beforeClose: resolved.beforeClose,
    ...(resolved.preset === 'menu' &&
      resolved.arrowSize != null && { arrowSize: resolved.arrowSize }),
    maintainInViewport: resolved.maintainInViewport,
    boundaries: resolved.boundaries,
  };

  return resolved.preset === 'menu'
    ? createMenuAnchoredConfig(baseParams)
    : createDropdownAnchoredConfig(baseParams);
}

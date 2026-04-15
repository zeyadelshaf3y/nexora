import type { FocusStrategy } from '../focus/focus-strategy';
import { AnchoredStrategy } from '../position/anchored-strategy';
import type { Placement } from '../position/position-strategy';
import { NoopScrollStrategy } from '../scroll/noop-scroll-strategy';
import { RepositionScrollStrategy } from '../scroll/reposition-scroll-strategy';
import type { ScrollStrategy } from '../scroll/scroll-strategy';

import type { ClosePolicy } from './close-policy';
import type {
  OverlayConfig,
  ArrowSize,
  BeforeCloseCallback,
  BeforeOpenCallback,
  PanelDimensionOptions,
  PanelStylingOptions,
  ViewportBoundaries,
} from './overlay-config';
import type { OverlayRef } from './overlay-ref';

function resolveAnchoredPositionFlags(
  scrollStrategy: ScrollStrategy,
  clampToViewport: boolean,
  preferredPlacementOnly: boolean | undefined,
  maintainInViewport: boolean,
): {
  effectiveClampToViewport: boolean;
  effectivePreferredPlacementOnly: boolean;
  stickWhenAnchorFullyOutOfViewport: boolean | undefined;
} {
  const isNoop = scrollStrategy instanceof NoopScrollStrategy;
  const isReposition = scrollStrategy instanceof RepositionScrollStrategy;

  if (isNoop) {
    return {
      effectiveClampToViewport: false,
      effectivePreferredPlacementOnly: true,
      stickWhenAnchorFullyOutOfViewport: undefined,
    };
  }

  if (isReposition) {
    return {
      effectiveClampToViewport: true,
      effectivePreferredPlacementOnly: false,
      stickWhenAnchorFullyOutOfViewport: maintainInViewport ? undefined : true,
    };
  }

  return {
    effectiveClampToViewport: clampToViewport ?? true,
    effectivePreferredPlacementOnly: preferredPlacementOnly ?? false,
    stickWhenAnchorFullyOutOfViewport: undefined,
  };
}

/**
 * Options for building an anchored overlay config (e.g. popover, tooltip).
 * Single object to avoid long parameter lists and to share logic between directives.
 */
export interface CreateAnchoredOverlayConfigParams
  extends Partial<PanelDimensionOptions>,
    Partial<PanelStylingOptions> {
  readonly anchor: HTMLElement;
  readonly placement: Placement;
  readonly offset: number;
  readonly clampToViewport: boolean;
  readonly preferredPlacementOnly?: boolean;
  readonly fallbackPlacements?: readonly Placement[];
  readonly hasBackdrop: boolean;
  readonly closePolicy: Partial<ClosePolicy>;
  readonly scrollStrategy: ScrollStrategy;
  readonly focusStrategy: FocusStrategy;
  readonly closeAnimationDurationMs: number;
  readonly parentRef?: OverlayRef;
  readonly beforeOpen?: BeforeOpenCallback;
  readonly beforeClose?: BeforeCloseCallback;
  readonly arrowSize?: ArrowSize;
  readonly ariaLabel?: string;
  readonly ariaLabelledBy?: string;
  /**
   * Only for reposition scroll strategy. Default true.
   * - When true: panel is kept in viewport (reposition with fallbacks and clamp).
   * - When false: same reposition while trigger is in view; when trigger is fully out of viewport,
   *   the panel follows the trigger (like noop: no clamp, current placement preserved, height unchanged).
   */
  readonly maintainInViewport?: boolean;
  /** Viewport inset in px for max dimensions. */
  readonly boundaries?: ViewportBoundaries;
}

/**
 * Builds an {@link OverlayConfig} for an anchored overlay (popover, tooltip).
 * Centralizes strategy creation and optional field handling so directives stay thin.
 *
 * Scroll strategy behavior:
 * - **noop**: panel sticks to trigger (preferred placement only, no viewport clamp).
 * - **reposition + maintainInViewport true**: normal reposition with fallbacks and viewport clamp.
 * - **reposition + maintainInViewport false**: same as above while trigger is in view; when trigger
 *   is fully out of viewport, panel follows trigger (no clamp, current placement preserved).
 */
export function createAnchoredOverlayConfig(
  params: CreateAnchoredOverlayConfigParams,
): OverlayConfig {
  const {
    anchor,
    placement,
    offset,
    clampToViewport,
    preferredPlacementOnly,
    hasBackdrop,
    closePolicy,
    scrollStrategy,
    focusStrategy,
    closeAnimationDurationMs,
    parentRef,
    panelClass,
    backdropClass,
    arrowSize,
    beforeOpen,
    beforeClose,
    maintainInViewport = true,
    boundaries,
  } = params;

  const {
    effectiveClampToViewport,
    effectivePreferredPlacementOnly,
    stickWhenAnchorFullyOutOfViewport,
  } = resolveAnchoredPositionFlags(
    scrollStrategy,
    clampToViewport,
    preferredPlacementOnly,
    maintainInViewport,
  );

  return {
    ...(params.width != null && { width: params.width }),
    ...(params.height != null && { height: params.height }),
    ...(params.minWidth != null && { minWidth: params.minWidth }),
    ...(params.maxWidth != null && { maxWidth: params.maxWidth }),
    ...(params.minHeight != null && { minHeight: params.minHeight }),
    ...(params.maxHeight != null && { maxHeight: params.maxHeight }),
    ...(params.panelStyle != null && { panelStyle: params.panelStyle }),
    ...(backdropClass != null && { backdropClass }),
    ...(params.backdropStyle != null && { backdropStyle: params.backdropStyle }),
    ...(params.nxrBackdropClass != null && { nxrBackdropClass: params.nxrBackdropClass }),
    ...(params.nxrBackdropStyles != null && { nxrBackdropStyles: params.nxrBackdropStyles }),
    parentRef,
    positionStrategy: new AnchoredStrategy({
      placement,
      offset,
      preferredPlacementOnly: effectivePreferredPlacementOnly,
      fallbackPlacements: params.fallbackPlacements,
      clampToViewport: effectiveClampToViewport,
      ...(stickWhenAnchorFullyOutOfViewport !== undefined && {
        stickWhenAnchorFullyOutOfViewport,
      }),
    }),
    scrollStrategy,
    focusStrategy,
    hasBackdrop,
    anchor,
    closePolicy,
    closeAnimationDurationMs,
    transformOriginElement: anchor,
    ...(panelClass != null && { panelClass }),
    ...(arrowSize != null && { arrowSize }),
    ...(beforeOpen && { beforeOpen }),
    ...(beforeClose && { beforeClose }),
    ...(params.ariaLabel != null && { ariaLabel: params.ariaLabel }),
    ...(params.ariaLabelledBy != null && { ariaLabelledBy: params.ariaLabelledBy }),
    ...(maintainInViewport !== undefined && { maintainInViewport }),
    ...(boundaries != null && { boundaries }),
  };
}

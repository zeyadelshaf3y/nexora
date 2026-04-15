import {
  BOTTOM_PLACEMENTS,
  END_PLACEMENTS,
  fallbackOrder,
  getAnchorViewportEdge,
  isBottomPlacement,
  isEndPlacement,
  isStartPlacement,
  isTopPlacement,
  orderWithFirst,
  placementToBottomFamily,
  placementToEndFamily,
  placementToStartFamily,
  placementToTopFamily,
  START_PLACEMENTS,
  TOP_PLACEMENTS,
} from './placement-families';
import {
  clampToViewport,
  fitsInViewport,
  isAnchorFullyInsideViewport,
  isAnchorFullyOutOfViewport,
  placementToRect,
} from './placement-utils';
import type { PositionContext } from './position-context';
import type { ArrowSide, Placement, PositionResult } from './position-result';
import type { PositionStrategy } from './position-strategy';

const DEFAULT_OFFSET = 8;
const VIEWPORT_PADDING = 0;

function clampToOverlayAxis(value: number, extent: number): number {
  return Math.max(0, Math.min(extent, value));
}

/** Raw position from placement logic, before viewport clamping. */
interface PlacementAndPosition {
  readonly x: number;
  readonly y: number;
  readonly placement: Placement;
  readonly transformOrigin: string;
}

/** Inputs for deciding which placement order to try. */
interface PlacementOrderParams {
  readonly anchorRect: DOMRect;
  readonly viewportRect: DOMRect;
  readonly padding: number;
  readonly dir: 'ltr' | 'rtl';
  readonly anchorFullyInsideViewport: boolean;
  readonly currentPlacement?: Placement;
  readonly useSinglePlacement: boolean;
  readonly stickPlacement?: Placement;
  readonly noopStickPlacement?: Placement;
}

interface ApplyModeFlags {
  readonly isNoopMode: boolean;
  readonly overlaySizeChanged: boolean;
  readonly useFitOnOpen: boolean;
}

export interface AnchoredStrategyOptions {
  /** Preferred placement. Default: `'bottom-start'`. */
  readonly placement?: Placement;
  /** Gap between anchor and panel in px. Default: `8`. */
  readonly offset?: number;
  /** Extra padding from viewport edges in px. Default: `0`. */
  readonly viewportPadding?: number;
  /** When `true`, only use the preferred placement; do not flip. Default: `false`. */
  readonly preferredPlacementOnly?: boolean;
  /**
   * Explicit list of placements to try (in order) when the preferred doesn't fit.
   * The preferred placement is always tried first even if not in this list.
   * When omitted, falls back to all 12 placements.
   *
   * Use this to restrict a select to vertical-only flipping:
   * ```ts
   * fallbackPlacements: ['bottom-start', 'top-start']
   * ```
   */
  readonly fallbackPlacements?: readonly Placement[];
  /**
   * When `true` (default), the panel is clamped to the viewport so it stays
   * visible even when the anchor scrolls partially off-screen.
   * When `false`, the panel follows the anchor out of the viewport.
   */
  readonly clampToViewport?: boolean;
  /**
   * When `true`, if the anchor is fully outside the viewport, do not clamp position and preserve
   * the current placement (panel follows trigger like noop). Used for reposition + maintainInViewport false.
   */
  readonly stickWhenAnchorFullyOutOfViewport?: boolean;
}

/**
 * Positions an overlay next to an anchor using 12 placements (RTL/LTR aware).
 * Tries the preferred placement, then fallbacks until one fits; optionally clamps to viewport.
 *
 * Special modes:
 * - **Stick when anchor fully out** (`stickWhenAnchorFullyOutOfViewport`): e.g. reposition + maintainInViewport false.
 *   Once the anchor is fully outside the viewport, the panel follows the trigger (no clamp, current placement preserved).
 * - **Noop scroll strategy**: First apply uses best-fit placement so the panel opens in view; subsequent applies (e.g. on scroll)
 *   stick to that placement. When the pane **content resizes** (e.g. combobox options list grows), we re-run best-fit and clamp
 *   so the panel repositions and does not overflow the viewport.
 */
export class AnchoredStrategy implements PositionStrategy {
  private readonly preferredPlacement: Placement;
  private readonly offset: number;
  private readonly viewportPadding: number;
  private readonly preferredPlacementOnly: boolean;
  private readonly customFallbacks: readonly Placement[] | undefined;
  private readonly clampEnabled: boolean;
  private readonly stickWhenAnchorFullyOut: boolean;

  /** Noop mode: first apply = best-fit; later applies = stick to this placement. Reset in detach(). */
  private hasAppliedOnce = false;
  private lastPlacementFromFirstApply: Placement | null = null;
  /** Noop mode: overlay size at last apply so we can re-fit when pane content resizes. */
  private lastOverlaySize: { width: number; height: number } | null = null;

  constructor(options?: AnchoredStrategyOptions) {
    this.preferredPlacement = options?.placement ?? 'bottom-start';
    this.offset = options?.offset ?? DEFAULT_OFFSET;
    this.viewportPadding = options?.viewportPadding ?? VIEWPORT_PADDING;
    this.preferredPlacementOnly = options?.preferredPlacementOnly ?? false;
    this.customFallbacks = options?.fallbackPlacements;
    this.clampEnabled = options?.clampToViewport ?? true;
    this.stickWhenAnchorFullyOut = options?.stickWhenAnchorFullyOutOfViewport ?? false;
  }

  /** Resets noop state so the next open gets best-fit on first apply. Called by overlay on close. */
  detach(): void {
    this.hasAppliedOnce = false;
    this.lastPlacementFromFirstApply = null;
    this.lastOverlaySize = null;
  }

  apply(ctx: PositionContext): PositionResult {
    const { overlaySize, anchorRect, viewportRect } = ctx;
    const padding = this.viewportPadding;
    const dir = ctx.dir ?? 'ltr';

    const mode = this.getApplyModeFlags(overlaySize);

    const anchorFullyOut =
      anchorRect != null &&
      this.stickWhenAnchorFullyOut &&
      isAnchorFullyOutOfViewport(anchorRect, viewportRect, padding);
    const shouldClamp = this.shouldClampPosition(anchorRect, anchorFullyOut, mode.useFitOnOpen);

    const { x, y, placement, transformOrigin } = this.computePlacementAndPosition(ctx, {
      useFitOnOpen: mode.useFitOnOpen,
      isNoopMode: mode.isNoopMode,
    });

    if (mode.isNoopMode) {
      this.hasAppliedOnce = true;
      this.lastPlacementFromFirstApply = placement;
      this.lastOverlaySize = { width: overlaySize.width, height: overlaySize.height };
    }

    const finalPos = shouldClamp
      ? clampToViewport(x, y, overlaySize.width, overlaySize.height, viewportRect, padding)
      : { x, y };

    const arrow =
      anchorRect != null
        ? this.computeArrow(placement, finalPos, anchorRect, overlaySize, dir)
        : undefined;

    return {
      x: finalPos.x,
      y: finalPos.y,
      placement,
      panePlacement: placement,
      transformOrigin,
      ...(arrow != null && { arrowOffset: arrow.arrowOffset, arrowSide: arrow.arrowSide }),
    };
  }

  private getApplyModeFlags(overlaySize: { width: number; height: number }): ApplyModeFlags {
    const isNoopMode =
      this.preferredPlacementOnly && !this.clampEnabled && !this.stickWhenAnchorFullyOut;
    const overlaySizeChanged =
      this.lastOverlaySize != null &&
      (overlaySize.width !== this.lastOverlaySize.width ||
        overlaySize.height !== this.lastOverlaySize.height);
    const useFitOnOpen = (isNoopMode && !this.hasAppliedOnce) || (isNoopMode && overlaySizeChanged);

    return { isNoopMode, overlaySizeChanged, useFitOnOpen };
  }

  private shouldClampPosition(
    anchorRect: DOMRect | undefined,
    anchorFullyOut: boolean,
    useFitOnOpen: boolean,
  ): boolean {
    return useFitOnOpen || (this.clampEnabled && anchorRect != null && !anchorFullyOut);
  }

  private computePlacementAndPosition(
    ctx: PositionContext,
    mode: { useFitOnOpen: boolean; isNoopMode: boolean },
  ): PlacementAndPosition {
    const { overlaySize, anchorRect, viewportRect } = ctx;
    const offset = ctx.offset ?? this.offset;
    const padding = this.viewportPadding;
    const dir = ctx.dir ?? 'ltr';

    if (anchorRect == null) {
      return this.centerInViewport(overlaySize, viewportRect, padding);
    }

    const anchorFullyInsideViewport = isAnchorFullyInsideViewport(
      anchorRect,
      viewportRect,
      padding,
    );
    const useStickPlacement =
      this.stickWhenAnchorFullyOut && isAnchorFullyOutOfViewport(anchorRect, viewportRect, padding);
    const useSinglePlacement =
      !mode.useFitOnOpen && (this.preferredPlacementOnly || useStickPlacement);
    const stickPlacement = useStickPlacement
      ? (ctx.currentPlacement ?? this.preferredPlacement)
      : undefined;
    const noopStickPlacement =
      mode.isNoopMode && this.hasAppliedOnce
        ? (this.lastPlacementFromFirstApply ?? this.preferredPlacement)
        : undefined;

    const order = this.getPlacementOrder({
      anchorRect,
      viewportRect,
      padding,
      dir,
      anchorFullyInsideViewport,
      currentPlacement: ctx.currentPlacement,
      useSinglePlacement,
      stickPlacement,
      noopStickPlacement,
    });

    return this.tryPlacementsUntilFits(
      order,
      anchorRect,
      overlaySize,
      offset,
      dir,
      padding,
      viewportRect,
      useSinglePlacement,
    );
  }

  private tryPlacementsUntilFits(
    order: Placement[],
    anchorRect: DOMRect,
    overlaySize: { width: number; height: number },
    offset: number,
    dir: 'ltr' | 'rtl',
    padding: number,
    viewportRect: DOMRect,
    useSinglePlacement: boolean,
  ): PlacementAndPosition {
    let placement = this.preferredPlacement;
    let x = 0;
    let y = 0;
    let transformOrigin = 'center center';

    for (const p of order) {
      const result = placementToRect(p, anchorRect, overlaySize, offset, dir);
      placement = p;
      x = result.x;
      y = result.y;
      transformOrigin = result.transformOrigin;
      const fits =
        useSinglePlacement ||
        fitsInViewport(
          result.x,
          result.y,
          overlaySize.width,
          overlaySize.height,
          viewportRect,
          padding,
        );
      if (fits) break;
    }

    return { x, y, placement, transformOrigin };
  }

  private centerInViewport(
    overlaySize: { width: number; height: number },
    viewportRect: DOMRect,
    padding: number,
  ): PlacementAndPosition {
    const centerX = viewportRect.left + (viewportRect.width - overlaySize.width) / 2;
    const centerY = viewportRect.top + (viewportRect.height - overlaySize.height) / 2;
    const clamped = clampToViewport(
      centerX,
      centerY,
      overlaySize.width,
      overlaySize.height,
      viewportRect,
      padding,
    );

    return {
      x: clamped.x,
      y: clamped.y,
      placement: 'bottom-start',
      transformOrigin: 'center center',
    };
  }

  /**
   * Returns the ordered list of placements to try.
   * Single-placement mode: noop stick, reposition stick, or preferred only.
   */
  private getPlacementOrder(params: PlacementOrderParams): Placement[] {
    const {
      anchorRect,
      viewportRect,
      padding,
      dir,
      anchorFullyInsideViewport,
      currentPlacement,
      useSinglePlacement,
      stickPlacement,
      noopStickPlacement,
    } = params;
    const preferred = this.preferredPlacement;
    const placementToUse = currentPlacement ?? preferred;

    if (useSinglePlacement) {
      if (noopStickPlacement != null) return [noopStickPlacement];
      if (stickPlacement != null) return [stickPlacement];

      return [preferred];
    }

    let normalOrder: Placement[];

    if (this.customFallbacks) {
      const cf = this.customFallbacks;
      const rest = cf.filter((p) => p !== preferred);

      normalOrder = [preferred, ...rest];
    } else {
      normalOrder = fallbackOrder(preferred);
    }

    if (anchorFullyInsideViewport) return normalOrder;

    const edge = getAnchorViewportEdge(anchorRect, viewportRect, padding, dir);
    if (edge == null) return normalOrder;

    return this.getEdgeBiasedOrder(edge, placementToUse);
  }

  private getEdgeBiasedOrder(
    edge: 'top' | 'bottom' | 'start' | 'end',
    placementToUse: Placement,
  ): Placement[] {
    switch (edge) {
      case 'top':
        return isBottomPlacement(placementToUse)
          ? [placementToUse]
          : orderWithFirst(placementToBottomFamily(placementToUse), BOTTOM_PLACEMENTS);
      case 'bottom':
        return isTopPlacement(placementToUse)
          ? [placementToUse]
          : orderWithFirst(placementToTopFamily(placementToUse), TOP_PLACEMENTS);
      case 'start':
        return isEndPlacement(placementToUse)
          ? [placementToUse]
          : orderWithFirst(placementToEndFamily(placementToUse), END_PLACEMENTS);
      case 'end':
        return isStartPlacement(placementToUse)
          ? [placementToUse]
          : orderWithFirst(placementToStartFamily(placementToUse), START_PLACEMENTS);
    }
  }

  private computeArrow(
    placement: Placement,
    finalPos: { x: number; y: number },
    anchorRect: DOMRect,
    overlaySize: { width: number; height: number },
    dir: 'ltr' | 'rtl',
  ): { arrowOffset: { x: number; y: number }; arrowSide: ArrowSide } | undefined {
    const anchorCenterX = anchorRect.left + anchorRect.width / 2;
    const anchorCenterY = anchorRect.top + anchorRect.height / 2;
    const clampX = (v: number) => clampToOverlayAxis(v, overlaySize.width);
    const clampY = (v: number) => clampToOverlayAxis(v, overlaySize.height);

    if (placement.startsWith('bottom')) {
      return {
        arrowSide: 'top',
        arrowOffset: { x: clampX(anchorCenterX - finalPos.x), y: 0 },
      };
    }
    if (placement.startsWith('top')) {
      return {
        arrowSide: 'bottom',
        arrowOffset: {
          x: clampX(anchorCenterX - finalPos.x),
          y: overlaySize.height,
        },
      };
    }
    if (placement.startsWith('start')) {
      return {
        arrowSide: dir === 'rtl' ? 'start' : 'end',
        arrowOffset:
          dir === 'rtl'
            ? { x: 0, y: clampY(anchorCenterY - finalPos.y) }
            : { x: overlaySize.width, y: clampY(anchorCenterY - finalPos.y) },
      };
    }
    if (placement.startsWith('end')) {
      return {
        arrowSide: dir === 'rtl' ? 'end' : 'start',
        arrowOffset:
          dir === 'rtl'
            ? { x: overlaySize.width, y: clampY(anchorCenterY - finalPos.y) }
            : { x: 0, y: clampY(anchorCenterY - finalPos.y) },
      };
    }

    return undefined;
  }
}

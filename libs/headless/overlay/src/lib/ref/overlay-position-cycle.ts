import { getResolvedDir } from '@nexora-ui/core';

import { isAnchorFullyOutOfViewport } from '../position/placement-utils';
import type { Placement } from '../position/position-result';
import { NoopScrollStrategy } from '../scroll/noop-scroll-strategy';
import { RepositionScrollStrategy } from '../scroll/reposition-scroll-strategy';

import type { OverlayConfig } from './overlay-config';
import { applyPositionResult } from './overlay-position-applier';
import { overlayHasAnchorOption } from './overlay-resolve-elements';
import { formatMaxSize } from './overlay-viewport-bounds';

/** Match position strategy viewport padding (0) so height clamp doesn't create unnecessary inner scroll. */
export const OVERLAY_POSITION_VIEWPORT_EDGE_PADDING = 0;

type PositionCycleConfig = Pick<
  OverlayConfig,
  | 'positionStrategy'
  | 'arrowSize'
  | 'anchor'
  | 'scrollStrategy'
  | 'maintainInViewport'
  | 'maxHeight'
>;

/**
 * True when the panel should follow the trigger off-screen (no viewport clamp):
 * noop scroll strategy, or reposition with maintainInViewport false and anchor fully out.
 */
export function shouldFollowAnchorOffViewport(
  config: Pick<OverlayConfig, 'scrollStrategy' | 'maintainInViewport' | 'anchor'>,
  viewportRect: DOMRect,
  anchorRect: DOMRect | undefined,
  viewportEdgePadding = OVERLAY_POSITION_VIEWPORT_EDGE_PADDING,
): boolean {
  if (config.scrollStrategy instanceof NoopScrollStrategy) return true;
  if (config.scrollStrategy instanceof RepositionScrollStrategy) {
    return (
      config.maintainInViewport === false &&
      overlayHasAnchorOption(config) &&
      anchorRect != null &&
      isAnchorFullyOutOfViewport(anchorRect, viewportRect, viewportEdgePadding)
    );
  }

  return false;
}

/**
 * Restore pane max-height to the viewport cap before measuring so the position strategy
 * sees the intended (unclamped) size. Prevents feedback loop where a shrunk pane leads
 * to further clamping.
 */
export function resetPaneMaxHeightBeforePositionMeasure(
  pane: HTMLElement,
  hasAnchor: boolean,
  getViewportRect: () => DOMRect,
  maxHeightFromConfig: string | undefined,
): void {
  if (!hasAnchor) return;

  pane.style.maxHeight = formatMaxSize(maxHeightFromConfig, getViewportRect().height);
}

/**
 * Applies max-height after position: full viewport cap when following the trigger off-screen,
 * otherwise clamp to space below the pane top.
 */
export function applyPaneMaxHeightAfterPosition(
  pane: HTMLElement,
  hasAnchor: boolean,
  maxHeightFromConfig: string | undefined,
  paneTopY: number,
  viewportRect: DOMRect,
  followTriggerOffScreen: boolean,
  viewportEdgePadding = OVERLAY_POSITION_VIEWPORT_EDGE_PADDING,
): void {
  if (!hasAnchor) return;

  if (followTriggerOffScreen) {
    pane.style.maxHeight = formatMaxSize(maxHeightFromConfig, viewportRect.height);

    return;
  }

  const availableHeight = Math.max(0, viewportRect.bottom - paneTopY - viewportEdgePadding);
  if (availableHeight <= 0) return;

  pane.style.maxHeight = formatMaxSize(maxHeightFromConfig, availableHeight);
}

export interface OverlayPositionCycleContext {
  getViewportRect: () => DOMRect;
  getAnchorElement: () => HTMLElement | undefined;
  currentPlacement: Placement | undefined;
}

/**
 * One full reposition pass: reset max-height for measure, run {@link PositionStrategy.apply},
 * apply coordinates/arrow, then set anchored max-height. Returns the resolved placement.
 */
export function runOverlayPositionCycle(
  pane: HTMLElement,
  config: PositionCycleConfig,
  ctx: OverlayPositionCycleContext,
): Placement {
  resetPaneMaxHeightBeforePositionMeasure(
    pane,
    overlayHasAnchorOption(config),
    ctx.getViewportRect,
    config.maxHeight,
  );

  const viewportRect = ctx.getViewportRect();
  const anchorEl = ctx.getAnchorElement();
  const anchorRect = anchorEl?.getBoundingClientRect?.();

  const result = config.positionStrategy.apply({
    overlaySize: { width: pane.offsetWidth, height: pane.offsetHeight },
    viewportRect,
    anchorRect,
    dir: getResolvedDir(anchorEl),
    currentPlacement: ctx.currentPlacement,
  });

  applyPositionResult({
    pane,
    result,
    arrowSize: config.arrowSize,
    anchorRect,
    viewportRect,
  });

  const followOff = shouldFollowAnchorOffViewport(config, viewportRect, anchorRect ?? undefined);
  applyPaneMaxHeightAfterPosition(
    pane,
    overlayHasAnchorOption(config),
    config.maxHeight,
    result.y,
    viewportRect,
    followOff,
  );

  return result.placement;
}

import type { PositionContext } from './position-context';
import type { PositionResult } from './position-result';
import type { PositionStrategy } from './position-strategy';

/** 4 positions for drawer: full-width top/bottom, full-height start/end. start/end resolve with RTL. */
export type DrawerPlacement = 'top' | 'bottom' | 'start' | 'end';

type TextDir = 'ltr' | 'rtl';

/** Raw position and transform-origin for a drawer placement (viewport-relative 0,0 origin). */
interface DrawerPosition {
  x: number;
  y: number;
  transformOrigin: string;
  placement: PositionResult['placement'];
}

function getDrawerPosition(
  placement: DrawerPlacement,
  viewportWidth: number,
  viewportHeight: number,
  overlayWidth: number,
  overlayHeight: number,
  dir: TextDir,
): DrawerPosition {
  switch (placement) {
    case 'top':
      return {
        x: 0,
        y: 0,
        transformOrigin: 'center top',
        placement: 'top',
      };
    case 'bottom':
      return {
        x: 0,
        y: viewportHeight - overlayHeight,
        transformOrigin: 'center bottom',
        placement: 'bottom',
      };
    case 'start':
      return {
        x: dir === 'rtl' ? viewportWidth - overlayWidth : 0,
        y: 0,
        transformOrigin: dir === 'rtl' ? 'right center' : 'left center',
        placement: 'start',
      };
    case 'end':
      return {
        x: dir === 'rtl' ? 0 : viewportWidth - overlayWidth,
        y: 0,
        transformOrigin: dir === 'rtl' ? 'left center' : 'right center',
        placement: 'end',
      };
  }
}

/**
 * Positions a drawer on one of 4 viewport edges. RTL-aware for start/end.
 * Pane dimensions should be set via config (width for start/end, height for top/bottom).
 */
export class DrawerStrategy implements PositionStrategy {
  constructor(private readonly placement: DrawerPlacement) {}

  apply(ctx: PositionContext): PositionResult {
    const { overlaySize, viewportRect, dir = 'ltr' } = ctx;
    const pos = getDrawerPosition(
      this.placement,
      viewportRect.width,
      viewportRect.height,
      overlaySize.width,
      overlaySize.height,
      dir,
    );

    return {
      x: viewportRect.left + pos.x,
      y: viewportRect.top + pos.y,
      placement: pos.placement,
      transformOrigin: pos.transformOrigin,
      panePlacement: `drawer-${this.placement}`,
    };
  }
}

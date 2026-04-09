import {
  DEFAULT_VIEWPORT_PADDING,
  type PositionContext,
  type PositionResult,
  type PositionStrategy,
} from '@nexora-ui/overlay';

import type { SnackbarPlacement } from './snackbar-placement';

/** Default viewport-edge padding in px. Matches overlay {@link DEFAULT_VIEWPORT_PADDING}. */
export const DEFAULT_SNACKBAR_PADDING = DEFAULT_VIEWPORT_PADDING;

/** Default gap between stacked snackbars in px. */
export const DEFAULT_SNACKBAR_STACK_GAP = 8;

/**
 * Positions the snackbar pane at a viewport edge. Supports stacking: each open snackbar
 * at the same placement gets an offset so they don't overlap. Uses `getStackOffset()` to
 * compute the cumulative height of all preceding snackbars, supporting variable-height
 * content. RTL-aware: when `ctx.dir === 'rtl'`, start/end placements flip (uses
 * document/anchor dir from overlay).
 */
export class SnackbarPositionStrategy implements PositionStrategy {
  constructor(
    private readonly placement: SnackbarPlacement,
    private readonly getStackOffset: () => number,
    private readonly options: {
      /** Viewport-edge padding in px. Default: {@link DEFAULT_SNACKBAR_PADDING}. */
      padding?: number;
    } = {},
  ) {}

  apply(ctx: PositionContext): PositionResult {
    const { overlaySize, viewportRect: v, dir = 'ltr' } = ctx;
    const padding = this.options.padding ?? DEFAULT_SNACKBAR_PADDING;
    const offset = this.getStackOffset();

    const { x, y } = this.computePosition({
      viewportRect: v,
      width: overlaySize.width,
      height: overlaySize.height,
      padding,
      offset,
      dir,
    });

    return {
      x,
      y,
      placement: this.placement,
      transformOrigin: 'center center',
      panePlacement: `snackbar-${this.placement}`,
    };
  }

  private computePosition(params: {
    viewportRect: DOMRect;
    width: number;
    height: number;
    padding: number;
    offset: number;
    dir: 'ltr' | 'rtl';
  }): { x: number; y: number } {
    const { viewportRect: v, width: w, height: h, padding, offset, dir } = params;
    const x = this.getX(v, w, padding, dir);
    const y = this.getY(v, h, padding, offset);

    return { x, y };
  }

  private getX(v: DOMRect, w: number, padding: number, dir: 'ltr' | 'rtl'): number {
    const isRtl = dir === 'rtl';
    switch (this.placement) {
      case 'top-start':
      case 'bottom-start':
        return isRtl ? v.right - w - padding : v.left + padding;
      case 'top':
      case 'bottom':
        return v.left + (v.width - w) / 2;
      case 'top-end':
      case 'bottom-end':
        return isRtl ? v.left + padding : v.right - w - padding;
    }
  }

  private getY(v: DOMRect, h: number, padding: number, offset: number): number {
    const isTop =
      this.placement === 'top-start' || this.placement === 'top' || this.placement === 'top-end';

    return isTop ? v.top + padding + offset : v.bottom - h - padding - offset;
  }
}

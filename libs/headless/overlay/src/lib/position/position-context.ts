import type { Placement } from './position-result';

/**
 * Input to position strategies. Pre-measured data only; no DOM reference to pane.
 * dir is used to resolve start/end in RTL/LTR for 12-position placement.
 */
export interface PositionContext {
  overlaySize: { width: number; height: number };
  anchorRect?: DOMRect;
  viewportRect: DOMRect;
  offset?: number;
  /** Resolves start/end for placements; default from document or 'ltr'. */
  dir?: 'ltr' | 'rtl';
  /** Last applied placement (used for off-viewport logic so we don't revert to initial preferred). */
  currentPlacement?: Placement;
}

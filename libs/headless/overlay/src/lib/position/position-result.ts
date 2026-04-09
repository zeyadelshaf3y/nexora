/**
 * Result of a position strategy. The overlay engine applies x, y, transformOrigin, and
 * optional arrow CSS variables to the pane; strategies only return data.
 */

/** 12-position placement for anchored overlays. Uses start/end for RTL. */
export type Placement =
  | 'top-start'
  | 'top'
  | 'top-end'
  | 'bottom-start'
  | 'bottom'
  | 'bottom-end'
  | 'start-top'
  | 'start'
  | 'start-end'
  | 'end-start'
  | 'end'
  | 'end-end';

/** Edge of the pane the arrow sits on. Used to set rotation and offset. */
export type ArrowSide = 'top' | 'bottom' | 'start' | 'end';

export interface PositionResult {
  x: number;
  y: number;
  placement: Placement;
  transformOrigin: string;
  /** When set, overlay applies arrow CSS vars and arrow sits outside the pane. */
  arrowOffset?: { x: number; y: number };
  /** Edge of the pane for the arrow (required when arrowOffset is set). */
  arrowSide?: ArrowSide;
  /** Optional; set on pane as data-placement for CSS (e.g. dialog-center, drawer-end). */
  panePlacement?: string;
}

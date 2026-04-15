/**
 * Applies position strategy result to the overlay pane (coordinates, transform origin,
 * data-placement, and optional arrow styles). Single responsibility: turn strategy
 * output into DOM updates.
 * @internal
 */

import {
  applyArrowStyles,
  clearArrowStyles,
  DEFAULT_ARROW_HEIGHT,
  DEFAULT_ARROW_WIDTH,
  isAnchorInViewport,
} from '../arrow/apply-arrow-styles';
import type { PositionResult } from '../position/position-result';

import type { ArrowSize } from './overlay-config';

export interface ApplyPositionResultParams {
  readonly pane: HTMLElement;
  readonly result: PositionResult;
  readonly arrowSize?: ArrowSize;
  readonly anchorRect: DOMRect | undefined;
  readonly viewportRect: DOMRect;
}

/**
 * Applies the position strategy result to the pane: left, top, transformOrigin,
 * data-placement, and arrow CSS variables when result.arrowOffset is set.
 */
export function applyPositionResult(params: ApplyPositionResultParams): void {
  const { pane, result, arrowSize, anchorRect, viewportRect } = params;

  pane.style.left = `${result.x}px`;
  pane.style.top = `${result.y}px`;

  pane.style.transformOrigin = result.transformOrigin;

  if (result.panePlacement) {
    pane.setAttribute('data-placement', result.panePlacement);
  }

  if (result.arrowOffset) {
    const size = arrowSize ?? {
      width: DEFAULT_ARROW_WIDTH,
      height: DEFAULT_ARROW_HEIGHT,
    };

    applyArrowStyles({
      pane,
      arrowOffset: result.arrowOffset,
      arrowSide: result.arrowSide,
      arrowSize: size,
      anchorInViewport: isAnchorInViewport(anchorRect, viewportRect),
    });
  } else {
    clearArrowStyles(pane);
  }
}

import type { PositionContext } from './position-context';
import type { PositionResult } from './position-result';
import type { PositionStrategy } from './position-strategy';

/** 9 positions for dialog: corners, edges, center. start/end resolve with RTL. */
export type DialogPlacement =
  | 'top-start'
  | 'top'
  | 'top-end'
  | 'start'
  | 'center'
  | 'end'
  | 'bottom-start'
  | 'bottom'
  | 'bottom-end';

const VIEWPORT_PADDING = 16;
type TextDir = 'ltr' | 'rtl';

function isStartPlacement(placement: DialogPlacement): boolean {
  return placement.includes('start') || placement === 'start';
}

function isEndPlacement(placement: DialogPlacement): boolean {
  return placement.includes('end') || placement === 'end';
}

function isCenterHorizontalPlacement(placement: DialogPlacement): boolean {
  return placement === 'center' || placement === 'top' || placement === 'bottom';
}

/** Horizontal position in viewport (LTR: start=left, end=right; RTL flips). */
function getDialogX(
  placement: DialogPlacement,
  viewportWidth: number,
  overlayWidth: number,
  dir: TextDir,
): number {
  const isStart = isStartPlacement(placement);
  const isEnd = isEndPlacement(placement);
  const isCenter = isCenterHorizontalPlacement(placement);

  if (isCenter) return (viewportWidth - overlayWidth) / 2;

  if (dir === 'rtl') {
    if (isStart) return viewportWidth - overlayWidth - VIEWPORT_PADDING;
    if (isEnd) return VIEWPORT_PADDING;
  } else {
    if (isStart) return VIEWPORT_PADDING;
    if (isEnd) return viewportWidth - overlayWidth - VIEWPORT_PADDING;
  }

  return VIEWPORT_PADDING;
}

/** Vertical position in viewport. */
function getDialogY(
  placement: DialogPlacement,
  viewportHeight: number,
  overlayHeight: number,
): number {
  if (placement.startsWith('top')) return VIEWPORT_PADDING;
  if (placement.startsWith('bottom')) return viewportHeight - overlayHeight - VIEWPORT_PADDING;
  if (placement === 'start' || placement === 'end' || placement === 'center') {
    return (viewportHeight - overlayHeight) / 2;
  }

  return VIEWPORT_PADDING;
}

/** CSS transform-origin horizontal keyword (RTL-aware for start/end). */
function getTransformOriginX(placement: DialogPlacement, dir: TextDir): string {
  const isStart = isStartPlacement(placement);
  const isEnd = isEndPlacement(placement);
  if (isStart) return dir === 'rtl' ? 'right' : 'left';
  if (isEnd) return dir === 'rtl' ? 'left' : 'right';

  return 'center';
}

/** CSS transform-origin vertical keyword. */
function getTransformOriginY(placement: DialogPlacement): string {
  if (placement.startsWith('top')) return 'top';
  if (placement.startsWith('bottom')) return 'bottom';

  return 'center';
}

function getDialogTransformOrigin(placement: DialogPlacement, dir: TextDir): string {
  return `${getTransformOriginX(placement, dir)} ${getTransformOriginY(placement)}`;
}

/** Maps dialog placement to anchored Placement type for PositionResult. */
function toAnchoredPlacement(placement: DialogPlacement): PositionResult['placement'] {
  const map: Record<DialogPlacement, PositionResult['placement']> = {
    'top-start': 'top-start',
    top: 'top',
    'top-end': 'top-end',
    start: 'start',
    center: 'bottom',
    end: 'end',
    'bottom-start': 'bottom-start',
    bottom: 'bottom',
    'bottom-end': 'bottom-end',
  };

  return map[placement];
}

/**
 * Positions a dialog in one of 9 viewport positions. RTL-aware for start/end.
 */
export class DialogStrategy implements PositionStrategy {
  constructor(private readonly placement: DialogPlacement = 'center') {}

  apply(ctx: PositionContext): PositionResult {
    const { overlaySize, viewportRect, dir = 'ltr' } = ctx;
    const x = getDialogX(this.placement, viewportRect.width, overlaySize.width, dir);
    const y = getDialogY(this.placement, viewportRect.height, overlaySize.height);

    return {
      x: viewportRect.left + x,
      y: viewportRect.top + y,
      placement: toAnchoredPlacement(this.placement),
      transformOrigin: getDialogTransformOrigin(this.placement, dir),
      panePlacement: `dialog-${this.placement}`,
    };
  }
}

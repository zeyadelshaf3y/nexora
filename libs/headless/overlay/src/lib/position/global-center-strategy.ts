import type { PositionContext } from './position-context';
import type { PositionResult } from './position-result';
import type { PositionStrategy } from './position-strategy';

/**
 * Centers the overlay in the viewport (e.g. for dialogs).
 */
export class GlobalCenterStrategy implements PositionStrategy {
  apply(ctx: PositionContext): PositionResult {
    const { overlaySize, viewportRect } = ctx;
    const x = viewportRect.left + (viewportRect.width - overlaySize.width) / 2;
    const y = viewportRect.top + (viewportRect.height - overlaySize.height) / 2;

    return {
      x,
      y,
      placement: 'bottom',
      transformOrigin: 'center center',
    };
  }
}

import { describe, expect, it } from 'vitest';

import { applyDragTransform } from './drag-pane-transform';
import { runGestureCloseAnimation, runSnapBackAnimation } from './gesture-close-animation';

describe('gesture-close-animation', () => {
  it('runGestureCloseAnimation sets off-screen transform immediately when duration is 0', async () => {
    const pane = document.createElement('div');
    applyDragTransform(pane, 'x', 50);

    await runGestureCloseAnimation({
      pane,
      backdrop: null,
      axis: 'x',
      offScreenOffsetPx: 400,
      durationMs: 0,
    });

    expect(pane.style.transform).toBe('translateX(400px)');
  });

  it('runSnapBackAnimation clears transform when duration is 0', async () => {
    const pane = document.createElement('div');
    applyDragTransform(pane, 'y', 80);

    await runSnapBackAnimation({ pane, axis: 'y', durationMs: 0 });

    expect(pane.style.transform).toBe('');
  });
});

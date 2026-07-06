import { describe, expect, it } from 'vitest';

import { applyDragTransform, getOffScreenOffsetPx } from './drag-pane-transform';

describe('drag-pane-transform', () => {
  it('applyDragTransform sets axis-specific translate', () => {
    const pane = document.createElement('div');

    applyDragTransform(pane, 'x', 40);
    expect(pane.style.transform).toBe('translateX(40px)');

    applyDragTransform(pane, 'y', -20);
    expect(pane.style.transform).toBe('translateY(-20px)');
  });

  it('getOffScreenOffsetPx returns signed pane size', () => {
    const pane = document.createElement('div');
    Object.defineProperty(pane, 'offsetWidth', { value: 300, configurable: true });
    Object.defineProperty(pane, 'offsetHeight', { value: 200, configurable: true });

    expect(getOffScreenOffsetPx(pane, 'x', 1)).toBe(300);
    expect(getOffScreenOffsetPx(pane, 'y', -1)).toBe(-200);
  });
});

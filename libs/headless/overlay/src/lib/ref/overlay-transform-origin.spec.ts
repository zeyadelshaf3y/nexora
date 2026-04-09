import { vi } from 'vitest';

import {
  applyOverlayTransformOriginFromTrigger,
  getPaneComputedPositionOrigin,
} from './overlay-transform-origin';

describe('getPaneComputedPositionOrigin', () => {
  it('reads left/top from computed style when available', () => {
    const pane = document.createElement('div');
    document.body.appendChild(pane);
    pane.style.position = 'fixed';
    pane.style.left = '12px';
    pane.style.top = '34px';

    const origin = getPaneComputedPositionOrigin(pane);
    expect(origin?.left).toBe(12);
    expect(origin?.top).toBe(34);

    document.body.removeChild(pane);
  });
});

describe('applyOverlayTransformOriginFromTrigger', () => {
  it('sets transform-origin from trigger center when placement is null', () => {
    const pane = document.createElement('div');
    document.body.appendChild(pane);
    pane.style.position = 'fixed';
    pane.style.left = '0px';
    pane.style.top = '0px';

    const trigger = document.createElement('div');
    document.body.appendChild(trigger);
    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue(new DOMRect(100, 200, 40, 30));

    applyOverlayTransformOriginFromTrigger(pane, trigger, null);
    expect(pane.style.transformOrigin).toBe('120px 215px');

    document.body.removeChild(pane);
    document.body.removeChild(trigger);
  });
});

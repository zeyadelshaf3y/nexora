import { vi } from 'vitest';

import {
  applyBoundariesToRect,
  applyPaneMaxSizesForContainedHost,
  formatMaxSize,
  getOverlayBaseViewportRect,
  getOverlayPositioningViewportRect,
  intersectHostRectWithVisibleViewport,
  setTransformOriginFromViewportPoint,
} from './overlay-viewport-bounds';

describe('applyBoundariesToRect', () => {
  it('returns the same rect when boundaries are undefined', () => {
    const r = new DOMRect(10, 20, 100, 200);
    expect(applyBoundariesToRect(r, undefined)).toEqual(r);
  });

  it('insets on all sides', () => {
    const r = new DOMRect(0, 0, 100, 80);
    const out = applyBoundariesToRect(r, { top: 5, right: 10, bottom: 15, left: 20 });
    expect(out.x).toBe(20);
    expect(out.y).toBe(5);
    expect(out.width).toBe(70);
    expect(out.height).toBe(60);
  });

  it('clamps size to zero when insets exceed dimensions', () => {
    const r = new DOMRect(0, 0, 10, 10);
    const out = applyBoundariesToRect(r, { left: 6, right: 6 });
    expect(out.width).toBe(0);
    expect(out.height).toBe(10);
  });
});

describe('formatMaxSize', () => {
  it('uses viewport px when config is omitted', () => {
    expect(formatMaxSize(undefined, 400)).toBe('400px');
  });

  it('wraps consumer value in min with viewport', () => {
    expect(formatMaxSize('90%', 800)).toBe('min(90%, 800px)');
  });
});

describe('setTransformOriginFromViewportPoint', () => {
  it('sets transform-origin from viewport point minus pane origin', () => {
    const pane = document.createElement('div');
    setTransformOriginFromViewportPoint(pane, { x: 100, y: 50 }, { left: 30, top: 20 });
    expect(pane.style.transformOrigin).toBe('70px 30px');
  });
});

describe('getOverlayBaseViewportRect', () => {
  it('uses getViewportRect when host option is unset', () => {
    const vp = new DOMRect(0, 0, 100, 200);
    expect(getOverlayBaseViewportRect(undefined, null, () => vp)).toEqual(vp);
  });

  it('uses clipped host rect when host option and element are set', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    vi.spyOn(host, 'getBoundingClientRect').mockReturnValue(new DOMRect(10, 20, 300, 400));
    const vp = new DOMRect(0, 0, 800, 600);
    const out = getOverlayBaseViewportRect(host, host, () => vp);
    expect(out.width).toBe(300);
    expect(out.height).toBe(400);
    document.body.removeChild(host);
  });
});

describe('getOverlayPositioningViewportRect', () => {
  it('applies boundaries on top of base rect', () => {
    const vp = new DOMRect(0, 0, 500, 400);
    const out = getOverlayPositioningViewportRect(
      undefined,
      null,
      { left: 10, right: 10 },
      () => vp,
    );
    expect(out.width).toBe(480);
  });
});

describe('applyPaneMaxSizesForContainedHost', () => {
  it('applies min() caps from host rect and boundaries', () => {
    const pane = document.createElement('div');
    const hostRect = new DOMRect(0, 0, 500, 400);
    applyPaneMaxSizesForContainedHost(pane, hostRect, { left: 20, right: 20 }, '100%', '100vh');
    expect(pane.style.maxWidth).toBe('min(100%, 460px)');
    expect(pane.style.maxHeight).toBe('min(100vh, 400px)');
  });
});

describe('intersectHostRectWithVisibleViewport', () => {
  const visible = new DOMRect(0, 0, 800, 600);

  it('returns visible when host is fully outside', () => {
    const host = new DOMRect(-100, -100, 50, 50);
    expect(intersectHostRectWithVisibleViewport(host, visible)).toEqual(visible);
  });

  it('returns intersection when host overlaps viewport', () => {
    const host = new DOMRect(100, 100, 200, 300);
    const out = intersectHostRectWithVisibleViewport(host, visible);
    expect(out.x).toBe(100);
    expect(out.y).toBe(100);
    expect(out.width).toBe(200);
    expect(out.height).toBe(300);
  });

  it('clips to viewport edges', () => {
    const host = new DOMRect(-50, 400, 1000, 400);
    const out = intersectHostRectWithVisibleViewport(host, visible);
    expect(out.x).toBe(0);
    expect(out.y).toBe(400);
    expect(out.width).toBe(800);
    expect(out.height).toBe(200);
  });
});

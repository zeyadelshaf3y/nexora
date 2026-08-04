import { afterEach, describe, expect, it, vi } from 'vitest';

import { getViewportRect } from './viewport';

describe('getViewportRect', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns a DOMRect with non-negative width and height', () => {
    const rect = getViewportRect();
    expect(rect).toBeInstanceOf(DOMRect);
    expect(rect.width).toBeGreaterThanOrEqual(0);
    expect(rect.height).toBeGreaterThanOrEqual(0);
  });

  it('accepts an explicit document argument', () => {
    const rect = getViewportRect(document);
    expect(rect).toBeInstanceOf(DOMRect);
  });

  it('prefers the visual viewport when available (keyboard / pinch-zoom)', () => {
    vi.stubGlobal('visualViewport', {
      offsetLeft: 12,
      offsetTop: 80,
      width: 390,
      height: 420,
    });

    const rect = getViewportRect(document);
    expect(rect.x).toBe(12);
    expect(rect.y).toBe(80);
    expect(rect.width).toBe(390);
    expect(rect.height).toBe(420);
  });

  it('falls back to the layout viewport when visual viewport size is zero', () => {
    vi.stubGlobal('visualViewport', {
      offsetLeft: 0,
      offsetTop: 0,
      width: 0,
      height: 0,
    });

    const rect = getViewportRect(document);
    expect(rect.x).toBe(0);
    expect(rect.y).toBe(0);
    expect(rect.width).toBeGreaterThan(0);
    expect(rect.height).toBeGreaterThan(0);
  });
});

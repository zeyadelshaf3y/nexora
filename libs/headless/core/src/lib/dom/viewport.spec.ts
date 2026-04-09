import { getViewportRect } from './viewport';

describe('getViewportRect', () => {
  it('returns a DOMRect with non-negative width and height', () => {
    const rect = getViewportRect();
    expect(rect).toBeInstanceOf(DOMRect);
    expect(rect.x).toBe(0);
    expect(rect.y).toBe(0);
    expect(rect.width).toBeGreaterThanOrEqual(0);
    expect(rect.height).toBeGreaterThanOrEqual(0);
  });

  it('accepts an explicit document argument', () => {
    const rect = getViewportRect(document);
    expect(rect).toBeInstanceOf(DOMRect);
  });
});

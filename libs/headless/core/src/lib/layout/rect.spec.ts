import { rectFromSize, rectsIntersect } from './rect';

describe('rectFromSize', () => {
  it('creates a Rect with correct fields', () => {
    const r = rectFromSize(10, 20, 100, 50);
    expect(r.left).toBe(10);
    expect(r.top).toBe(20);
    expect(r.width).toBe(100);
    expect(r.height).toBe(50);
    expect(r.right).toBe(110);
    expect(r.bottom).toBe(70);
  });

  it('handles zero dimensions', () => {
    const r = rectFromSize(0, 0, 0, 0);
    expect(r.left).toBe(0);
    expect(r.right).toBe(0);
    expect(r.width).toBe(0);
    expect(r.height).toBe(0);
  });
});

describe('rectsIntersect', () => {
  it('returns true for overlapping rects', () => {
    const a = rectFromSize(0, 0, 100, 100);
    const b = rectFromSize(50, 50, 100, 100);
    expect(rectsIntersect(a, b)).toBe(true);
  });

  it('returns true for rects that share an edge', () => {
    const a = rectFromSize(0, 0, 100, 100);
    const b = rectFromSize(100, 0, 100, 100);
    expect(rectsIntersect(a, b)).toBe(true);
  });

  it('returns false for non-overlapping rects', () => {
    const a = rectFromSize(0, 0, 100, 100);
    const b = rectFromSize(200, 200, 100, 100);
    expect(rectsIntersect(a, b)).toBe(false);
  });

  it('returns true for nested rects', () => {
    const outer = rectFromSize(0, 0, 200, 200);
    const inner = rectFromSize(50, 50, 50, 50);
    expect(rectsIntersect(outer, inner)).toBe(true);
  });

  it('returns true when either rect is undefined', () => {
    const r = rectFromSize(0, 0, 100, 100);
    expect(rectsIntersect(undefined, r)).toBe(true);
    expect(rectsIntersect(r, undefined)).toBe(true);
    expect(rectsIntersect(undefined, undefined)).toBe(true);
  });
});

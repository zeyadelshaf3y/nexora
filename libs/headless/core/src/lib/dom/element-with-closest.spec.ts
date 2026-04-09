import { hasClosest } from './element-with-closest';

describe('hasClosest', () => {
  it('returns true for an Element node', () => {
    const el = document.createElement('div');
    expect(hasClosest(el)).toBe(true);
  });

  it('returns false for a text node', () => {
    const text = document.createTextNode('hello');
    expect(hasClosest(text)).toBe(false);
  });

  it('returns false for null', () => {
    expect(hasClosest(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(hasClosest(undefined)).toBe(false);
  });
});

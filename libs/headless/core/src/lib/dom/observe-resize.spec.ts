import { observeResize } from './observe-resize';

describe('observeResize', () => {
  it('returns a cleanup function', () => {
    const el = document.createElement('div');
    const cleanup = observeResize(el, () => {});
    expect(typeof cleanup).toBe('function');
    cleanup();
  });

  it('returns a no-op cleanup for null element', () => {
    const cleanup = observeResize(null, () => {});
    expect(typeof cleanup).toBe('function');
    cleanup();
  });

  it('returns a no-op cleanup for undefined element', () => {
    const cleanup = observeResize(undefined, () => {});
    expect(typeof cleanup).toBe('function');
    cleanup();
  });
});

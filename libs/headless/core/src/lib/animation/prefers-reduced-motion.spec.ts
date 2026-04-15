import { prefersReducedMotion } from './prefers-reduced-motion';

describe('prefersReducedMotion', () => {
  it('returns a boolean', () => {
    expect(typeof prefersReducedMotion()).toBe('boolean');
  });
});

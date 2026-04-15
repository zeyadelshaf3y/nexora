import { resolveMaybeGetter } from './resolve-maybe-getter';

describe('resolveMaybeGetter', () => {
  it('returns undefined when unset', () => {
    expect(resolveMaybeGetter(undefined)).toBeUndefined();
  });

  it('returns non-function values as-is', () => {
    expect(resolveMaybeGetter(42)).toBe(42);
    expect(resolveMaybeGetter('x')).toBe('x');
    const o = { a: 1 };
    expect(resolveMaybeGetter(o)).toBe(o);
  });

  it('invokes function values', () => {
    expect(resolveMaybeGetter(() => 7)).toBe(7);
    const el = document.createElement('div');
    expect(resolveMaybeGetter(() => el)).toBe(el);
  });
});

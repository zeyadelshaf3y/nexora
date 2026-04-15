import { resolveDropdownOption } from './resolve-option';

describe('resolveDropdownOption', () => {
  it('returns defaultValue when option is undefined', () => {
    expect(resolveDropdownOption(undefined, 'fallback')).toBe('fallback');
    expect(resolveDropdownOption(undefined, 0)).toBe(0);
  });

  it('returns static values as-is', () => {
    expect(resolveDropdownOption('panel', 'default')).toBe('panel');
    expect(resolveDropdownOption(false, true)).toBe(false);
    expect(resolveDropdownOption(0, 10)).toBe(0);
    const o = { a: 1 };
    expect(resolveDropdownOption(o, {})).toBe(o);
  });

  it('invokes getter options', () => {
    expect(resolveDropdownOption(() => 'dynamic', 'default')).toBe('dynamic');
    expect(resolveDropdownOption(() => 42, 0)).toBe(42);
  });
});

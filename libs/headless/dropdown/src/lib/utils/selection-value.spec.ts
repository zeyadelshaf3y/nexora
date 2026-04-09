import {
  getEmptySelectionValue,
  hasSelectionValue,
  normalizeSingleOrMultiValue,
  toSelectedValuesArray,
} from './selection-value';

describe('hasSelectionValue', () => {
  it('returns false for null, undefined, empty array', () => {
    expect(hasSelectionValue<string>(null)).toBe(false);
    expect(hasSelectionValue<string>(undefined)).toBe(false);
    expect(hasSelectionValue<string>([])).toBe(false);
  });

  it('returns true for scalar or non-empty array', () => {
    expect(hasSelectionValue('x')).toBe(true);
    expect(hasSelectionValue(['a'])).toBe(true);
  });
});

describe('toSelectedValuesArray', () => {
  it('multi: returns array or []', () => {
    expect(toSelectedValuesArray<string>(['a', 'b'], true)).toEqual(['a', 'b']);
    expect(toSelectedValuesArray<string>('oops' as never, true)).toEqual([]);
    expect(toSelectedValuesArray<string>(null, true)).toEqual([]);
  });

  it('single: wraps scalar or returns [] when empty', () => {
    expect(toSelectedValuesArray('x', false)).toEqual(['x']);
    expect(toSelectedValuesArray(null, false)).toEqual([]);
    expect(toSelectedValuesArray(undefined, false)).toEqual([]);
  });
});

describe('getEmptySelectionValue', () => {
  it('returns [] in multi mode and null in single mode', () => {
    expect(getEmptySelectionValue<string>(true)).toEqual([]);
    expect(getEmptySelectionValue<string>(false)).toBeNull();
  });
});

describe('normalizeSingleOrMultiValue', () => {
  it('normalizes undefined and null to empty selection for mode', () => {
    expect(normalizeSingleOrMultiValue<string>(undefined, true)).toEqual([]);
    expect(normalizeSingleOrMultiValue<string>(null, true)).toEqual([]);
    expect(normalizeSingleOrMultiValue<string>(undefined, false)).toBeNull();
    expect(normalizeSingleOrMultiValue<string>(null, false)).toBeNull();
  });

  it('returns [] when multi mode receives scalar value', () => {
    expect(normalizeSingleOrMultiValue('apple', true)).toEqual([]);
  });

  it('passes through scalar in single mode and array in both modes', () => {
    expect(normalizeSingleOrMultiValue('apple', false)).toBe('apple');
    expect(normalizeSingleOrMultiValue(['a', 'b'], true)).toEqual(['a', 'b']);
    expect(normalizeSingleOrMultiValue(['a', 'b'], false)).toEqual(['a', 'b']);
  });
});

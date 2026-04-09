import { computeDisplayValue, resolveLabel } from './select-value-utils';

interface Item {
  id: number;
  name: string;
}

const accessors = {
  value: (i: Item) => i.id,
  label: (i: Item) => i.name,
};

describe('resolveLabel', () => {
  it('should use accessor label when available', () => {
    expect(resolveLabel({ id: 1, name: 'Apple' }, accessors)).toBe('Apple');
  });

  it('should fall back to String() when no accessors', () => {
    expect(resolveLabel('hello', undefined)).toBe('hello');
    expect(resolveLabel(42, undefined)).toBe('42');
  });
});

describe('computeDisplayValue', () => {
  it('should return placeholder for null', () => {
    expect(computeDisplayValue(null, accessors, 'Pick...')).toBe('Pick...');
  });

  it('should return placeholder for empty array', () => {
    expect(computeDisplayValue([], accessors, 'Pick...')).toBe('Pick...');
  });

  it('should return label for single item', () => {
    expect(computeDisplayValue({ id: 1, name: 'Apple' }, accessors, 'Pick...')).toBe('Apple');
  });

  it('should return comma-separated labels for array', () => {
    const items = [
      { id: 1, name: 'Apple' },
      { id: 2, name: 'Banana' },
    ];
    expect(computeDisplayValue(items, accessors, 'Pick...')).toBe('Apple, Banana');
  });

  it('should work with primitives when no accessors', () => {
    expect(computeDisplayValue('Mango', undefined, 'Pick...')).toBe('Mango');
  });

  it('should work with primitive array when no accessors', () => {
    expect(computeDisplayValue(['A', 'B'] as string[], undefined, '')).toBe('A, B');
  });
});

import { computeDisplayValue, resolveDisplayLabel } from './display-value';

interface Item {
  id: number;
  name: string;
}

const accessors = {
  label: (i: Item) => i.name,
};

describe('resolveDisplayLabel', () => {
  it('uses accessor label when available', () => {
    expect(resolveDisplayLabel({ id: 1, name: 'Apple' }, accessors)).toBe('Apple');
  });

  it('falls back to String() when no accessors or no label', () => {
    expect(resolveDisplayLabel('hello', undefined)).toBe('hello');
    expect(resolveDisplayLabel(42, undefined)).toBe('42');
  });
});

describe('computeDisplayValue', () => {
  it('returns placeholder for null', () => {
    expect(computeDisplayValue(null, accessors, 'Pick...')).toBe('Pick...');
  });

  it('returns placeholder for empty array', () => {
    expect(computeDisplayValue([], accessors, 'Pick...')).toBe('Pick...');
  });

  it('returns label for single item', () => {
    expect(computeDisplayValue({ id: 1, name: 'Apple' }, accessors, 'Pick...')).toBe('Apple');
  });

  it('returns comma-separated labels for array', () => {
    const items = [
      { id: 1, name: 'Apple' },
      { id: 2, name: 'Banana' },
    ];
    expect(computeDisplayValue(items, accessors, 'Pick...')).toBe('Apple, Banana');
  });

  it('works with primitives when no accessors', () => {
    expect(computeDisplayValue('Mango', undefined, 'Pick...')).toBe('Mango');
  });

  it('works with primitive array when no accessors', () => {
    expect(computeDisplayValue(['A', 'B'] as string[], undefined, '')).toBe('A, B');
  });
});

import { describe, expect, it } from 'vitest';

import { computeVirtualSelectedIndex } from './compute-virtual-selected-index';

describe('computeVirtualSelectedIndex', () => {
  type Row = { id: number; name: string };

  const acc: { value: (o: Row) => number; label: (o: Row) => string } = {
    value: (o) => o.id,
    label: (o) => o.name,
  };

  const items: readonly Row[] = [
    { id: 1, name: 'a' },
    { id: 2, name: 'b' },
    { id: 3, name: 'c' },
  ];

  const trackKeyFn = (o: Row) => o.id;

  it('returns -1 when items is empty', () => {
    expect(
      computeVirtualSelectedIndex({
        items: [],
        value: { id: 1, name: 'a' },
        multi: false,
        accessors: acc,
        trackKeyFn,
      }),
    ).toBe(-1);
  });

  it('single: returns index of selected row', () => {
    expect(
      computeVirtualSelectedIndex({
        items,
        value: items[2],
        multi: false,
        accessors: acc,
        trackKeyFn,
      }),
    ).toBe(2);
  });

  it('single: matches by accessor value when selection is a different object', () => {
    expect(
      computeVirtualSelectedIndex({
        items,
        value: { id: 2, name: 'clone' },
        multi: false,
        accessors: acc,
        trackKeyFn,
      }),
    ).toBe(1);
  });

  it('multi without compareWith: minimum index among selected (track-key path)', () => {
    expect(
      computeVirtualSelectedIndex({
        items,
        value: [
          { id: 3, name: 'c' },
          { id: 1, name: 'a' },
        ],
        multi: true,
        accessors: acc,
        trackKeyFn,
      }),
    ).toBe(0);
  });

  it('multi with compareWith: uses comparator, not track key alone', () => {
    let calls = 0;
    const cmp = (a: unknown, b: unknown): boolean => {
      calls++;
      return (a as Row).name === (b as Row).name;
    };
    const list: Row[] = [
      { id: 1, name: 'a' },
      { id: 2, name: 'b' },
    ];
    expect(
      computeVirtualSelectedIndex({
        items: list,
        value: [{ id: 99, name: 'b' }],
        multi: true,
        compareWith: cmp,
        accessors: acc,
        trackKeyFn,
      }),
    ).toBe(1);
    expect(calls).toBeGreaterThan(0);
  });
});

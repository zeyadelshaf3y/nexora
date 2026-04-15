import { describe, expect, it } from 'vitest';

import {
  computeVirtualListKeyNavigationIndex,
  virtualScrollAlignmentForListboxKey,
} from './virtual-scroll-nav-index';

describe('computeVirtualListKeyNavigationIndex', () => {
  const base = { currentIndex: 3, count: 10, rtl: false };

  it('vertical list: ArrowDown increments', () => {
    expect(
      computeVirtualListKeyNavigationIndex({
        ...base,
        key: 'ArrowDown',
        isVerticalNav: true,
      }),
    ).toBe(4);
  });

  it('vertical list: ArrowUp decrements', () => {
    expect(
      computeVirtualListKeyNavigationIndex({
        ...base,
        key: 'ArrowUp',
        isVerticalNav: true,
      }),
    ).toBe(2);
  });

  it('horizontal LTR: ArrowRight increments', () => {
    expect(
      computeVirtualListKeyNavigationIndex({
        ...base,
        key: 'ArrowRight',
        isVerticalNav: false,
        rtl: false,
      }),
    ).toBe(4);
  });

  it('horizontal RTL: ArrowRight decrements', () => {
    expect(
      computeVirtualListKeyNavigationIndex({
        ...base,
        key: 'ArrowRight',
        isVerticalNav: false,
        rtl: true,
      }),
    ).toBe(2);
  });

  it('Home and End', () => {
    expect(
      computeVirtualListKeyNavigationIndex({
        ...base,
        key: 'Home',
        isVerticalNav: true,
      }),
    ).toBe(0);
    expect(
      computeVirtualListKeyNavigationIndex({
        ...base,
        key: 'End',
        isVerticalNav: true,
      }),
    ).toBe(9);
  });

  it('returns null for unknown keys', () => {
    expect(
      computeVirtualListKeyNavigationIndex({
        ...base,
        key: 'a',
        isVerticalNav: true,
      }),
    ).toBeNull();
  });
});

describe('virtualScrollAlignmentForListboxKey', () => {
  it('maps Home/End and arrows', () => {
    expect(virtualScrollAlignmentForListboxKey('Home')).toBe('start');
    expect(virtualScrollAlignmentForListboxKey('End')).toBe('end');
    expect(virtualScrollAlignmentForListboxKey('ArrowDown')).toBe('nearest');
  });
});

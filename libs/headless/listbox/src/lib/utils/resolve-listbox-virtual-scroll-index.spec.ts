import { describe, expect, it } from 'vitest';

import type { NxrListboxVirtualScrollHandler } from '../types';

import { resolveListboxVirtualScrollIndex } from './resolve-listbox-virtual-scroll-index';

describe('resolveListboxVirtualScrollIndex', () => {
  const sameItem = (a: string, b: string) => a === b;

  it('returns -1 when active is null', () => {
    const handler: NxrListboxVirtualScrollHandler<string> = {
      getCurrentIndex: () => 0,
      getCount: () => 1,
      getItemAtIndex: () => 'a',
      scrollToIndex: () => {},
    };
    expect(resolveListboxVirtualScrollIndex(handler, null, sameItem)).toBe(-1);
  });

  it('returns getCurrentIndex when non-negative', () => {
    const handler: NxrListboxVirtualScrollHandler<string> = {
      getCurrentIndex: () => 3,
      getCount: () => 10,
      getItemAtIndex: () => 'x',
      scrollToIndex: () => {},
    };
    expect(resolveListboxVirtualScrollIndex(handler, 'a', sameItem)).toBe(3);
  });

  it('uses resolveIndexForActive when getCurrentIndex is -1', () => {
    const handler: NxrListboxVirtualScrollHandler<string> = {
      getCurrentIndex: () => -1,
      resolveIndexForActive: (active, eq) => (eq(active, 'b') ? 2 : -1),
      getCount: () => 10,
      getItemAtIndex: () => 'b',
      scrollToIndex: () => {},
    };
    expect(resolveListboxVirtualScrollIndex(handler, 'b', sameItem)).toBe(2);
  });
});

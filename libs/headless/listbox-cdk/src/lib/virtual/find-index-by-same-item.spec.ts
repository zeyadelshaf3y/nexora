import { describe, it, expect } from 'vitest';

import { findIndexBySameItem } from './find-index-by-same-item';

describe('findIndexBySameItem', () => {
  it('returns first matching index by predicate', () => {
    const items = [{ id: 1 }, { id: 2 }];
    expect(findIndexBySameItem(items, { id: 2 }, (a, b) => a.id === b.id)).toBe(1);
  });

  it('returns -1 when no row matches', () => {
    expect(findIndexBySameItem([{ id: 1 }], { id: 9 }, (a, b) => a.id === b.id)).toBe(-1);
  });
});

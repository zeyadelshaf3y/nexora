import { describe, expect, it } from 'vitest';

import { LabelLruCache } from './label-lru-cache';

describe('LabelLruCache', () => {
  it('clears when items reference changes', () => {
    const cache = new LabelLruCache<{ id: number }>(8);
    const a = [{ id: 1 }];
    const b = [{ id: 1 }];
    expect(
      cache.resolve(
        a,
        (x) => `L${x.id}`,
        (x) => x.id,
        a[0],
      ),
    ).toBe('L1');
    expect(
      cache.resolve(
        b,
        (x) => `L${x.id}`,
        (x) => x.id,
        b[0],
      ),
    ).toBe('L1');
  });

  it('evicts oldest entry when over max', () => {
    const cache = new LabelLruCache<number>(3);
    const items = [1, 2, 3, 4];
    const id = (n: number) => n;
    const lab = (n: number) => String(n);
    cache.resolve(items, lab, id, 1);
    cache.resolve(items, lab, id, 2);
    cache.resolve(items, lab, id, 3);
    cache.resolve(items, lab, id, 4);
    expect(cache.resolve(items, lab, id, 1)).toBe('1');
  });

  it('refreshes LRU order on hit', () => {
    const cache = new LabelLruCache<number>(3);
    const items = [1, 2, 3];
    const id = (n: number) => n;
    const lab = (n: number) => String(n);
    cache.resolve(items, lab, id, 1);
    cache.resolve(items, lab, id, 2);
    cache.resolve(items, lab, id, 3);
    cache.resolve(items, lab, id, 1);
    cache.resolve(items, lab, id, 4);
    expect(cache.resolve(items, lab, id, 1)).toBe('1');
    expect(cache.resolve(items, lab, id, 2)).toBe('2');
  });
});

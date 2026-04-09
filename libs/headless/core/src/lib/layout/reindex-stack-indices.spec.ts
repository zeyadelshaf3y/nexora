import { describe, expect, it } from 'vitest';

import { reindexStackIndicesAfterRemoval } from './reindex-stack-indices';

describe('reindexStackIndicesAfterRemoval', () => {
  it('rewrites indices from the splice point onward', () => {
    const list = ['a', 'b', 'c'];
    const map = new Map<string, number>([
      ['a', 0],
      ['b', 1],
      ['c', 2],
    ]);

    list.splice(1, 1);
    map.delete('b');
    reindexStackIndicesAfterRemoval(list, map, 1);

    expect(map.get('a')).toBe(0);
    expect(map.get('c')).toBe(1);
    expect(map.size).toBe(2);
  });

  it('rewrites all indices when removing the first element', () => {
    const list = ['a', 'b'];
    const map = new Map<string, number>([
      ['a', 0],
      ['b', 1],
    ]);

    list.splice(0, 1);
    map.delete('a');
    reindexStackIndicesAfterRemoval(list, map, 0);

    expect(map.get('b')).toBe(0);
    expect(map.size).toBe(1);
  });

  it('clears the last slot when removing the tail', () => {
    const list = ['a', 'b'];
    const map = new Map<string, number>([
      ['a', 0],
      ['b', 1],
    ]);

    list.splice(1, 1);
    map.delete('b');
    reindexStackIndicesAfterRemoval(list, map, 1);

    expect(map.get('a')).toBe(0);
    expect(map.size).toBe(1);
  });
});

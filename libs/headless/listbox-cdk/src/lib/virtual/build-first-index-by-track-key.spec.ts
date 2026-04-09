import { describe, expect, it } from 'vitest';

import { buildFirstIndexByTrackKey } from './build-first-index-by-track-key';

describe('buildFirstIndexByTrackKey', () => {
  it('records the first index for each key', () => {
    const list = [{ id: 1 }, { id: 2 }, { id: 1 }];
    const map = buildFirstIndexByTrackKey(list, (x) => x.id);
    expect(map.get(1)).toBe(0);
    expect(map.get(2)).toBe(1);
  });

  it('returns empty map for empty list', () => {
    expect(buildFirstIndexByTrackKey([], (x: number) => x).size).toBe(0);
  });
});

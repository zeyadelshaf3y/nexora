import { describe, expect, it } from 'vitest';

import { multiSelectionRemovingEquivalentItems } from './combobox-multi-selection';

describe('multiSelectionRemovingEquivalentItems', () => {
  it('removes all entries equal by comparator', () => {
    expect(multiSelectionRemovingEquivalentItems([1, 2, 3], 2, (a, b) => a === b)).toEqual([1, 3]);
  });

  it('removes multiple duplicates', () => {
    expect(multiSelectionRemovingEquivalentItems(['a', 'b', 'a'], 'a', (x, y) => x === y)).toEqual([
      'b',
    ]);
  });
});

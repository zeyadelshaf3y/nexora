import { describe, expect, it } from 'vitest';

import { computeBuiltinVirtualSelectedIndex } from './compute-builtin-virtual-selected-index';

describe('computeBuiltinVirtualSelectedIndex', () => {
  it('returns -1 when virtual panel is off (ignores items)', () => {
    expect(
      computeBuiltinVirtualSelectedIndex({
        useVirtualPanel: false,
        items: ['a', 'b'],
        value: 'a',
        multi: false,
        accessors: undefined,
        trackKeyFn: (x: string) => x,
      }),
    ).toBe(-1);
  });

  it('delegates to computeVirtualSelectedIndex when virtual panel is on', () => {
    expect(
      computeBuiltinVirtualSelectedIndex({
        useVirtualPanel: true,
        items: ['a', 'b', 'c'],
        value: 'b',
        multi: false,
        accessors: undefined,
        trackKeyFn: (x: string) => x,
      }),
    ).toBe(1);
  });

  it('treats null items as empty when virtual panel is on', () => {
    expect(
      computeBuiltinVirtualSelectedIndex({
        useVirtualPanel: true,
        items: null,
        value: 'a',
        multi: false,
        accessors: undefined,
        trackKeyFn: (x: string) => x,
      }),
    ).toBe(-1);
  });
});

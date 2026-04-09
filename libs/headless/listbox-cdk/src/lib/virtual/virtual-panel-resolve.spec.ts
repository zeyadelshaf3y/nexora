import { describe, expect, it } from 'vitest';

import { resolveVirtualLabelFor, resolveVirtualTrackKeyFn } from './virtual-panel-resolve';

describe('resolveVirtualLabelFor', () => {
  it('uses label accessor when present', () => {
    const labelFor = resolveVirtualLabelFor({
      label: (x: { id: number }) => `L${x.id}`,
    });
    expect(labelFor({ id: 1 })).toBe('L1');
  });

  it('falls back to String(item)', () => {
    const labelFor = resolveVirtualLabelFor(undefined);
    expect(labelFor(42)).toBe('42');
  });
});

describe('resolveVirtualTrackKeyFn', () => {
  it('prefers custom trackBy', () => {
    const fn = resolveVirtualTrackKeyFn<{ id: string }>((x) => x.id, { value: (x) => x.id });
    expect(fn({ id: 'a' })).toBe('a');
  });

  it('uses value accessor when no custom trackBy', () => {
    const fn = resolveVirtualTrackKeyFn<{ id: string }>(undefined, {
      value: (x) => x.id,
    });
    expect(fn({ id: 'b' })).toBe('b');
  });

  it('falls back to item reference', () => {
    const item = { id: 1 };
    const fn = resolveVirtualTrackKeyFn<typeof item>(undefined, undefined);
    expect(fn(item)).toBe(item);
  });
});

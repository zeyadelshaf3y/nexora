import { describe, it, expect } from 'vitest';

import { normalizeOption, normalizeOptions } from './normalize-options';

describe('normalizeOption', () => {
  it('treats primitive as value and label when no accessors', () => {
    const result = normalizeOption('hello', null);
    expect(result.item).toBe('hello');
    expect(result.value).toBe('hello');
    expect(result.label).toBe('hello');
    expect(result.disabled).toBe(false);
  });

  it('uses accessors when provided', () => {
    const item = { id: 1, name: 'Alpha', disabled: false };

    const accessors = {
      value: (x: typeof item) => x.id,
      label: (x: typeof item) => x.name,
      disabled: (x: typeof item) => x.disabled,
    };

    const result = normalizeOption(item, accessors);
    expect(result.value).toBe(1);
    expect(result.label).toBe('Alpha');
    expect(result.disabled).toBe(false);
  });

  it('trims label', () => {
    const accessors = { value: (x: string) => x, label: (x: string) => `  ${x}  ` };
    const result = normalizeOption('a', accessors);
    expect(result.label).toBe('a');
  });

  it('treats missing disabled as false', () => {
    const item = { id: 1, name: 'Beta' };
    const accessors = { value: (x: typeof item) => x.id, label: (x: typeof item) => x.name };
    const result = normalizeOption(item, accessors);
    expect(result.disabled).toBe(false);
  });
});

describe('normalizeOptions', () => {
  it('returns normalized array for primitives', () => {
    const result = normalizeOptions(['a', 'b'], null);
    expect(result).toHaveLength(2);
    expect(result[0].item).toBe('a');
    expect(result[0].label).toBe('a');
    expect(result[1].item).toBe('b');
  });
});

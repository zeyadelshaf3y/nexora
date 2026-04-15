import { describe, it, expect } from 'vitest';

import { Typeahead, type TypeaheadOption } from './typeahead';

function opt<T>(item: T, label: string): TypeaheadOption<T> {
  const normalizedLabel = label.toLowerCase();

  return { item, label, normalizedLabel, disabled: false };
}

describe('Typeahead', () => {
  it('uses itemsMatch to resolve current index for equivalent instances', () => {
    const typeahead = new Typeahead<{ id: number; name: string }>();
    const a = { id: 1, name: 'Apple' };
    const registered = { id: 1, name: 'Apple' };
    const options: TypeaheadOption<{ id: number; name: string }>[] = [
      opt(registered, 'Apple'),
      opt({ id: 2, name: 'Banana' }, 'Banana'),
    ];
    const match = (x: { id: number; name: string }, y: { id: number; name: string }) =>
      x.id === y.id;

    const result = typeahead.handleKey('b', options, a, undefined, match);

    expect(result).toEqual(options[1].item);
  });

  it('returns null when there are no options', () => {
    expect(new Typeahead().handleKey('a', [], null)).toBeNull();
  });
});

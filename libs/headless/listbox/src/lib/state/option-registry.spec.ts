import { describe, it, expect } from 'vitest';

import { OptionRegistry } from './option-registry';

describe('OptionRegistry', () => {
  it('registers option and returns stable id', () => {
    const registry = new OptionRegistry<string>();
    const el = document.createElement('div');
    const id = registry.register('a', el, false);
    expect(id).toBeTruthy();
    expect(registry.getId('a')).toBe(id);
    expect(registry.getEntries()).toHaveLength(1);
  });

  it('unregisters option', () => {
    const registry = new OptionRegistry<string>();
    const el = document.createElement('div');
    registry.register('a', el, false);
    registry.unregister('a');
    expect(registry.getId('a')).toBeNull();
    expect(registry.getEntries()).toHaveLength(0);
  });

  it('getEnabledEntries excludes disabled', () => {
    const registry = new OptionRegistry<string>();
    registry.register('a', document.createElement('div'), false);
    registry.register('b', document.createElement('div'), true);
    const enabled = registry.getEnabledEntries();
    expect(enabled).toHaveLength(1);
    expect(enabled[0].item).toBe('a');
  });

  it('getElement returns element for registered item', () => {
    const registry = new OptionRegistry<string>();
    const el = document.createElement('div');
    registry.register('x', el, false);
    expect(registry.getElement('x')).toBe(el);
    expect(registry.getElement('y')).toBeNull();
  });

  it('clear removes all entries', () => {
    const registry = new OptionRegistry<string>();
    registry.register('a', document.createElement('div'), false);
    registry.clear();
    expect(registry.getEntries()).toHaveLength(0);
    expect(registry.getId('a')).toBeNull();
  });

  it('unregister removes entry without corrupting remaining registrations', () => {
    const registry = new OptionRegistry<string>();
    const a = document.createElement('div');
    const b = document.createElement('div');
    const c = document.createElement('div');
    registry.register('x', a, false);
    registry.register('y', b, false);
    registry.register('z', c, false);
    registry.unregister('y');
    expect(registry.getEntries()).toHaveLength(2);
    expect(registry.has('x')).toBe(true);
    expect(registry.has('z')).toBe(true);
    expect(registry.has('y')).toBe(false);
  });

  it('getIdForEquivalentItem resolves id when candidate is not the registered reference', () => {
    type Row = { id: number };
    const registry = new OptionRegistry<Row>();
    const registered = { id: 1 };
    const el = document.createElement('div');
    const stableId = registry.register(registered, el, false);
    const candidate = { id: 1 };

    expect(registry.getId(candidate)).toBeNull();
    expect(registry.getIdForEquivalentItem(candidate, (reg, cand) => reg.id === cand.id)).toBe(
      stableId,
    );
  });

  it('getElementForEquivalentItem resolves element when candidate is not the registered reference', () => {
    type Row = { id: number };
    const registry = new OptionRegistry<Row>();
    const registered = { id: 1 };
    const el = document.createElement('div');
    registry.register(registered, el, false);
    const candidate = { id: 1 };

    expect(registry.getElement(candidate)).toBeNull();
    expect(registry.getElementForEquivalentItem(candidate, (reg, cand) => reg.id === cand.id)).toBe(
      el,
    );
  });

  it('getIdForEquivalentItem resolves id for disabled rows when candidate differs by reference', () => {
    type Row = { id: number };
    const registry = new OptionRegistry<Row>();
    const only = { id: 1 };
    const stableId = registry.register(only, document.createElement('div'), true);
    const candidate = { id: 1 };

    expect(registry.getIdForEquivalentItem(candidate, (reg, cand) => reg.id === cand.id)).toBe(
      stableId,
    );
  });

  it('findEntry returns direct reference before scanning', () => {
    const registry = new OptionRegistry<string>();
    const el = document.createElement('div');
    registry.register('a', el, false);
    const entry = registry.findEntry('a', () => true);
    expect(entry?.item).toBe('a');
  });

  it('hasEquivalent is true when predicate matches a different instance', () => {
    type Row = { id: number };
    const registry = new OptionRegistry<Row>();
    registry.register({ id: 1 }, document.createElement('div'), false);
    expect(registry.has({ id: 1 } as Row)).toBe(false);
    expect(registry.hasEquivalent({ id: 1 }, (reg, cand) => reg.id === cand.id)).toBe(true);
  });

  it('findEntry uses equivalence key index when setEquivalenceKeyFn is set', () => {
    type Row = { id: number; name: string };
    const registry = new OptionRegistry<Row>();
    registry.setEquivalenceKeyFn((r) => r.id);
    const a = document.createElement('div');
    const b = document.createElement('div');
    const container = document.createElement('div');
    container.append(a, b);
    registry.register({ id: 1, name: 'first' }, b, false);
    registry.register({ id: 1, name: 'second' }, a, false);
    const candidate = { id: 1, name: 'other' };
    const entry = registry.findEntry(candidate, (reg, cand) => reg.id === cand.id);
    expect(entry?.element).toBe(a);
  });

  it('findEntry falls back to linear scan when key index row does not satisfy isSameItem', () => {
    type Row = { id: number; tag: string };
    const registry = new OptionRegistry<Row>();
    registry.setEquivalenceKeyFn((r) => r.id);
    const first = document.createElement('div');
    const second = document.createElement('div');
    const container = document.createElement('div');
    container.append(first, second);
    registry.register({ id: 1, tag: 'a' }, first, false);
    registry.register({ id: 1, tag: 'b' }, second, false);
    const candidate = { id: 1, tag: 'b' };
    const entry = registry.findEntry(candidate, (reg, cand) => reg.tag === cand.tag);
    expect(entry?.item.tag).toBe('b');
    expect(entry?.element).toBe(second);
  });

  it('findEntry returns first DOM-ordered match when multiple rows are equivalent', () => {
    type Row = { id: number };
    const container = document.createElement('div');
    const first = document.createElement('div');
    const second = document.createElement('div');
    container.append(first, second);

    const registry = new OptionRegistry<Row>();
    registry.register({ id: 1 }, second, false);
    registry.register({ id: 1 }, first, false);
    const match = registry.findEntry({ id: 1 }, (reg, cand) => reg.id === cand.id);
    expect(match?.element).toBe(first);
  });

  it('getEnabledEntries returns DOM order not registration order', () => {
    const container = document.createElement('div');
    const first = document.createElement('div');
    const second = document.createElement('div');
    const third = document.createElement('div');
    container.append(first, second, third);

    const registry = new OptionRegistry<string>();
    registry.register('third', third, false);
    registry.register('first', first, false);
    registry.register('second', second, false);

    const enabled = registry.getEnabledEntries();
    expect(enabled).toHaveLength(3);
    expect(enabled[0].item).toBe('first');
    expect(enabled[1].item).toBe('second');
    expect(enabled[2].item).toBe('third');
  });
});

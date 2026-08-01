import { describe, expect, it } from 'vitest';

import { OptionRegistry } from './option-registry';
import { ListboxState, type ListboxStateConfig } from './listbox-state';

function createState(overrides?: Partial<ListboxStateConfig<string>>): {
  state: ListboxState<string>;
  registry: OptionRegistry<string>;
} {
  const registry = new OptionRegistry<string>();
  const config: ListboxStateConfig<string> = {
    registry,
    getValue: () => null,
    getMulti: () => false,
    getSelectionMode: () => true,
    getAccessors: () => undefined,
    getCompareWith: () => Object.is,
    getInitialHighlight: () => 'first',
    getWrap: () => false,
    getOrientation: () => 'vertical',
    getDir: () => 'ltr',
    onValueChange: () => undefined,
    onOptionActivated: () => undefined,
    onOptionHighlighted: () => undefined,
    shouldEmitOptionHighlighted: () => false,
    onBoundaryReached: () => undefined,
    ...overrides,
  };

  return { state: new ListboxState(config), registry };
}

describe('ListboxState.reconcileAfterRegistryChange', () => {
  it('seeds initial highlight when options first appear', () => {
    const { state, registry } = createState();
    const root = document.createElement('div');
    document.body.appendChild(root);
    const elA = document.createElement('div');
    const elB = document.createElement('div');
    root.append(elA, elB);

    registry.register('a', elA, false);
    state.reconcileAfterRegistryChange();
    expect(state.activeOption()).toBe('a');

    registry.register('b', elB, false);
    state.reconcileAfterRegistryChange();
    expect(state.activeOption()).toBe('a');

    root.remove();
  });

  it('does not re-seed initial highlight after intentional clear while options remain', () => {
    const { state, registry } = createState();
    registry.register('a', document.createElement('div'), false);
    registry.register('b', document.createElement('div'), false);
    state.reconcileAfterRegistryChange();
    state.setActive('b', 'pointer');

    state.setActive(null, 'pointer');
    state.reconcileAfterRegistryChange();

    expect(state.activeOption()).toBeNull();
  });

  it('re-seeds after registry empties and options return', () => {
    const { state, registry } = createState();
    registry.register('a', document.createElement('div'), false);
    state.reconcileAfterRegistryChange();
    state.setActive(null, 'pointer');

    registry.unregister('a');
    state.reconcileAfterRegistryChange();
    expect(state.activeOption()).toBeNull();

    registry.register('z', document.createElement('div'), false);
    state.reconcileAfterRegistryChange();
    expect(state.activeOption()).toBe('z');
  });

  it('re-seeds when active item leaves the enabled list', () => {
    const { state, registry } = createState();
    registry.register('a', document.createElement('div'), false);
    registry.register('b', document.createElement('div'), false);
    state.reconcileAfterRegistryChange();
    state.setActive('b', 'pointer');

    registry.unregister('b');
    state.reconcileAfterRegistryChange();

    expect(state.activeOption()).toBe('a');
  });

  it('keeps missing active when keepWhenMissing is true', () => {
    const { state, registry } = createState({
      getKeepActiveWhenMissingFromRegistry: () => true,
    });
    registry.register('a', document.createElement('div'), false);
    registry.register('b', document.createElement('div'), false);
    state.reconcileAfterRegistryChange();
    state.setActive('b', 'pointer');

    registry.unregister('b');
    state.reconcileAfterRegistryChange();

    expect(state.activeOption()).toBe('b');
  });
});

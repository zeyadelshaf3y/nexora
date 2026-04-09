import { signal } from '@angular/core';

import { createBuiltinVirtualPanelSignals } from './builtin-virtual-panel-signals';

describe('createBuiltinVirtualPanelSignals', () => {
  it('returns -1 for virtualSelectedIndex when virtual mode is off', () => {
    const virtualScroll = signal(false);
    const virtualItems = signal<readonly string[] | null>(null);
    const { virtualSelectedIndex } = createBuiltinVirtualPanelSignals({
      virtualScroll: () => virtualScroll(),
      virtualItems: () => virtualItems(),
      virtualTrackByKey: () => undefined,
      accessors: () => undefined,
      value: () => null,
      multi: () => false,
      compareWith: () => undefined,
    });
    expect(virtualSelectedIndex()).toBe(-1);
  });

  it('wires virtualSelectedIndex when virtual mode is on', () => {
    const virtualScroll = signal(true);
    const virtualItems = signal<readonly string[] | null>(['a', 'b']);
    const { virtualSelectedIndex } = createBuiltinVirtualPanelSignals({
      virtualScroll: () => virtualScroll(),
      virtualItems: () => virtualItems(),
      virtualTrackByKey: () => undefined,
      accessors: () => undefined,
      value: () => 'b',
      multi: () => false,
      compareWith: () => undefined,
    });
    expect(virtualSelectedIndex()).toBe(1);
  });
});

import { InjectionToken, Injector } from '@angular/core';
import { describe, expect, it } from 'vitest';

import type { ListboxDirective } from '../directives/listbox.directive';
import { NXR_LISTBOX_CONTROLLER } from '../types';

import { createListboxPanelOutletInjector } from './create-listbox-panel-outlet-injector';

describe('createListboxPanelOutletInjector', () => {
  it('provides NXR_LISTBOX_CONTROLLER for the given listbox', () => {
    const listbox = {} as ListboxDirective<unknown>;
    const parent = Injector.create({ providers: [] });
    const child = createListboxPanelOutletInjector(parent, listbox);
    expect(child.get(NXR_LISTBOX_CONTROLLER)).toBe(listbox);
  });

  it('merges additional providers', () => {
    const EXTRA = new InjectionToken<string>('createListboxPanelOutletInjector.extra');
    const listbox = {} as ListboxDirective<unknown>;
    const parent = Injector.create({ providers: [] });
    const child = createListboxPanelOutletInjector(parent, listbox, {
      provide: EXTRA,
      useValue: 'ok',
    });
    expect(child.get(EXTRA)).toBe('ok');
  });
});

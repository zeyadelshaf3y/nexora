import { Injector, type Provider } from '@angular/core';

import type { ListboxDirective } from '../directives/listbox.directive';
import { NXR_LISTBOX_CONTROLLER } from '../types';

/**
 * Injector passed to `ngTemplateOutletInjector` on portaled select/combobox/menu panels so
 * `nxrListboxOption` resolves {@link NXR_LISTBOX_CONTROLLER}. Optional providers cover virtual
 * scroll (`NxrListboxVirtualScrollRegistry`) and similar.
 */
export function createListboxPanelOutletInjector(
  parent: Injector,
  controller: ListboxDirective<unknown>,
  ...additionalProviders: Provider[]
): Injector {
  return Injector.create({
    parent,
    providers: [{ provide: NXR_LISTBOX_CONTROLLER, useValue: controller }, ...additionalProviders],
  });
}

/**
 * Internal context passed from MenuComponent into the portaled MenuPanelHostComponent.
 * Not exported from the public API.
 */

import { InjectionToken, type TemplateRef } from '@angular/core';
import type { ListboxDirective } from '@nexora-ui/listbox';

export interface MenuContext<T = unknown> {
  readonly template: TemplateRef<unknown>;
  readonly showArrow: boolean;
  readonly onOptionActivated: (event: { option: T }) => void;
  readonly onListboxReady: (listbox: ListboxDirective<T>) => void;
}

export const NXR_MENU_CONTEXT = new InjectionToken<MenuContext>('NXR_MENU_CONTEXT');

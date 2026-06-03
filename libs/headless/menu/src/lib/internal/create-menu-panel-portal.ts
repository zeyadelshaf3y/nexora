/**
 * Builds the overlay `ComponentPortal` for `MenuPanelHostComponent` with `NXR_MENU_CONTEXT`.
 */

import { Injector, type ViewContainerRef } from '@angular/core';
import { ComponentPortal } from '@nexora-ui/overlay';

import type { MenuPanelDirective } from '../directives/menu-panel.directive';

import { NXR_MENU_CONTEXT, type MenuContext } from './menu-context';
import { MenuPanelHostComponent } from './menu-panel-host.component';

export function createMenuPanelPortal<T>(args: {
  readonly vcr: ViewContainerRef;
  readonly parentInjector: Injector;
  readonly panel: MenuPanelDirective;
  readonly showArrow: boolean;
  readonly onOptionActivated: MenuContext<T>['onOptionActivated'];
  readonly onListboxReady: MenuContext<T>['onListboxReady'];
}): ComponentPortal<MenuPanelHostComponent> {
  const context: MenuContext<T> = {
    template: args.panel.templateRef,
    showArrow: args.showArrow,
    onOptionActivated: args.onOptionActivated,
    onListboxReady: args.onListboxReady,
  };

  const contextInjector = Injector.create({
    parent: args.parentInjector,
    providers: [{ provide: NXR_MENU_CONTEXT, useValue: context }],
  });

  return new ComponentPortal(MenuPanelHostComponent, args.vcr, contextInjector);
}

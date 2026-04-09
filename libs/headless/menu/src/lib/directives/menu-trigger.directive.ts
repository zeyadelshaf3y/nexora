/**
 * ARIA and interaction bridge for the menu trigger element.
 * Reads state from parent MenuComponent via NXR_MENU; delegates click and keydown.
 */

import { Directive, ElementRef, inject } from '@angular/core';

import { NXR_MENU, type MenuController } from '../tokens/menu-tokens';

@Directive({
  selector: '[nxrMenuTrigger]',
  host: {
    '[attr.aria-haspopup]': '"menu"',
    '[attr.aria-expanded]': 'menu.isOpen()',
    '[attr.aria-controls]': 'menu.listboxId()',
    '[attr.aria-activedescendant]': 'menu.activeOptionId()',
    '[attr.aria-disabled]': 'menu.isDisabled() || null',
    '(click)': 'menu.toggle()',
    '(keydown)': 'menu.handleTriggerKeydown($event)',
  },
})
export class MenuTriggerDirective {
  readonly elementRef = inject(ElementRef<HTMLElement>);
  protected readonly menu = inject<MenuController>(NXR_MENU);
}

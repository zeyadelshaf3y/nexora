/**
 * Thin ARIA / interaction bridge placed on the trigger element.
 *
 * All host bindings read from the parent `SelectComponent` via `NXR_SELECT`.
 * All events delegate to the parent. This directive contains zero logic,
 * zero state, and zero disabled guards — the component owns everything.
 */

import { Directive, ElementRef, inject } from '@angular/core';

import { NXR_SELECT, type SelectController } from '../tokens/select-tokens';

@Directive({
  selector: '[nxrSelectTrigger]',
  host: {
    '[attr.aria-haspopup]': '"listbox"',
    '[attr.aria-expanded]': 'select.isOpen()',
    '[attr.aria-controls]': 'select.listboxId()',
    '[attr.aria-activedescendant]': 'select.activeOptionId()',
    '[attr.aria-disabled]': 'select.isDisabled() || null',
    '[attr.aria-required]': 'select.required() || null',
    '(click)': 'select.toggle()',
    '(keydown)': 'select.handleTriggerKeydown($event)',
  },
})
export class SelectTriggerDirective {
  readonly elementRef = inject(ElementRef<HTMLElement>);
  protected readonly select = inject<SelectController>(NXR_SELECT);
}

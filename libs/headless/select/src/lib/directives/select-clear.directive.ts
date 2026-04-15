/**
 * Place on the element that clears the select (e.g. "Clear" or "×" button).
 * Clears value, notifies CVA, closes the panel if open, and moves focus to the trigger.
 */

import { Directive, inject } from '@angular/core';

import { NXR_SELECT, type SelectController } from '../tokens/select-tokens';

@Directive({
  selector: '[nxrSelectClear]',
  host: {
    '(click)': 'onClick($event)',
    '(keydown)': 'onKeydown($event)',
  },
})
export class SelectClearDirective {
  protected readonly select = inject<SelectController>(NXR_SELECT);

  onClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.clear();
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      this.clear();
    }
  }

  private clear(): void {
    this.select.reset();
    this.select.focusTrigger();
  }
}

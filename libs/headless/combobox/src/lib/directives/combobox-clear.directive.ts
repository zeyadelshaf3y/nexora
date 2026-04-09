/**
 * Place on the element that clears the combobox (e.g. "Clear" button).
 * Clears value and optionally search; notifies CVA; does not change panel open state.
 * Moves focus to the next sibling (e.g. toggle) so the input does not receive focus
 * when the clear button is removed from the DOM.
 */

import { Directive, ElementRef, inject, input } from '@angular/core';

import { NXR_COMBOBOX, type ComboboxController } from '../tokens/combobox-tokens';

@Directive({
  selector: '[nxrComboboxClear]',
  host: {
    '(click)': 'onClick($event)',
  },
})
export class ComboboxClearDirective {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  protected readonly combo = inject<ComboboxController>(NXR_COMBOBOX);

  /** When true, also clear the search query. Default false. */
  readonly clearSearch = input<boolean>(false);

  onClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const nextSibling = this.elementRef.nativeElement.nextElementSibling as HTMLElement | null;
    this.combo.skipNextOpen();
    if (this.clearSearch()) {
      this.combo.clearSearchQuery({ openPanel: false });
    }
    this.combo.reset();
    if (nextSibling?.focus) {
      nextSibling.focus();
    }
  }
}

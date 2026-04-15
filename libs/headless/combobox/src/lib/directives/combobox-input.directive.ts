/**
 * Place on the search input. Syncs with the combobox search model and
 * handles keydown (open on ArrowDown/ArrowUp when closed; when open forwards to listbox).
 * Sets ARIA combobox attributes.
 */

import { Directive, ElementRef, inject } from '@angular/core';

import { shouldOpenPanelOnInputInteraction } from '../internal/combobox-focus-utils';
import { NXR_COMBOBOX, type ComboboxController } from '../tokens/combobox-tokens';

@Directive({
  selector: 'input[nxrComboboxInput], [nxrComboboxInput]',
  host: {
    '[attr.role]': '"combobox"',
    '[attr.aria-expanded]': 'combo.isOpen()',
    '[attr.aria-controls]': 'combo.listboxId()',
    '[attr.aria-activedescendant]': 'combo.activeOptionId()',
    '[attr.aria-autocomplete]': '"list"',
    '[attr.aria-disabled]': 'combo.isDisabled() || null',
    '[attr.aria-required]': 'combo.required() || null',
    '[attr.placeholder]': 'combo.placeholder()',
    '(input)': 'onInput($event)',
    '(focus)': 'onFocus()',
    '(blur)': 'onBlur()',
    '(click)': 'onClick()',
    '(keydown)': 'combo.handleInputKeydown($event)',
  },
})
export class ComboboxInputDirective {
  readonly elementRef = inject(ElementRef<HTMLInputElement>);
  protected readonly combo = inject<ComboboxController>(NXR_COMBOBOX);

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement)?.value ?? '';
    this.combo.setSearchQuery(value);
  }

  onFocus(): void {
    if (
      shouldOpenPanelOnInputInteraction({
        openPanelOnFocus: this.combo.openPanelOnFocus(),
        isDisabled: this.combo.isDisabled(),
        shouldSkipOpen: this.combo.takeFocusRestore(),
      })
    ) {
      void this.combo.open();
    }
  }

  onBlur(): void {
    this.combo.markAsTouched();
    if (!this.combo.isOpen()) {
      this.combo.syncSearchToValue();
    }
  }

  onClick(): void {
    if (
      shouldOpenPanelOnInputInteraction({
        openPanelOnFocus: this.combo.openPanelOnFocus(),
        isDisabled: this.combo.isDisabled(),
        shouldSkipOpen: this.combo.takeFocusRestore(),
        isOpen: this.combo.isOpen(),
      })
    ) {
      void this.combo.open();
    }
  }
}

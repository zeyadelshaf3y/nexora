/**
 * Place on the element that toggles the panel (e.g. button, icon).
 * Click toggles open/close and restores focus to the search input so it does not lose focus.
 * Keydown is handled by the input.
 */

import { Directive, inject } from '@angular/core';

import { queueComboboxInputFocus } from '../internal/combobox-focus-utils';
import { NXR_COMBOBOX, type ComboboxController } from '../tokens/combobox-tokens';

@Directive({
  selector: '[nxrComboboxToggle]',
  host: {
    '(click)': 'onClick()',
  },
})
export class ComboboxToggleDirective {
  protected readonly combo = inject<ComboboxController>(NXR_COMBOBOX);

  onClick(): void {
    if (this.combo.isOpen()) {
      // Prevent focus-driven immediate re-open after toggle-close.
      this.combo.skipNextOpen();
    }
    this.combo.toggle();
    queueComboboxInputFocus(() => this.combo.focusInput());
  }
}

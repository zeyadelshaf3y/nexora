/**
 * Combobox option — hostDirectives wrapper over ListboxOptionDirective.
 * All behavior from listbox; input remapped to nxrListboxOption.
 */

import { Directive } from '@angular/core';
import { ListboxOptionDirective } from '@nexora-ui/listbox';

@Directive({
  selector: '[nxrComboboxOption]',
  hostDirectives: [
    {
      directive: ListboxOptionDirective,
      inputs: ['nxrListboxOption: nxrComboboxOption', 'nxrListboxOption: value'],
    },
  ],
})
export class ComboboxOptionDirective {}

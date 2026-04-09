/**
 * Combobox group — hostDirectives wrapper over ListboxGroupDirective.
 */

import { Directive } from '@angular/core';
import { ListboxGroupDirective } from '@nexora-ui/listbox';

@Directive({
  selector: '[nxrComboboxGroup]',
  hostDirectives: [
    {
      directive: ListboxGroupDirective,
      inputs: ['nxrListboxGroup: nxrComboboxGroup'],
    },
  ],
})
export class ComboboxGroupDirective {}

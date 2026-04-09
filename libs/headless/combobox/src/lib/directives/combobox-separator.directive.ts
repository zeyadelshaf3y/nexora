/**
 * Combobox separator — hostDirectives wrapper over ListboxSeparatorDirective.
 */

import { Directive } from '@angular/core';
import { ListboxSeparatorDirective } from '@nexora-ui/listbox';

@Directive({
  selector: '[nxrComboboxSeparator]',
  hostDirectives: [{ directive: ListboxSeparatorDirective }],
})
export class ComboboxSeparatorDirective {}

/**
 * Combobox group label — hostDirectives wrapper over ListboxGroupLabelDirective.
 */

import { Directive } from '@angular/core';
import { ListboxGroupLabelDirective } from '@nexora-ui/listbox';

@Directive({
  selector: '[nxrComboboxGroupLabel]',
  hostDirectives: [ListboxGroupLabelDirective],
})
export class ComboboxGroupLabelDirective {}

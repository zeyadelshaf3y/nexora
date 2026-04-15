/**
 * Menu item — thin hostDirectives wrapper over ListboxOptionDirective.
 * Binds the option value for activation; listbox provides ARIA and click/Enter behavior.
 */

import { Directive } from '@angular/core';
import { ListboxOptionDirective } from '@nexora-ui/listbox';

@Directive({
  selector: '[nxrMenuItem]',
  hostDirectives: [
    {
      directive: ListboxOptionDirective,
      inputs: ['nxrListboxOption: nxrMenuItem'],
    },
  ],
})
export class MenuItemDirective {}

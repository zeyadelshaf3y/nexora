/**
 * Select option — thin `hostDirectives` wrapper over `ListboxOptionDirective`.
 *
 * Zero code duplication: all option behavior (ARIA, click, registration)
 * comes from the composed listbox directive. The `[nxrSelectOption]` input
 * is remapped to `[nxrListboxOption]` internally.
 */

import { Directive } from '@angular/core';
import { ListboxOptionDirective } from '@nexora-ui/listbox';

@Directive({
  selector: '[nxrSelectOption]',
  hostDirectives: [
    {
      directive: ListboxOptionDirective,
      inputs: ['nxrListboxOption: nxrSelectOption'],
    },
  ],
})
export class SelectOptionDirective {}

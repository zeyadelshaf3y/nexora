/**
 * Menu group — thin hostDirectives wrapper over ListboxGroupDirective.
 * Sets role="group" and aria-labelledby. Prefer nxrMenuGroupLabel on the label element.
 */

import { Directive } from '@angular/core';
import { ListboxGroupDirective } from '@nexora-ui/listbox';

@Directive({
  selector: '[nxrMenuGroup]',
  hostDirectives: [
    {
      directive: ListboxGroupDirective,
      inputs: ['nxrListboxGroup: nxrMenuGroup'],
    },
  ],
})
export class MenuGroupDirective {}

/**
 * Place on the group label element inside nxrMenuGroup.
 * Provides a stable id so the group gets aria-labelledby automatically.
 */

import { Directive } from '@angular/core';
import { ListboxGroupLabelDirective } from '@nexora-ui/listbox';

@Directive({
  selector: '[nxrMenuGroupLabel]',
  hostDirectives: [{ directive: ListboxGroupLabelDirective }],
})
export class MenuGroupLabelDirective {}

/**
 * Select group label — thin hostDirectives wrapper over ListboxGroupLabelDirective.
 * Use inside nxrSelectGroup so the group gets automatic aria-labelledby without manual id wiring.
 */

import { Directive } from '@angular/core';
import { ListboxGroupLabelDirective } from '@nexora-ui/listbox';

@Directive({
  selector: '[nxrSelectGroupLabel]',
  hostDirectives: [{ directive: ListboxGroupLabelDirective }],
})
export class SelectGroupLabelDirective {}

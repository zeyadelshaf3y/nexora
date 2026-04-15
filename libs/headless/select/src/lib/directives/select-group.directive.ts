/**
 * Select group — thin `hostDirectives` wrapper over `ListboxGroupDirective`.
 *
 * Sets `role="group"` and `aria-labelledby` on the host. Options inside
 * register with the parent listbox as usual.
 *
 * Prefer placing `nxrSelectGroupLabel` on the group label element; the listbox
 * layer will discover it and wire aria-labelledby automatically. The string
 * input `[nxrSelectGroup]="id"` is optional for legacy manual label-id wiring when
 * you cannot use `nxrSelectGroupLabel`.
 */

import { Directive } from '@angular/core';
import { ListboxGroupDirective } from '@nexora-ui/listbox';

@Directive({
  selector: '[nxrSelectGroup]',
  hostDirectives: [
    {
      directive: ListboxGroupDirective,
      inputs: ['nxrListboxGroup: nxrSelectGroup'],
    },
  ],
})
export class SelectGroupDirective {}

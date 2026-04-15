/**
 * Listbox group label: provides a stable id for the host element so the parent
 * group can reference it via aria-labelledby. Purely semantic/presentational.
 */

import { Directive } from '@angular/core';
import { idFactory } from '@nexora-ui/core';

@Directive({
  selector: '[nxrListboxGroupLabel]',
  host: {
    '[attr.id]': 'labelId',
  },
})
export class ListboxGroupLabelDirective {
  /** Stable id for this label; used by the parent ListboxGroupDirective for aria-labelledby. */
  readonly labelId = idFactory('nxr-listbox-group-label')();
}

/**
 * Listbox separator: presentational/a11y only. Sets role="separator".
 * Keyboard skips; not selectable.
 */

import { Directive } from '@angular/core';

/** Presentational/a11y only; host bindings set role="separator". */
@Directive({
  selector: '[nxrListboxSeparator]',
  host: {
    '[attr.role]': '"separator"',
  },
})
// Directive exists for selector and host bindings only
export class ListboxSeparatorDirective {}

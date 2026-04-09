/**
 * Select separator — thin `hostDirectives` wrapper over `ListboxSeparatorDirective`.
 *
 * Sets `role="separator"` on the host. Keyboard skips it; not selectable.
 */

import { Directive } from '@angular/core';
import { ListboxSeparatorDirective } from '@nexora-ui/listbox';

@Directive({
  selector: '[nxrSelectSeparator]',
  hostDirectives: [{ directive: ListboxSeparatorDirective }],
})
export class SelectSeparatorDirective {}

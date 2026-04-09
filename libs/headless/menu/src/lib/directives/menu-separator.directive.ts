/**
 * Menu separator — thin hostDirectives wrapper over ListboxSeparatorDirective.
 * Sets role="separator"; keyboard skips it.
 */

import { Directive } from '@angular/core';
import { ListboxSeparatorDirective } from '@nexora-ui/listbox';

@Directive({
  selector: '[nxrMenuSeparator]',
  hostDirectives: [{ directive: ListboxSeparatorDirective }],
})
export class MenuSeparatorDirective {}

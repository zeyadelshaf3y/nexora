/**
 * Marks the combobox panel `<ng-template>`; the root reads `templateRef` for the overlay.
 * On `<ng-template>`, use `#name="nxrComboboxPanel"` so `viewChild` targets this directive, not `TemplateRef`.
 */

import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[nxrComboboxPanel]',
  exportAs: 'nxrComboboxPanel',
})
export class ComboboxPanelDirective {
  readonly templateRef = inject(TemplateRef);
}

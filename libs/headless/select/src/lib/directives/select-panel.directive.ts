/**
 * Marks the select panel `<ng-template>`; the root reads `templateRef` for the overlay.
 * On `<ng-template>`, use `#name="nxrSelectPanel"` so `viewChild` targets this directive, not `TemplateRef`.
 */

import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[nxrSelectPanel]',
  exportAs: 'nxrSelectPanel',
})
export class SelectPanelDirective {
  readonly templateRef = inject(TemplateRef);
}

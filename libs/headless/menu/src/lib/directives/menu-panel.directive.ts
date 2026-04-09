/**
 * Marker directive on an `<ng-template>` that identifies the menu panel content.
 * MenuComponent uses it to get the TemplateRef rendered inside the overlay.
 */

import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({ selector: '[nxrMenuPanel]' })
export class MenuPanelDirective {
  readonly templateRef = inject(TemplateRef);
}

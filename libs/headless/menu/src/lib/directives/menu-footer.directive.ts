/**
 * Marker directive on an `<ng-template>` that identifies the menu panel footer.
 * Rendered below the scrollable item area, outside the scroll container.
 */

import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({ selector: '[nxrMenuFooter]' })
export class MenuFooterDirective {
  readonly templateRef = inject(TemplateRef);
}

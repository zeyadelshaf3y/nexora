/**
 * Marker directive on an `<ng-template>` that identifies the menu panel header.
 * Rendered above the scrollable item area, outside the scroll container.
 */

import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({ selector: '[nxrMenuHeader]' })
export class MenuHeaderDirective {
  readonly templateRef = inject(TemplateRef);
}

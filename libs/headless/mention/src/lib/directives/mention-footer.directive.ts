/**
 * Marker directive on an `<ng-template>` that identifies the mention panel footer.
 * Rendered below the scrollable panel area, outside the scroll container.
 *
 * Only used on the non-virtual panel path. Not applicable to custom CDK virtual panels.
 */

import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({ selector: '[nxrMentionFooter]' })
export class MentionFooterDirective {
  readonly templateRef = inject(TemplateRef);
}

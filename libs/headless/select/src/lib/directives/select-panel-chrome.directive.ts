/**
 * Marker directives for optional fixed header and footer in the select panel.
 * Used with the non-virtual panel path; rendered outside the scrollable listbox.
 *
 * For the built-in virtual panel path use `SelectVirtualHeaderTemplateDirective` /
 * `SelectVirtualFooterTemplateDirective` instead.
 */

import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({ selector: '[nxrSelectHeader]' })
export class SelectHeaderDirective {
  readonly templateRef = inject(TemplateRef);
}

@Directive({ selector: '[nxrSelectFooter]' })
export class SelectFooterDirective {
  readonly templateRef = inject(TemplateRef);
}

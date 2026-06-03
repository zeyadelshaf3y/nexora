/**
 * Marker directives for optional fixed header and footer in the combobox panel.
 * Used with the non-virtual panel path; rendered outside the scrollable listbox.
 *
 * For the built-in virtual panel path use `ComboboxVirtualHeaderTemplateDirective` /
 * `ComboboxVirtualFooterTemplateDirective` instead.
 */

import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({ selector: '[nxrComboboxHeader]' })
export class ComboboxHeaderDirective {
  readonly templateRef = inject(TemplateRef);
}

@Directive({ selector: '[nxrComboboxFooter]' })
export class ComboboxFooterDirective {
  readonly templateRef = inject(TemplateRef);
}

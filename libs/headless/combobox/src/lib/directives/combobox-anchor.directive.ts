/**
 * Optional anchor directive. When present, the overlay panel is positioned
 * relative to this element instead of the host. Use e.g. on a wrapper div
 * that contains only the input and toggle.
 */

import { Directive, ElementRef, inject } from '@angular/core';

@Directive({ selector: '[nxrComboboxAnchor]' })
export class ComboboxAnchorDirective {
  readonly elementRef = inject(ElementRef<HTMLElement>);
}

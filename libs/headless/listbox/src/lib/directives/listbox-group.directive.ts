/**
 * Listbox group: presentational/a11y only. Sets role="group" and aria-labelledby.
 * Options inside register as usual; no interaction with keyboard or selection.
 * Prefer nxrListboxGroupLabel as child for automatic id; nxrListboxGroup input is legacy fallback.
 */

import { Directive, computed, contentChild, input } from '@angular/core';

import { ListboxGroupLabelDirective } from './listbox-group-label.directive';

@Directive({
  selector: '[nxrListboxGroup]',
  host: {
    '[attr.role]': '"group"',
    '[attr.aria-labelledby]': 'resolvedLabelId()',
  },
})
export class ListboxGroupDirective {
  /** Discovered label directive; its id is used for aria-labelledby when present. */
  private readonly labelRef = contentChild(ListboxGroupLabelDirective);

  /**
   * Legacy: id of the label element (e.g. from [id] on a span).
   * Optional when using nxrListboxGroupLabel; used as fallback when no label directive is present.
   */
  readonly nxrListboxGroup = input<string | undefined>(undefined);

  /** Resolved id for aria-labelledby: label directive id wins, then manual input, then undefined. */
  readonly resolvedLabelId = computed(() => {
    const label = this.labelRef();
    if (label) return label.labelId;

    return this.nxrListboxGroup() ?? undefined;
  });
}

import { Directive, input } from '@angular/core';

import type { CloseReason } from '../ref/close-reason';

import { BaseCloseOverlayDirective } from './base-close-overlay.directive';

/**
 * Place on a button inside drawer content to close the drawer on click.
 * Optionally pass a {@link CloseReason}; defaults to `'programmatic'`.
 *
 * Works with both template and component content — no injection tokens needed.
 *
 * @example
 * ```html
 * <button nxrDrawerClose>Close</button>
 * ```
 */
@Directive({
  selector: '[nxrDrawerClose]',
  standalone: true,
})
export class CloseDrawerDirective extends BaseCloseOverlayDirective {
  readonly nxrDrawerClose = input<CloseReason | '' | undefined>(undefined);

  protected override getCloseReason(): CloseReason | '' | undefined {
    return this.nxrDrawerClose();
  }
}

import { Directive, input } from '@angular/core';

import type { CloseReason } from '../ref/close-reason';

import { BaseCloseOverlayDirective } from './base-close-overlay.directive';

/**
 * Place on a button inside dialog content to close the dialog on click.
 * Optionally pass a {@link CloseReason}; defaults to `'programmatic'`.
 *
 * Works with both template and component content — no injection tokens needed.
 *
 * @example
 * ```html
 * <button nxrDialogClose>Cancel</button>
 * <button [nxrDialogClose]="'programmatic'">Done</button>
 * ```
 */
@Directive({
  selector: '[nxrDialogClose]',
  standalone: true,
})
export class CloseDialogDirective extends BaseCloseOverlayDirective {
  readonly nxrDialogClose = input<CloseReason | '' | undefined>(undefined);

  protected override getCloseReason(): CloseReason | '' | undefined {
    return this.nxrDialogClose();
  }
}

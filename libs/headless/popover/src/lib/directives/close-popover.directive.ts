import { Directive, input } from '@angular/core';
import { type CloseReason } from '@nexora-ui/overlay';
import { BaseCloseOverlayDirective } from '@nexora-ui/overlay/internal';

/**
 * Place on a button inside popover content to close the popover on click.
 * Optionally pass a {@link CloseReason}; defaults to `'programmatic'`.
 *
 * Works with both template and component content — no injection tokens needed.
 *
 * @example
 * ```html
 * <button nxrPopoverClose>Close</button>
 * ```
 */
@Directive({
  selector: '[nxrPopoverClose]',
  standalone: true,
})
export class ClosePopoverDirective extends BaseCloseOverlayDirective {
  readonly nxrPopoverClose = input<CloseReason | '' | undefined>(undefined);

  protected override getCloseReason(): CloseReason | '' | undefined {
    return this.nxrPopoverClose();
  }
}

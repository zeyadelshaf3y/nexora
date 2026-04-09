import { Directive, ElementRef, inject, input, HostListener } from '@angular/core';
import { closestCloseableRef } from '@nexora-ui/overlay/internal';

/**
 * Place on a button inside snackbar content to close the snackbar on click.
 * Optionally pass a value; it is emitted on `SnackbarRef.afterClosed()`.
 *
 * Uses the shared pane-ref registry — no injection tokens needed.
 *
 * @example
 * ```html
 * <button nxrSnackbarClose>Dismiss</button>
 * <button [nxrSnackbarClose]="'undo'">Undo</button>
 * ```
 */
@Directive({
  selector: '[nxrSnackbarClose]',
  standalone: true,
})
export class CloseSnackbarDirective {
  private readonly el = inject(ElementRef<HTMLElement>);

  /** Value to pass to `close(value)`; emitted on `afterClosed()`. Omit for `undefined`. */
  readonly nxrSnackbarClose = input<unknown>(undefined);

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    const ref = closestCloseableRef(this.el.nativeElement);

    if (!ref) return;

    const hostEl = this.el.nativeElement;
    if (hostEl instanceof HTMLAnchorElement && hostEl.hasAttribute('href')) {
      event.preventDefault();
      event.stopPropagation();
    }
    ref.close(this.nxrSnackbarClose());
  }
}

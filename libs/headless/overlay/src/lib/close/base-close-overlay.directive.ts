/**
 * Shared base for overlay close directives (dialog, drawer, popover).
 * Encapsulates click handling; subclasses only define selector and input binding.
 * @internal
 */

import { Directive, ElementRef, HostListener, inject } from '@angular/core';

import { CLOSE_REASON_PROGRAMMATIC, type CloseReason } from '../ref/close-reason';

import { handleCloseClick } from './closeable-ref-registry';

@Directive({ standalone: true })
export abstract class BaseCloseOverlayDirective {
  protected readonly el = inject(ElementRef<HTMLElement>);

  /** Subclasses return the close reason from their input (e.g. nxrDialogClose()). */
  protected abstract getCloseReason(): CloseReason | '' | undefined;

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    const reason = this.getCloseReason();

    handleCloseClick(
      this.el.nativeElement,
      reason === '' || reason == null ? CLOSE_REASON_PROGRAMMATIC : reason,
      event,
    );
  }
}

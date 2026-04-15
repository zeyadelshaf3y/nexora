import {
  Directive,
  ElementRef,
  inject,
  input,
  output,
  signal,
  type OnDestroy,
  type TemplateRef,
  ViewContainerRef,
} from '@angular/core';

import { CLOSE_REASON_PROGRAMMATIC, type CloseReason } from '../ref/close-reason';
import type { OverlayRef } from '../ref/overlay-ref';
import { DialogService } from '../services/dialog.service';
import { subscribeOnceAfterClosed } from '../utils/subscribe-once-after-closed';

/**
 * Directive that opens a centered dialog overlay with backdrop on click.
 * Pass the panel content as a `TemplateRef`. Close via Escape, backdrop click, or programmatically.
 *
 * @example
 * ```html
 * <button [nxrOverlay]="dialogTpl">Open Dialog</button>
 * <ng-template #dialogTpl>Dialog content</ng-template>
 * ```
 */
@Directive({
  selector: '[nxrOverlay]',
  standalone: true,
  exportAs: 'nxrOverlay',
  host: {
    '(click)': 'toggle($event)',
    '[attr.aria-expanded]': 'isOpen()',
    '[attr.aria-haspopup]': '"dialog"',
  },
})
export class OverlayTriggerDirective implements OnDestroy {
  private readonly dialog = inject(DialogService);
  private readonly vcr = inject(ViewContainerRef);
  private readonly host = inject(ElementRef<HTMLElement>);

  /** Template for the overlay panel content. */
  readonly nxrOverlay = input.required<TemplateRef<unknown>>();

  /** When `true`, the trigger does not open the overlay. Default: `false`. */
  readonly nxrOverlayDisabled = input<boolean>(false);

  /** Max width of the pane (e.g. `'min(700px, 90vw)'`). */
  readonly nxrOverlayMaxWidth = input<string | undefined>(undefined);

  /** Max height of the pane (e.g. `'90vh'`). */
  readonly nxrOverlayMaxHeight = input<string | undefined>(undefined);

  /** CSS class(es) for the overlay pane. Use for styling and animations (e.g. `demo-dialog-pane`). */
  readonly nxrOverlayPanelClass = input<string | string[] | undefined>(undefined);

  /** Emitted when the overlay has finished opening. */
  readonly nxrOverlayOpened = output();

  /** Emitted when the overlay has closed (with the close reason). */
  readonly nxrOverlayClosed = output<CloseReason>();

  /** Whether the overlay is currently open. */
  readonly isOpen = signal(false);

  private ref: OverlayRef | null = null;
  private afterClosedSub: { unsubscribe: () => void } | null = null;
  private destroyed = false;

  toggle(event: Event): void {
    if (this.nxrOverlayDisabled()) return;
    event.preventDefault();
    event.stopPropagation();

    if (this.ref) {
      this.ref.close(CLOSE_REASON_PROGRAMMATIC);

      return;
    }

    this.open();
  }

  /** Opens the overlay programmatically. */
  open(): void {
    if (this.destroyed || this.ref) return;

    const template = this.nxrOverlay();
    const maxWidth = this.nxrOverlayMaxWidth();
    const maxHeight = this.nxrOverlayMaxHeight();
    const panelClass = this.nxrOverlayPanelClass();

    this.dialog
      .open(template, {
        viewContainerRef: this.vcr,
        maxWidth,
        maxHeight,
        transformOriginElement: this.host.nativeElement,
        ...(panelClass != null && { panelClass }),
      })
      .then((ref) => {
        if (this.destroyed) {
          ref?.dispose?.();

          return;
        }
        if (!ref) return;
        if (this.ref) {
          ref.dispose?.();

          return;
        }
        this.ref = ref;
        this.isOpen.set(true);
        this.nxrOverlayOpened.emit();
        this.afterClosedSub?.unsubscribe();

        this.afterClosedSub = subscribeOnceAfterClosed(ref, (reason) => {
          this.afterClosedSub = null;
          this.ref = null;
          this.isOpen.set(false);
          this.nxrOverlayClosed.emit(
            (reason as CloseReason | undefined) ?? CLOSE_REASON_PROGRAMMATIC,
          );
        });
      });
  }

  /** Closes the overlay if open. */
  close(): void {
    this.ref?.close(CLOSE_REASON_PROGRAMMATIC);
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.afterClosedSub?.unsubscribe();
    this.afterClosedSub = null;
    this.ref?.dispose();
    this.ref = null;
    this.isOpen.set(false);
  }
}

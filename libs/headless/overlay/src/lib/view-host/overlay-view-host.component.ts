import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

/**
 * Internal component used to provide a ViewContainerRef when open() is called
 * without viewContainerRef and without a default. Created once and attached to
 * the overlay container; its ViewContainerRef is used for TemplatePortal / ComponentPortal.
 * @internal
 */
@Component({
  selector: 'nxr-overlay-view-host',
  standalone: true,
  template: '',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'nxr-overlay-view-host',
    '[style.display]': '"none"',
  },
})
// Angular host component; class required for DI
export class OverlayViewHostComponent {}

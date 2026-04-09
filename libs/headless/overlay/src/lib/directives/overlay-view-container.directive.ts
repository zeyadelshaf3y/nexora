import { Directive, inject, type OnDestroy, ViewContainerRef } from '@angular/core';

import { OverlayService } from '../services/overlay.service';

/**
 * Sets this element's `ViewContainerRef` as the default for `OverlayService.open()`.
 * Optional: if not used, an internal host is created automatically. Use when you need
 * overlay content created in a specific injector hierarchy (e.g. for DI).
 *
 * @example
 * ```html
 * <div nxrOverlayViewContainer>
 *   <!-- overlays opened from here will use this element's injector -->
 * </div>
 * ```
 */
@Directive({
  selector: '[nxrOverlayViewContainer]',
  standalone: true,
})
export class OverlayViewContainerDirective implements OnDestroy {
  private readonly overlay = inject(OverlayService);
  private readonly vcr = inject(ViewContainerRef);

  constructor() {
    this.overlay.setDefaultViewContainerRef(this.vcr);
  }

  ngOnDestroy(): void {
    this.overlay.setDefaultViewContainerRef(null);
  }
}

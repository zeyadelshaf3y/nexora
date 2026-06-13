import { InjectionToken } from '@angular/core';

import type { OverlayRef } from './overlay-ref';

/**
 * Injection token for the current {@link OverlayRef}, auto-provided to **component** content
 * opened via {@link DialogService}, {@link DrawerService}, or {@link OverlayService.open}.
 *
 * Inject it inside the opened component to control the overlay it lives in — resize it,
 * register an extra close guard, read its pane element, or close it programmatically:
 *
 * ```ts
 * private readonly overlay = inject(OVERLAY_REF);
 *
 * expand(): void {
 *   this.overlay.updateSize({ height: '600px', maxHeight: '90vh' });
 * }
 * ```
 *
 * Not provided for template content (templates already capture the opener's injector and can
 * use the `nxrDialogClose` / `nxrDrawerClose` directives). When opening with a custom `injector`,
 * that injector becomes the parent, so this token still resolves.
 */
export const OVERLAY_REF = new InjectionToken<OverlayRef>('OVERLAY_REF');

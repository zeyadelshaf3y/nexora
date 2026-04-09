import { InjectionToken } from '@angular/core';

import { BASE_Z_INDEX } from './constants';

/**
 * Base z-index for the overlay stack. All overlays (dialog, drawer, popover, tooltip, snackbar)
 * are assigned `baseZIndex + stackOrder`, so the topmost overlay has the highest z-index.
 *
 * Use this when your app chrome (header, sidebar, etc.) uses fixed z-index values and overlays
 * must render above them. For example, if the header uses z-index 1000 and the sidebar 10001,
 * provide a base of 10002 or higher:
 *
 * ```ts
 * // In app.config.ts or your root module
 * import { OVERLAY_BASE_Z_INDEX } from '@nexora-ui/overlay';
 *
 * providers: [
 *   { provide: OVERLAY_BASE_Z_INDEX, useValue: 10002 },
 * ]
 * ```
 *
 * If not provided, defaults to {@link BASE_Z_INDEX} (1000).
 */
export const OVERLAY_BASE_Z_INDEX = new InjectionToken<number>('OVERLAY_BASE_Z_INDEX', {
  providedIn: 'root',
  factory: () => BASE_Z_INDEX,
});

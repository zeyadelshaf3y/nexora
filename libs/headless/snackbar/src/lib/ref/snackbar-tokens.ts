import { InjectionToken } from '@angular/core';
import type { TemplateRef } from '@angular/core';

import type { SnackbarRef } from './snackbar-ref';

/**
 * Injection token for the current snackbar ref. Injected inside snackbar content (component
 * or template with host) so the close directive or user code can call ref.close(value).
 */
export const SNACKBAR_REF = new InjectionToken<SnackbarRef>('SNACKBAR_REF');

/**
 * Token for the template when opening with a TemplateRef. Used by SnackbarHostComponent.
 * @internal
 */
export const SNACKBAR_CONTENT_TEMPLATE = new InjectionToken<TemplateRef<unknown>>(
  'SNACKBAR_CONTENT_TEMPLATE',
);

/**
 * Token for the template context (data) when opening with a TemplateRef.
 * @internal
 */
export const SNACKBAR_CONTENT_CONTEXT = new InjectionToken<Record<string, unknown>>(
  'SNACKBAR_CONTENT_CONTEXT',
);

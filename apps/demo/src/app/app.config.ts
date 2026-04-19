import { type ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { OVERLAY_BASE_Z_INDEX } from '@nexora-ui/overlay';

import { APP_ROUTES } from './app.routes';
import { provideDemoSnackbarDefaults } from './core/demo-snackbar-defaults';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(APP_ROUTES, withComponentInputBinding(), withViewTransitions()),
    { provide: OVERLAY_BASE_Z_INDEX, useValue: 10002 },
    provideDemoSnackbarDefaults(),
  ],
};

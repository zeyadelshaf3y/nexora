import type { DemoDefaultSnackbarComponent } from './demo-snackbar-defaults';

declare module '@nexora-ui/snackbar' {
  interface SnackbarNotifyComponentMap {
    demoApp: DemoDefaultSnackbarComponent;
  }
}

export { CloseSnackbarDirective } from './lib/directives/close-snackbar.directive';
export type { SnackbarAutoCloseState, SnackbarRef } from './lib/ref/snackbar-ref';
export type { SnackbarOpenOptions } from './lib/options/snackbar-open-options';
export type {
  SnackbarDefaultNotifyComponent,
  SnackbarDefaultsConfig,
  SnackbarNotifyComponentMap,
  SnackbarNotifyOptions,
} from './lib/options/snackbar-defaults.config';
export { provideSnackbarDefaults, SNACKBAR_DEFAULTS } from './lib/options/snackbar-defaults.config';
export type { SnackbarPlacement } from './lib/position/snackbar-placement';
export {
  SnackbarService,
  DEFAULT_SNACKBAR_DURATION,
  DEFAULT_SNACKBAR_PLACEMENT,
} from './lib/service/snackbar.service';
export {
  SnackbarPositionStrategy,
  DEFAULT_SNACKBAR_PADDING,
  DEFAULT_SNACKBAR_STACK_GAP,
} from './lib/position/snackbar-position-strategy';
export { SNACKBAR_REF } from './lib/ref/snackbar-tokens';

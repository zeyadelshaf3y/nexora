import type { Provider, Type } from '@angular/core';
import { InjectionToken } from '@angular/core';

import type { SnackbarOpenOptionsForComponent } from './snackbar-open-options';

/**
 * Global default component type for `SnackbarService.notify(...)`.
 *
 * Consumers can narrow this via module augmentation:
 * `declare module '@nexora-ui/snackbar' { interface SnackbarNotifyComponentMap { appSnackbar: AppSnackbarComponent; } }`
 */
export interface SnackbarNotifyComponentMap {
  /** Internal brand key so the augmentable interface is not structurally empty. */
  readonly __snackbarNotifyComponentMapBrand?: never;
}

type SnackbarNotifyComponentMapKeys = Exclude<
  keyof SnackbarNotifyComponentMap,
  '__snackbarNotifyComponentMapBrand'
>;

export type SnackbarDefaultNotifyComponent = [SnackbarNotifyComponentMapKeys] extends [never]
  ? unknown
  : SnackbarNotifyComponentMap[SnackbarNotifyComponentMapKeys];

/** Options accepted by `SnackbarService.notify(...)` for default components. */
export type SnackbarNotifyOptions<TComponent = SnackbarDefaultNotifyComponent> =
  SnackbarOpenOptionsForComponent<TComponent>;

export interface SnackbarDefaultsConfig<TComponent = unknown> {
  /**
   * Default component used by `SnackbarService.notify(...)`.
   */
  readonly component: Type<TComponent>;
  /**
   * Base open options merged into every notify call.
   *
   * `notify(...)` passes `inputs`/`outputs` directly from each call; this config
   * only provides shared open options such as placement, duration, and styling.
   * Per-call notify options always win on conflicts.
   */
  readonly defaultOpenOptions?: Omit<
    SnackbarOpenOptionsForComponent<TComponent>,
    'inputs' | 'outputs'
  >;
  /**
   * Default maximum number of visible snackbars per placement lane.
   * Older snackbars beyond the cap are hidden (not closed).
   */
  readonly maxVisibleSnackbars?: number;
}

export const SNACKBAR_DEFAULTS = new InjectionToken<SnackbarDefaultsConfig<unknown>>(
  'SNACKBAR_DEFAULTS',
);

export function provideSnackbarDefaults<TComponent>(
  config: SnackbarDefaultsConfig<TComponent>,
): Provider {
  return { provide: SNACKBAR_DEFAULTS, useValue: config };
}

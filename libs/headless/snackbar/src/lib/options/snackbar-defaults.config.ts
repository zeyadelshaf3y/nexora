import type { Provider, Type } from '@angular/core';
import { InjectionToken } from '@angular/core';
import type { OpenInputs, OpenInputsFor, OpenOutputs, OpenOutputsFor } from '@nexora-ui/overlay';

import type { SnackbarOpenOptions, SnackbarOpenOptionsForComponent } from './snackbar-open-options';

/**
 * High-level notify payload consumed by default snackbar component mappings.
 * Extra keys are allowed so apps can extend their notify contract.
 */
export type SnackbarNotifyOptions = Omit<SnackbarOpenOptions, 'inputs' | 'outputs' | 'data'> & {
  readonly variant?: string;
  readonly title?: string;
  readonly message?: string;
  readonly actionLabel?: string;
  readonly onAction?: () => void;
};

export interface SnackbarDefaultsConfig<
  TComponent = unknown,
  TNotify extends SnackbarNotifyOptions = SnackbarNotifyOptions,
> {
  /**
   * Default component used by `SnackbarService.notify(...)`.
   */
  readonly component: Type<TComponent>;
  /**
   * Base open options merged into every notify call. Per-call notify options
   * always win on conflicts.
   */
  readonly defaultOpenOptions?: Omit<
    SnackbarOpenOptionsForComponent<TComponent>,
    'inputs' | 'outputs'
  >;
  /**
   * Maps notify payload to default component inputs.
   */
  readonly mapInputs?: (notify: TNotify) => OpenInputsFor<TComponent> | OpenInputs;
  /**
   * Maps notify payload to default component outputs.
   */
  readonly mapOutputs?: (ctx: {
    notify: TNotify;
    close: (value?: unknown) => void;
  }) => OpenOutputsFor<TComponent> | OpenOutputs;
  /**
   * Default maximum number of visible snackbars per placement lane.
   * Older snackbars beyond the cap are hidden (not closed).
   */
  readonly maxVisibleSnackbars?: number;
}

export const SNACKBAR_DEFAULTS = new InjectionToken<
  SnackbarDefaultsConfig<unknown, SnackbarNotifyOptions>
>('SNACKBAR_DEFAULTS');

export function provideSnackbarDefaults<
  TComponent,
  TNotify extends SnackbarNotifyOptions = SnackbarNotifyOptions,
>(config: SnackbarDefaultsConfig<TComponent, TNotify>): Provider {
  return { provide: SNACKBAR_DEFAULTS, useValue: config };
}

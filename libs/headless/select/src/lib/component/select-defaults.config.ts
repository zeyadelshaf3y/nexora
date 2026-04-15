import type { Provider } from '@angular/core';
import { InjectionToken, isDevMode } from '@angular/core';
import { warnOnce } from '@nexora-ui/core';
import {
  DEFAULT_CLOSE_ANIMATION_MS,
  DEFAULT_MAX_HEIGHT,
  DEFAULT_OFFSET,
} from '@nexora-ui/dropdown';
import type { Placement, ViewportBoundaries } from '@nexora-ui/overlay';

import type { SelectScrollStrategy } from '../types/select-types';

export interface SelectDefaultsConfig {
  readonly placement?: Placement;
  readonly panelClass?: string | string[];
  readonly backdropClass?: string | string[];
  readonly panelStyle?: Record<string, string>;
  readonly backdropStyle?: Record<string, string>;
  readonly hasBackdrop?: boolean;
  readonly maxHeight?: string;
  readonly offset?: number;
  readonly matchTriggerWidth?: boolean;
  readonly scrollStrategy?: SelectScrollStrategy;
  readonly maintainInViewport?: boolean;
  readonly boundaries?: ViewportBoundaries;
  readonly closeAnimationDurationMs?: number;
}

export const DEFAULT_SELECT_DEFAULTS_CONFIG: SelectDefaultsConfig = {
  placement: 'bottom',
  hasBackdrop: false,
  maxHeight: DEFAULT_MAX_HEIGHT,
  offset: DEFAULT_OFFSET,
  matchTriggerWidth: true,
  scrollStrategy: 'noop',
  maintainInViewport: true,
  closeAnimationDurationMs: DEFAULT_CLOSE_ANIMATION_MS,
};

export const SELECT_DEFAULTS_CONFIG = new InjectionToken<SelectDefaultsConfig>(
  'SELECT_DEFAULTS_CONFIG',
);

export function provideSelectDefaults(config: SelectDefaultsConfig): Provider {
  if (isDevMode()) {
    if (config.offset != null && config.offset < 0) {
      warnOnce(
        'nxr-select-defaults-invalid-offset',
        'SELECT_DEFAULTS_CONFIG.offset should be >= 0.',
      );
    }
    if (config.closeAnimationDurationMs != null && config.closeAnimationDurationMs < 0) {
      warnOnce(
        'nxr-select-defaults-invalid-close-ms',
        'SELECT_DEFAULTS_CONFIG.closeAnimationDurationMs should be >= 0.',
      );
    }
  }

  return { provide: SELECT_DEFAULTS_CONFIG, useValue: config };
}

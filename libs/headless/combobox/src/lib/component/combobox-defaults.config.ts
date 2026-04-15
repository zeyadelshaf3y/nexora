import type { Provider } from '@angular/core';
import { InjectionToken, isDevMode } from '@angular/core';
import { warnOnce } from '@nexora-ui/core';
import {
  DEFAULT_CLOSE_ANIMATION_MS,
  DEFAULT_MAX_HEIGHT,
  DEFAULT_OFFSET,
} from '@nexora-ui/dropdown';
import type { Placement, ViewportBoundaries } from '@nexora-ui/overlay';

import type { ComboboxScrollStrategy } from '../types/combobox-types';

export interface ComboboxDefaultsConfig {
  readonly placement?: Placement;
  readonly panelClass?: string | string[];
  readonly panelStyle?: Record<string, string>;
  readonly backdropClass?: string | string[];
  readonly backdropStyle?: Record<string, string>;
  readonly hasBackdrop?: boolean;
  readonly maxHeight?: string;
  readonly offset?: number;
  readonly matchTriggerWidth?: boolean;
  readonly scrollStrategy?: ComboboxScrollStrategy;
  readonly maintainInViewport?: boolean;
  readonly boundaries?: ViewportBoundaries;
  readonly closeAnimationDurationMs?: number;
  readonly openPanelOnFocus?: boolean;
}

export const DEFAULT_COMBOBOX_DEFAULTS_CONFIG: ComboboxDefaultsConfig = {
  placement: 'bottom',
  hasBackdrop: false,
  maxHeight: DEFAULT_MAX_HEIGHT,
  offset: DEFAULT_OFFSET,
  matchTriggerWidth: true,
  scrollStrategy: 'noop',
  maintainInViewport: true,
  closeAnimationDurationMs: DEFAULT_CLOSE_ANIMATION_MS,
  openPanelOnFocus: true,
};

export const COMBOBOX_DEFAULTS_CONFIG = new InjectionToken<ComboboxDefaultsConfig>(
  'COMBOBOX_DEFAULTS_CONFIG',
);

export function provideComboboxDefaults(config: ComboboxDefaultsConfig): Provider {
  if (isDevMode()) {
    if (config.offset != null && config.offset < 0) {
      warnOnce(
        'nxr-combobox-defaults-invalid-offset',
        'COMBOBOX_DEFAULTS_CONFIG.offset should be >= 0.',
      );
    }
    if (config.closeAnimationDurationMs != null && config.closeAnimationDurationMs < 0) {
      warnOnce(
        'nxr-combobox-defaults-invalid-close-ms',
        'COMBOBOX_DEFAULTS_CONFIG.closeAnimationDurationMs should be >= 0.',
      );
    }
  }

  return { provide: COMBOBOX_DEFAULTS_CONFIG, useValue: config };
}

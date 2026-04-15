import type { Provider } from '@angular/core';
import { InjectionToken, isDevMode } from '@angular/core';
import { warnOnce } from '@nexora-ui/core';
import {
  DEFAULT_CLOSE_ANIMATION_MS,
  DEFAULT_MAX_HEIGHT,
  DEFAULT_OFFSET,
} from '@nexora-ui/dropdown';
import type { Placement, ViewportBoundaries } from '@nexora-ui/overlay';

export interface MenuDefaultsConfig {
  readonly placement?: Placement;
  readonly panelClass?: string | string[];
  readonly backdropClass?: string | string[];
  readonly panelStyle?: Record<string, string>;
  readonly backdropStyle?: Record<string, string>;
  readonly hasBackdrop?: boolean;
  readonly maxHeight?: string;
  readonly boundaries?: ViewportBoundaries;
  readonly offset?: number;
  readonly matchTriggerWidth?: boolean;
  readonly scrollStrategy?: 'noop' | 'reposition' | 'block' | 'close';
  readonly maintainInViewport?: boolean;
  readonly closeAnimationDurationMs?: number;
  readonly displayArrow?: boolean;
  readonly arrowSize?: { width: number; height: number };
}

export const DEFAULT_MENU_DEFAULTS_CONFIG: MenuDefaultsConfig = {
  placement: 'bottom-start',
  hasBackdrop: false,
  maxHeight: DEFAULT_MAX_HEIGHT,
  offset: DEFAULT_OFFSET,
  matchTriggerWidth: false,
  scrollStrategy: 'noop',
  maintainInViewport: true,
  closeAnimationDurationMs: DEFAULT_CLOSE_ANIMATION_MS,
  displayArrow: true,
};

export const MENU_DEFAULTS_CONFIG = new InjectionToken<MenuDefaultsConfig>('MENU_DEFAULTS_CONFIG');

export function provideMenuDefaults(config: MenuDefaultsConfig): Provider {
  if (isDevMode()) {
    if (config.offset != null && config.offset < 0) {
      warnOnce('nxr-menu-defaults-invalid-offset', 'MENU_DEFAULTS_CONFIG.offset should be >= 0.');
    }
    if (config.closeAnimationDurationMs != null && config.closeAnimationDurationMs < 0) {
      warnOnce(
        'nxr-menu-defaults-invalid-close-ms',
        'MENU_DEFAULTS_CONFIG.closeAnimationDurationMs should be >= 0.',
      );
    }
  }

  return { provide: MENU_DEFAULTS_CONFIG, useValue: config };
}

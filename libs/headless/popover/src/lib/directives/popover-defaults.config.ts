import type { Provider } from '@angular/core';
import { InjectionToken, isDevMode } from '@angular/core';
import { warnOnce } from '@nexora-ui/core';
import type { Placement, ViewportBoundaries } from '@nexora-ui/overlay';

import type { PopoverTriggerInput } from '../types/popover-trigger-types';

export interface PopoverDefaultsConfig {
  readonly trigger?: PopoverTriggerInput;
  readonly placement?: Placement;
  readonly hasBackdrop?: boolean;
  readonly offset?: number;
  readonly disabled?: boolean;
  readonly closeOnScroll?: boolean;
  readonly scrollStrategy?: 'noop' | 'reposition' | 'close';
  readonly maintainInViewport?: boolean;
  readonly boundaries?: ViewportBoundaries;
  readonly preferredPlacementOnly?: boolean;
  readonly openDelay?: number;
  readonly closeDelay?: number;
  readonly hoverCloseDelay?: number;
  readonly focusCloseDelay?: number;
  readonly allowContentHover?: boolean;
  readonly panelClass?: string | string[];
  readonly panelStyle?: Record<string, string>;
  readonly backdropClass?: string | string[];
  readonly backdropStyle?: Record<string, string>;
  readonly closeAnimationDurationMs?: number;
  readonly arrowSize?: { width: number; height: number };
  readonly width?: string;
  readonly height?: string;
  readonly minWidth?: string;
  readonly maxWidth?: string;
  readonly minHeight?: string;
  readonly maxHeight?: string;
  readonly matchAnchorWidth?: boolean;
  readonly clampToViewport?: boolean;
  readonly role?: string;
}

export const DEFAULT_POPOVER_DEFAULTS_CONFIG: PopoverDefaultsConfig = {
  trigger: 'click',
  placement: 'bottom-start',
  hasBackdrop: false,
  offset: 8,
  disabled: false,
  closeOnScroll: false,
  scrollStrategy: 'noop',
  maintainInViewport: true,
  preferredPlacementOnly: false,
  openDelay: 0,
  hoverCloseDelay: 100,
  focusCloseDelay: 150,
  allowContentHover: true,
  closeAnimationDurationMs: 0,
  matchAnchorWidth: false,
  clampToViewport: true,
  role: 'dialog',
};

export const POPOVER_DEFAULTS_CONFIG = new InjectionToken<PopoverDefaultsConfig>(
  'POPOVER_DEFAULTS_CONFIG',
);

export function providePopoverDefaults(config: PopoverDefaultsConfig): Provider {
  if (isDevMode()) {
    if (config.offset != null && config.offset < 0) {
      warnOnce(
        'nxr-popover-defaults-invalid-offset',
        'POPOVER_DEFAULTS_CONFIG.offset should be >= 0.',
      );
    }
    if (config.openDelay != null && config.openDelay < 0) {
      warnOnce(
        'nxr-popover-defaults-invalid-open-delay',
        'POPOVER_DEFAULTS_CONFIG.openDelay should be >= 0.',
      );
    }
    if (config.closeAnimationDurationMs != null && config.closeAnimationDurationMs < 0) {
      warnOnce(
        'nxr-popover-defaults-invalid-close-ms',
        'POPOVER_DEFAULTS_CONFIG.closeAnimationDurationMs should be >= 0.',
      );
    }
  }

  return { provide: POPOVER_DEFAULTS_CONFIG, useValue: config };
}

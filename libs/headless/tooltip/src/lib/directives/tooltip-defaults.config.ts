import { InjectionToken } from '@angular/core';
import type { Placement, ViewportBoundaries } from '@nexora-ui/overlay';

export type TooltipTriggerDefault = 'hover' | 'focus';
export type TooltipTriggerDefaultInput = TooltipTriggerDefault | TooltipTriggerDefault[];

export interface TooltipDefaultsConfig {
  readonly placement?: Placement;
  readonly offset?: number;
  readonly trigger?: TooltipTriggerDefaultInput;
  readonly displayArrow?: boolean;
  readonly openDelay?: number;
  readonly closeDelay?: number;
  readonly hoverCloseDelay?: number;
  readonly focusCloseDelay?: number | undefined;
  readonly instantOnHandoff?: boolean;
  readonly allowContentHover?: boolean;
  readonly disabled?: boolean;
  readonly closeAnimationDurationMs?: number;
  readonly clampToViewport?: boolean;
  readonly scrollStrategy?: 'noop' | 'reposition';
  readonly maintainInViewport?: boolean;
  readonly panelClass?: string | string[] | undefined;
  readonly panelStyle?: Record<string, string> | undefined;
  readonly arrowSize?: { width: number; height: number } | undefined;
  readonly boundaries?: ViewportBoundaries | undefined;
}

export const DEFAULT_TOOLTIP_DEFAULTS_CONFIG: TooltipDefaultsConfig = {
  placement: 'top',
  offset: 8,
  trigger: ['hover', 'focus'],
  displayArrow: true,
  openDelay: 200,
  closeDelay: 0,
  hoverCloseDelay: 100,
  focusCloseDelay: undefined,
  instantOnHandoff: true,
  allowContentHover: false,
  disabled: false,
  closeAnimationDurationMs: 150,
  clampToViewport: false,
  scrollStrategy: 'noop',
  maintainInViewport: true,
  panelClass: undefined,
  panelStyle: undefined,
  arrowSize: undefined,
  boundaries: undefined,
};

export const TOOLTIP_DEFAULTS_CONFIG = new InjectionToken<TooltipDefaultsConfig>(
  'TOOLTIP_DEFAULTS_CONFIG',
);

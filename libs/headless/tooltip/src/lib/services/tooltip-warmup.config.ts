import { InjectionToken } from '@angular/core';

export interface TooltipWarmupConfig {
  /**
   * Optional warmup window (ms) after a tooltip fully closes.
   * During this window, the next tooltip can open instantly.
   *
   * Default: 0 (disabled).
   */
  readonly warmupWindowMs?: number;
}

export const DEFAULT_TOOLTIP_WARMUP_CONFIG: Required<TooltipWarmupConfig> = {
  warmupWindowMs: 0,
};

export const TOOLTIP_WARMUP_CONFIG = new InjectionToken<TooltipWarmupConfig>(
  'TOOLTIP_WARMUP_CONFIG',
);

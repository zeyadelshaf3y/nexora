import { inject, Injectable } from '@angular/core';

import { DEFAULT_TOOLTIP_WARMUP_CONFIG, TOOLTIP_WARMUP_CONFIG } from './tooltip-warmup.config';

/**
 * Coordinates tooltip-to-tooltip handoff.
 * When another tooltip wants to open, the currently open tooltip is asked to close immediately.
 *
 * @example
 * ```ts
 * // In tooltip directive enter/focus flow:
 * const isHandoff = this.warmup.requestHandoff(instanceId);
 * ```
 */
@Injectable({ providedIn: 'root' })
export class TooltipWarmupService {
  private readonly config = {
    ...DEFAULT_TOOLTIP_WARMUP_CONFIG,
    ...(inject(TOOLTIP_WARMUP_CONFIG, { optional: true }) ?? {}),
  };
  private nextInstanceId = 1;
  private lastClosedAt = 0;
  private activeTooltip: {
    id: number;
    closeImmediately: () => void;
  } | null = null;

  createInstanceId(): number {
    const id = this.nextInstanceId;
    this.nextInstanceId += 1;

    return id;
  }

  registerOpened(instanceId: number, closeImmediately: () => void): void {
    this.activeTooltip = { id: instanceId, closeImmediately };
  }

  unregister(instanceId: number): void {
    if (this.activeTooltip?.id === instanceId) this.activeTooltip = null;
  }

  requestHandoff(instanceId: number): boolean {
    if (this.activeTooltip != null) {
      if (this.activeTooltip.id === instanceId) return false;
      this.activeTooltip.closeImmediately();

      return true;
    }

    return this.isWithinWarmupWindow(this.nowMs());
  }

  /** Call when a tooltip closes. */
  notifyClosed(instanceId?: number): void {
    if (instanceId != null && this.activeTooltip?.id === instanceId) {
      this.activeTooltip = null;
    }
    this.lastClosedAt = this.nowMs();
  }

  private isWithinWarmupWindow(nowMs: number): boolean {
    return (
      this.config.warmupWindowMs > 0 && nowMs - this.lastClosedAt <= this.config.warmupWindowMs
    );
  }

  private nowMs(): number {
    return Date.now();
  }
}

/**
 * Drawer-specific drag-to-close controller (dismiss-only or snap + dismiss).
 */

import { isDevMode } from '@angular/core';

import { DEFAULT_CLOSE_ANIMATION_MS } from '../defaults/constants';
import { CLOSE_REASON_GESTURE } from '../ref/close-reason';
import type { OverlayRef } from '../ref/overlay-ref';

import { createDragDismissCore, type DragDismissCore } from './drag-dismiss-core';
import type { DragDismissStrategy, DragDismissVector } from './drag-dismiss-vector';
import type { DragHandleRegisterOptions } from './drag-handle-options';
import { applyDragTransform } from './drag-pane-transform';
import type { ResolvedDragToCloseConfig, DragToCloseConfig } from './drag-to-close-config';
import { resolveDragToCloseConfig } from './drag-to-close-config';
import {
  getDrawerOffScreenOffset,
  getPaneSizeAlongAxis,
  resolveDrawerDragDismissVectorFromPane,
} from './drawer-drag-dismiss-vector';
import {
  getDrawerDragController,
  registerDrawerDragController,
  unregisterDrawerDragController,
} from './drawer-drag-registry';
import { createDrawerSnapDragHandler } from './drawer-snap-drag';
import { resolveDrawerSnapMetrics } from './drawer-snap-metrics';
import {
  clearDragInlineStyles,
  runGestureCloseAnimation,
  runSnapBackAnimation,
} from './gesture-close-animation';
import { setOverlayDragging } from './overlay-drag-state';
import { shouldInitiateDrawerDrag } from './should-initiate-drawer-drag';

const SNAP_BACK_DURATION_MS = 200;
const GESTURE_CLOSE_DURATION_MS = 200;

function createDrawerDragStrategy(pane: HTMLElement): DragDismissStrategy {
  return {
    resolveDismissVector: () =>
      resolveDrawerDragDismissVectorFromPane(pane) ?? { axis: 'x', dismissSign: 1 },
    getPaneSizeAlongAxis: (p, axis) => getPaneSizeAlongAxis(p, axis),
    getOffScreenOffset: (p, axis, sign) => getDrawerOffScreenOffset(p, axis, sign),
  };
}

function resolveHandleConfig(
  base: ResolvedDragToCloseConfig,
  override?: Partial<ResolvedDragToCloseConfig>,
): ResolvedDragToCloseConfig {
  if (!override) return base;

  return { ...base, ...override };
}

export class DrawerDragController {
  private snapHandler: ReturnType<typeof createDrawerSnapDragHandler> | null = null;
  private dismissCore: DragDismissCore | null = null;
  private snapFallbackWarned = false;
  private readonly baseConfig: ResolvedDragToCloseConfig;
  private readonly handleUnregisters = new Map<HTMLElement, () => void>();
  private handleCount = 0;
  private paneHandleRegistered = false;
  private missingHandleWarned = false;
  private destroyed = false;

  constructor(
    private readonly ref: OverlayRef,
    private readonly pane: HTMLElement,
    private readonly backdrop: HTMLElement | null,
    config: ResolvedDragToCloseConfig,
  ) {
    this.baseConfig = config;
    this.ensureDragHandlerInitialized();

    queueMicrotask(() => {
      requestAnimationFrame(() => this.warnIfNoHandleRegistered());
    });
  }

  registerHandle(handle: HTMLElement, configOverride?: Partial<DragToCloseConfig>): void {
    if (this.destroyed) return;
    if (this.handleUnregisters.has(handle)) return;

    this.ensureDragHandlerInitialized();
    this.registerHandleOnHandler(handle, configOverride);
  }

  private registerHandleOnHandler(
    handle: HTMLElement,
    configOverride?: Partial<DragToCloseConfig>,
    options?: DragHandleRegisterOptions,
  ): void {
    const handleConfig = resolveHandleConfig(
      this.baseConfig,
      configOverride ? (resolveDragToCloseConfig(configOverride) ?? undefined) : undefined,
    );

    const unregister = this.snapHandler
      ? this.snapHandler.registerHandle(handle, handleConfig, options)
      : this.dismissCore?.registerHandle(handle, handleConfig, options);

    if (!unregister) return;

    this.handleUnregisters.set(handle, unregister);
    this.handleCount++;
  }

  unregisterHandle(handle: HTMLElement): void {
    const unregister = this.handleUnregisters.get(handle);

    if (!unregister) return;

    unregister();
    this.handleUnregisters.delete(handle);
    this.handleCount = Math.max(0, this.handleCount - 1);
  }

  applyInitialSnapSize(): void {
    this.ensureDragHandlerInitialized();
    this.snapHandler?.applyInitialSize();
  }

  destroy(): void {
    if (this.destroyed) return;

    this.destroyed = true;
    setOverlayDragging(this.ref, false);
    clearDragInlineStyles(this.pane, this.backdrop);

    for (const unregister of this.handleUnregisters.values()) unregister();
    this.handleUnregisters.clear();
    this.snapHandler?.destroy();
    this.dismissCore?.destroy();
  }

  private ensureDragHandlerInitialized(): void {
    if (this.destroyed || this.snapHandler || this.dismissCore) {
      this.registerPaneHandleIfEnabled();

      return;
    }

    if (this.baseConfig.snap && this.tryInitSnapHandler()) {
      this.registerPaneHandleIfEnabled();

      return;
    }

    const placement = resolveDrawerDragDismissVectorFromPane(this.pane);

    // Snap requires placement on the pane; defer until `applyPosition()` has run.
    if (this.baseConfig.snap && !placement) return;

    if (this.baseConfig.snap && !this.snapFallbackWarned && isDevMode()) {
      this.snapFallbackWarned = true;
      console.warn(
        'Nexora: drawer dragToClose.snap could not be resolved (check initialSize and placement). Falling back to dismiss-only drag.',
      );
    }

    this.initDismissCore();
    this.registerPaneHandleIfEnabled();
  }

  private registerPaneHandleIfEnabled(): void {
    if (
      this.destroyed ||
      this.paneHandleRegistered ||
      this.baseConfig.dragFrom !== 'pane' ||
      (!this.snapHandler && !this.dismissCore)
    ) {
      return;
    }

    this.registerHandleOnHandler(this.pane, undefined, {
      shouldInitiateDrag: shouldInitiateDrawerDrag,
    });
    this.paneHandleRegistered = true;
  }

  private tryInitSnapHandler(): boolean {
    const snap = this.baseConfig.snap;

    if (!snap) return false;

    const vector = resolveDrawerDragDismissVectorFromPane(this.pane);

    if (!vector) return false;

    const snapMetrics = resolveDrawerSnapMetrics({
      snap,
      pane: this.pane,
      axis: vector.axis,
    });

    if (!snapMetrics) return false;

    this.snapHandler = createDrawerSnapDragHandler({
      pane: this.pane,
      backdrop: this.backdrop,
      ref: this.ref,
      metrics: snapMetrics,
      defaultConfig: this.baseConfig,
      resolveVector: () =>
        resolveDrawerDragDismissVectorFromPane(this.pane) ?? { axis: 'x', dismissSign: 1 },
      onDragStart: () => setOverlayDragging(this.ref, true),
      onDragEnd: () => setOverlayDragging(this.ref, false),
      onDismiss: (offsetPx, v) => this.handleDismiss(offsetPx, v),
    });

    return true;
  }

  private initDismissCore(): void {
    if (this.dismissCore || this.snapHandler) return;

    this.dismissCore = createDragDismissCore({
      pane: this.pane,
      strategy: createDrawerDragStrategy(this.pane),
      config: this.baseConfig,
      callbacks: {
        onDragStart: () => setOverlayDragging(this.ref, true),
        onDragEnd: () => setOverlayDragging(this.ref, false),
        onDismiss: (offsetPx, v) => this.handleDismiss(offsetPx, v),
        onSnapBack: (_offsetPx, v) => this.handleSnapBack(v),
      },
    });
  }

  private warnIfNoHandleRegistered(): void {
    this.ensureDragHandlerInitialized();

    if (
      this.destroyed ||
      this.missingHandleWarned ||
      this.handleCount > 0 ||
      this.baseConfig.dragFrom === 'pane'
    ) {
      return;
    }

    this.missingHandleWarned = true;

    if (isDevMode()) {
      console.warn(
        'Nexora: Drawer dragToClose is enabled but no nxrDrawerDragHandle was found in drawer content.',
      );
    }
  }

  private async handleDismiss(offsetPx: number, vector: DragDismissVector): Promise<void> {
    if (this.destroyed) return;

    applyDragTransform(this.pane, vector.axis, offsetPx * vector.dismissSign);

    const offScreen = getDrawerOffScreenOffset(this.pane, vector.axis, vector.dismissSign);
    const animDuration = Math.min(GESTURE_CLOSE_DURATION_MS, DEFAULT_CLOSE_ANIMATION_MS);

    await runGestureCloseAnimation({
      pane: this.pane,
      backdrop: this.backdrop,
      axis: vector.axis,
      offScreenOffsetPx: offScreen,
      durationMs: animDuration,
    });

    if (this.destroyed) return;

    this.ref.setCloseAnimationDurationMs(0);
    const closed = await this.ref.close(CLOSE_REASON_GESTURE);

    if (!closed && !this.destroyed) {
      clearDragInlineStyles(this.pane, this.backdrop);
      this.ref.setCloseAnimationDurationMs(undefined);
      await this.handleSnapBack(vector);
    }
  }

  private async handleSnapBack(vector: DragDismissVector): Promise<void> {
    if (this.destroyed) return;

    await runSnapBackAnimation({
      pane: this.pane,
      axis: vector.axis,
      durationMs: SNAP_BACK_DURATION_MS,
    });

    if (this.destroyed) return;

    clearDragInlineStyles(this.pane, this.backdrop);
    this.ref.reposition();
  }
}

export function attachDrawerDragController(
  ref: OverlayRef,
  pane: HTMLElement,
  backdrop: HTMLElement | null,
  config: ResolvedDragToCloseConfig,
): DrawerDragController {
  const controller = new DrawerDragController(ref, pane, backdrop, config);

  registerDrawerDragController(pane, controller);

  return controller;
}

export function detachDrawerDragController(pane: HTMLElement): void {
  getDrawerDragController(pane)?.destroy();
  unregisterDrawerDragController(pane);
}

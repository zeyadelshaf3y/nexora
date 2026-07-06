/**
 * Drawer snap + dismiss drag: resize between initial/expanded, dismiss below initial.
 * @internal
 */

import { listen, prefersReducedMotion } from '@nexora-ui/core';

import type { OverlayRef } from '../ref/overlay-ref';

import type { DragDismissVector } from './drag-dismiss-vector';
import { applyDragTransform } from './drag-pane-transform';
import type { ResolvedDragToCloseConfig } from './drag-to-close-config';
import {
  applySnapSize,
  getCurrentSnapPositionPx,
  type ResolvedDrawerSnapMetrics,
} from './drawer-snap-metrics';
import { PANE_DRAGGING_CLASS, clearDragInlineStyles } from './gesture-close-animation';

const SNAP_ANIMATION_MS = 200;

interface DrawerSnapDragHandler {
  registerHandle(handle: HTMLElement, config?: ResolvedDragToCloseConfig): () => void;
  applyInitialSize(): void;
  destroy(): void;
}

interface ActiveSnapDrag {
  pointerId: number;
  handle: HTMLElement;
  startClientX: number;
  startClientY: number;
  startPositionPx: number;
  lastAppliedSizePx: number;
  lastTimestamp: number;
  lastPositionPx: number;
  lastVelocity: number;
  vector: DragDismissVector;
  config: ResolvedDragToCloseConfig;
}

export function createDrawerSnapDragHandler(args: {
  pane: HTMLElement;
  backdrop: HTMLElement | null;
  ref: OverlayRef;
  metrics: ResolvedDrawerSnapMetrics;
  defaultConfig: ResolvedDragToCloseConfig;
  resolveVector: () => DragDismissVector;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDismiss: (dismissOffsetPx: number, vector: DragDismissVector) => Promise<void>;
}): DrawerSnapDragHandler {
  const {
    pane,
    backdrop,
    ref,
    metrics,
    defaultConfig,
    resolveVector,
    onDragStart,
    onDragEnd,
    onDismiss,
  } = args;
  const handleCleanups = new Map<HTMLElement, () => void>();
  const handleConfigs = new WeakMap<HTMLElement, ResolvedDragToCloseConfig>();
  let activeDrag: ActiveSnapDrag | null = null;
  let isFinishing = false;
  let documentCleanups: Array<() => void> = [];

  const clearDocumentListeners = (): void => {
    for (const cleanup of documentCleanups) cleanup();
    documentCleanups = [];
  };

  const getDismissPositiveDelta = (
    startX: number,
    startY: number,
    currentX: number,
    currentY: number,
    vector: DragDismissVector,
  ): number => {
    const raw = vector.axis === 'x' ? currentX - startX : currentY - startY;

    return raw * vector.dismissSign;
  };

  const computeDragState = (
    dismissPositiveDelta: number,
    startPositionPx: number,
  ): { sizePx: number; dismissOffsetPx: number; positionPx: number } => {
    const positionPx = startPositionPx - dismissPositiveDelta;

    if (positionPx >= metrics.initialPx) {
      const sizePx = Math.min(Math.max(positionPx, metrics.initialPx), metrics.expandedPx);

      return { sizePx, dismissOffsetPx: 0, positionPx: sizePx };
    }

    return {
      sizePx: metrics.initialPx,
      dismissOffsetPx: metrics.initialPx - positionPx,
      positionPx,
    };
  };

  const applyDragVisuals = (
    sizePx: number,
    dismissOffsetPx: number,
    vector: DragDismissVector,
    drag: ActiveSnapDrag,
  ): void => {
    if (sizePx !== drag.lastAppliedSizePx) {
      applySnapSize(ref, metrics, sizePx);
      drag.lastAppliedSizePx = sizePx;
    }

    if (dismissOffsetPx > 0) {
      applyDragTransform(pane, vector.axis, dismissOffsetPx * vector.dismissSign);
    } else {
      pane.style.removeProperty('transform');
    }
  };

  const resetDragVisuals = (): void => {
    pane.classList.remove(PANE_DRAGGING_CLASS);
    pane.style.removeProperty('transition');
  };

  const animateToSize = (targetPx: number): Promise<void> => {
    if (prefersReducedMotion()) {
      applySnapSize(ref, metrics, targetPx);
      pane.style.removeProperty('transform');

      return Promise.resolve();
    }

    pane.style.transition = `height ${SNAP_ANIMATION_MS}ms ease, width ${SNAP_ANIMATION_MS}ms ease, transform ${SNAP_ANIMATION_MS}ms ease`;

    return new Promise((resolve) => {
      let resolved = false;

      const done = (): void => {
        if (resolved) return;
        resolved = true;
        pane.removeEventListener('transitionend', onEnd);
        clearTimeout(tid);
        pane.style.removeProperty('transition');
        pane.style.removeProperty('transform');
        resolve();
      };

      const onEnd = (): void => done();

      applySnapSize(ref, metrics, targetPx);
      pane.style.removeProperty('transform');

      pane.addEventListener('transitionend', onEnd);
      const tid = setTimeout(done, SNAP_ANIMATION_MS + 50);
    });
  };

  const finishDrag = async (drag: ActiveSnapDrag): Promise<void> => {
    if (isFinishing) return;

    isFinishing = true;
    activeDrag = null;
    clearDocumentListeners();
    resetDragVisuals();
    onDragEnd();

    const dismissPositiveDelta = drag.startPositionPx - drag.lastPositionPx;
    const { dismissOffsetPx } = computeDragState(dismissPositiveDelta, drag.startPositionPx);
    const closeThresholdPx = drag.config.threshold * metrics.initialPx;
    const midSnap = (metrics.initialPx + metrics.expandedPx) / 2;
    const canExpand = metrics.expandedPx > metrics.initialPx;

    try {
      const shouldClose =
        dismissOffsetPx >= closeThresholdPx ||
        (!prefersReducedMotion() &&
          drag.lastVelocity >= drag.config.minVelocity &&
          dismissOffsetPx > 0);

      if (shouldClose) {
        await onDismiss(dismissOffsetPx, drag.vector);

        return;
      }

      if (canExpand && drag.lastPositionPx >= midSnap) {
        await animateToSize(metrics.expandedPx);
      } else {
        await animateToSize(metrics.initialPx);
      }
    } finally {
      isFinishing = false;
    }
  };

  const onPointerMove = (event: PointerEvent): void => {
    if (!activeDrag || event.pointerId !== activeDrag.pointerId) return;

    event.preventDefault();

    const now = performance.now();
    const dismissPositiveDelta = getDismissPositiveDelta(
      activeDrag.startClientX,
      activeDrag.startClientY,
      event.clientX,
      event.clientY,
      activeDrag.vector,
    );
    const { sizePx, dismissOffsetPx, positionPx } = computeDragState(
      dismissPositiveDelta,
      activeDrag.startPositionPx,
    );
    const dt = Math.max(now - activeDrag.lastTimestamp, 1);
    const prevPosition = activeDrag.lastPositionPx;

    activeDrag.lastVelocity = Math.abs(positionPx - prevPosition) / dt;
    activeDrag.lastPositionPx = positionPx;
    activeDrag.lastTimestamp = now;

    applyDragVisuals(sizePx, dismissOffsetPx, activeDrag.vector, activeDrag);
  };

  const onPointerUp = (event: PointerEvent): void => {
    if (!activeDrag || event.pointerId !== activeDrag.pointerId) return;

    event.preventDefault();

    try {
      activeDrag.handle.releasePointerCapture(event.pointerId);
    } catch {
      // ignore
    }

    void finishDrag(activeDrag);
  };

  const onPointerDown = (event: PointerEvent): void => {
    if (activeDrag || isFinishing || event.button !== 0) return;

    const handle = event.currentTarget;

    if (!(handle instanceof HTMLElement)) return;

    event.preventDefault();

    const vector = resolveVector();

    try {
      handle.setPointerCapture(event.pointerId);
    } catch {
      // continue without capture
    }

    pane.style.transition = 'none';
    pane.classList.add(PANE_DRAGGING_CLASS);
    onDragStart();

    const startPositionPx = getCurrentSnapPositionPx(pane, metrics);

    activeDrag = {
      pointerId: event.pointerId,
      handle,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startPositionPx,
      lastAppliedSizePx: startPositionPx,
      lastTimestamp: performance.now(),
      lastPositionPx: startPositionPx,
      lastVelocity: 0,
      vector,
      config: handleConfigs.get(handle) ?? defaultConfig,
    };

    documentCleanups = [
      listen(document, 'pointermove', onPointerMove as EventListener, { passive: false }),
      listen(document, 'pointerup', onPointerUp as EventListener, { passive: false }),
      listen(document, 'pointercancel', onPointerUp as EventListener, { passive: false }),
    ];
  };

  const registerHandle = (
    handle: HTMLElement,
    config: ResolvedDragToCloseConfig = defaultConfig,
  ): (() => void) => {
    handleConfigs.set(handle, config);
    handle.style.touchAction = 'none';

    const cleanup = listen(handle, 'pointerdown', onPointerDown as EventListener, {
      passive: false,
    });

    handleCleanups.set(handle, cleanup);

    return () => {
      cleanup();
      handleCleanups.delete(handle);
      handleConfigs.delete(handle);
      handle.style.removeProperty('touch-action');

      if (activeDrag?.handle === handle) {
        activeDrag = null;
        clearDocumentListeners();
        resetDragVisuals();
        onDragEnd();
      }
    };
  };

  const applyInitialSize = (): void => {
    applySnapSize(ref, metrics, metrics.initialPx);
  };

  const destroy = (): void => {
    if (activeDrag) {
      resetDragVisuals();
      onDragEnd();
    }

    clearDocumentListeners();
    activeDrag = null;
    isFinishing = false;

    for (const cleanup of handleCleanups.values()) cleanup();
    handleCleanups.clear();
    clearDragInlineStyles(pane, backdrop);
  };

  return { registerHandle, applyInitialSize, destroy };
}

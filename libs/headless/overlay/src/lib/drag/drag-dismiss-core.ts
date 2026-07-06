/**
 * Shared pointer tracking and transform application for drag-to-close.
 * Surface-specific behavior is supplied via {@link DragDismissStrategy}.
 */

import { listen, prefersReducedMotion } from '@nexora-ui/core';

import type { DragDismissStrategy, DragDismissVector } from './drag-dismiss-vector';
import { applyDragTransform } from './drag-pane-transform';
import type { ResolvedDragToCloseConfig } from './drag-to-close-config';
import { PANE_DRAGGING_CLASS } from './gesture-close-animation';

export interface DragDismissCoreCallbacks {
  readonly onDragStart: () => void;
  readonly onDragEnd: () => void;
  readonly onDismiss: (offsetPx: number, vector: DragDismissVector) => Promise<void>;
  readonly onSnapBack: (offsetPx: number, vector: DragDismissVector) => Promise<void>;
}

export interface DragDismissCore {
  registerHandle(handle: HTMLElement, config?: ResolvedDragToCloseConfig): () => void;
  destroy(): void;
}

interface ActiveDrag {
  pointerId: number;
  handle: HTMLElement;
  startClientX: number;
  startClientY: number;
  lastTimestamp: number;
  offsetPx: number;
  lastVelocity: number;
  vector: DragDismissVector;
  config: ResolvedDragToCloseConfig;
}

export function createDragDismissCore(args: {
  pane: HTMLElement;
  strategy: DragDismissStrategy;
  config: ResolvedDragToCloseConfig;
  callbacks: DragDismissCoreCallbacks;
}): DragDismissCore {
  const { pane, strategy, callbacks } = args;
  const defaultConfig = args.config;
  const handleCleanups = new Map<HTMLElement, () => void>();
  let activeDrag: ActiveDrag | null = null;
  let isFinishing = false;
  let documentCleanups: Array<() => void> = [];

  const clearDocumentListeners = (): void => {
    for (const cleanup of documentCleanups) cleanup();
    documentCleanups = [];
  };

  const getDismissAxisDelta = (
    clientX: number,
    clientY: number,
    vector: DragDismissVector,
  ): number => {
    const raw = vector.axis === 'x' ? clientX : clientY;

    return raw * vector.dismissSign;
  };

  const clampDismissOffset = (offsetPx: number, vector: DragDismissVector): number => {
    const max = strategy.getPaneSizeAlongAxis(pane, vector.axis);

    return Math.max(0, Math.min(offsetPx, max));
  };

  const resetPaneDragVisuals = (): void => {
    pane.classList.remove(PANE_DRAGGING_CLASS);
    pane.style.removeProperty('transition');
  };

  const finishDrag = async (drag: ActiveDrag): Promise<void> => {
    if (isFinishing) return;

    isFinishing = true;
    activeDrag = null;
    clearDocumentListeners();
    resetPaneDragVisuals();
    strategy.onDragEnd?.(pane);
    callbacks.onDragEnd();

    const paneSize = strategy.getPaneSizeAlongAxis(pane, drag.vector.axis);
    const thresholdPx = drag.config.threshold * paneSize;

    const shouldClose =
      drag.offsetPx >= thresholdPx ||
      (!prefersReducedMotion() &&
        drag.lastVelocity >= drag.config.minVelocity &&
        drag.offsetPx > 0);

    try {
      if (shouldClose) {
        await callbacks.onDismiss(drag.offsetPx, drag.vector);
      } else {
        await callbacks.onSnapBack(drag.offsetPx, drag.vector);
      }
    } finally {
      isFinishing = false;
    }
  };

  const onPointerMove = (event: PointerEvent): void => {
    if (!activeDrag || event.pointerId !== activeDrag.pointerId) return;

    event.preventDefault();

    const now = performance.now();
    const prevOffset = activeDrag.offsetPx;
    const delta =
      getDismissAxisDelta(event.clientX, event.clientY, activeDrag.vector) -
      getDismissAxisDelta(activeDrag.startClientX, activeDrag.startClientY, activeDrag.vector);
    const offsetPx = clampDismissOffset(delta, activeDrag.vector);
    const dt = Math.max(now - activeDrag.lastTimestamp, 1);

    activeDrag.offsetPx = offsetPx;
    activeDrag.lastVelocity = Math.abs(offsetPx - prevOffset) / dt;
    activeDrag.lastTimestamp = now;

    applyDragTransform(pane, activeDrag.vector.axis, offsetPx * activeDrag.vector.dismissSign);
  };

  const onPointerUp = (event: PointerEvent): void => {
    if (!activeDrag || event.pointerId !== activeDrag.pointerId) return;

    event.preventDefault();

    try {
      activeDrag.handle.releasePointerCapture(event.pointerId);
    } catch {
      // ignore if capture was already released
    }

    void finishDrag(activeDrag);
  };

  const onPointerDown = (event: PointerEvent): void => {
    if (activeDrag || isFinishing || event.button !== 0) return;

    const handle = event.currentTarget;

    if (!(handle instanceof HTMLElement)) return;

    event.preventDefault();

    const vector = strategy.resolveDismissVector(pane);

    try {
      handle.setPointerCapture(event.pointerId);
    } catch {
      // Continue without capture (e.g. jsdom or unsupported environments).
    }

    pane.style.transition = 'none';
    pane.classList.add(PANE_DRAGGING_CLASS);
    strategy.onDragStart?.(pane);
    callbacks.onDragStart();

    activeDrag = {
      pointerId: event.pointerId,
      handle,
      startClientX: event.clientX,
      startClientY: event.clientY,
      lastTimestamp: performance.now(),
      offsetPx: 0,
      lastVelocity: 0,
      vector,
      config: getHandleConfig(handle),
    };

    documentCleanups = [
      listen(document, 'pointermove', onPointerMove as EventListener, { passive: false }),
      listen(document, 'pointerup', onPointerUp as EventListener, { passive: false }),
      listen(document, 'pointercancel', onPointerUp as EventListener, { passive: false }),
    ];
  };

  const handleConfigs = new WeakMap<HTMLElement, ResolvedDragToCloseConfig>();

  const getHandleConfig = (handle: HTMLElement): ResolvedDragToCloseConfig =>
    handleConfigs.get(handle) ?? defaultConfig;

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
        resetPaneDragVisuals();
        callbacks.onDragEnd();
      }
    };
  };

  const destroy = (): void => {
    if (activeDrag) {
      resetPaneDragVisuals();
      callbacks.onDragEnd();
    }

    clearDocumentListeners();
    activeDrag = null;
    isFinishing = false;

    for (const cleanup of handleCleanups.values()) cleanup();
    handleCleanups.clear();
  };

  return { registerHandle, destroy };
}

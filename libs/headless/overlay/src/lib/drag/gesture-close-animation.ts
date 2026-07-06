/**
 * Animates pane inline transform from current offset to fully off-screen.
 * Shared by drawer (and future snackbar) gesture close paths.
 */

import { getGlobal, prefersReducedMotion } from '@nexora-ui/core';

import type { DragDismissAxis } from './drag-dismiss-vector';
import { applyDragTransform } from './drag-pane-transform';

export interface GestureCloseAnimationArgs {
  readonly pane: HTMLElement;
  readonly backdrop: HTMLElement | null;
  readonly axis: DragDismissAxis;
  readonly offScreenOffsetPx: number;
  readonly durationMs: number;
}

export function runGestureCloseAnimation(args: GestureCloseAnimationArgs): Promise<void> {
  const { pane, backdrop, axis, offScreenOffsetPx, durationMs } = args;

  if (prefersReducedMotion() || durationMs <= 0) {
    applyDragTransform(pane, axis, offScreenOffsetPx);

    return Promise.resolve();
  }

  const win = getGlobal();

  if (!win?.requestAnimationFrame) {
    applyDragTransform(pane, axis, offScreenOffsetPx);

    return Promise.resolve();
  }

  pane.style.transition = `transform ${durationMs}ms ease`;

  if (backdrop) {
    backdrop.style.transition = `opacity ${durationMs}ms ease`;
    backdrop.style.opacity = '0';
  }

  return new Promise((resolve) => {
    let resolved = false;

    const done = (): void => {
      if (resolved) return;
      resolved = true;
      pane.removeEventListener('transitionend', onEnd);
      clearTimeout(tid);
      resolve();
    };

    const onEnd = (e: TransitionEvent): void => {
      if (e.target !== pane || e.propertyName !== 'transform') return;
      done();
    };

    win.requestAnimationFrame(() => {
      applyDragTransform(pane, axis, offScreenOffsetPx);
    });

    pane.addEventListener('transitionend', onEnd);

    const tid = setTimeout(done, durationMs + 50);
  });
}

export interface SnapBackAnimationArgs {
  readonly pane: HTMLElement;
  readonly axis: DragDismissAxis;
  readonly durationMs: number;
}

export function runSnapBackAnimation(args: SnapBackAnimationArgs): Promise<void> {
  const { pane, axis, durationMs } = args;

  if (prefersReducedMotion() || durationMs <= 0) {
    pane.style.removeProperty('transform');
    pane.style.removeProperty('transition');

    return Promise.resolve();
  }

  const win = getGlobal();

  if (!win?.requestAnimationFrame) {
    pane.style.removeProperty('transform');
    pane.style.removeProperty('transition');

    return Promise.resolve();
  }

  pane.style.transition = `transform ${durationMs}ms ease`;

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

    const onEnd = (e: TransitionEvent): void => {
      if (e.target !== pane || e.propertyName !== 'transform') return;
      done();
    };

    win.requestAnimationFrame(() => {
      applyDragTransform(pane, axis, 0);
    });

    pane.addEventListener('transitionend', onEnd);

    const tid = setTimeout(done, durationMs + 50);
  });
}

/** Clears inline drag styles so consumer CSS classes can take over again. */
export function clearDragInlineStyles(pane: HTMLElement, backdrop: HTMLElement | null): void {
  pane.classList.remove(PANE_DRAGGING_CLASS);
  pane.style.removeProperty('transition');
  pane.style.removeProperty('transform');
  backdrop?.style.removeProperty('transition');
  backdrop?.style.removeProperty('opacity');
}

export const PANE_DRAGGING_CLASS = 'nxr-overlay-pane--dragging';

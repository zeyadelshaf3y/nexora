import { getGlobal, prefersReducedMotion } from '@nexora-ui/core';

import {
  BACKDROP_CLOSING_CLASS,
  BACKDROP_ENTERING_CLASS,
  BACKDROP_OPEN_CLASS,
  PANE_CLOSING_CLASS,
  PANE_ENTERING_CLASS,
  PANE_OPEN_CLASS,
} from './overlay-pane-styling';

/** Moves pane/backdrop from entering classes to open classes. */
export function transitionOverlayToOpenState(
  pane: HTMLElement,
  backdrop: HTMLElement | null,
): void {
  pane.classList.remove(PANE_ENTERING_CLASS);
  pane.classList.add(PANE_OPEN_CLASS);

  if (backdrop) {
    backdrop.classList.remove(BACKDROP_ENTERING_CLASS);
    backdrop.classList.add(BACKDROP_OPEN_CLASS);
  }
}

/** Moves pane/backdrop from open classes to closing classes (before {@link waitForCloseAnimation}). */
export function transitionOverlayToClosingState(
  pane: HTMLElement,
  backdrop: HTMLElement | null,
): void {
  pane.classList.remove(PANE_OPEN_CLASS);
  pane.classList.add(PANE_CLOSING_CLASS);

  if (backdrop) {
    backdrop.classList.remove(BACKDROP_OPEN_CLASS);
    backdrop.classList.add(BACKDROP_CLOSING_CLASS);
  }
}

export interface ScheduleOverlayEnterAnimationArgs {
  pane: HTMLElement;
  backdrop: HTMLElement | null;
  /** When true, the overlay was closed or the pane reference changed — skip remaining work. */
  isAborted: () => boolean;
  applyPosition: () => void;
  /** Optional second-frame reposition (e.g. host-contained overlays). */
  applyPositionSecondFrame?: () => void;
  applyTransformOrigin: () => void;
}

/**
 * After initial layout, flips pane/backdrop from entering → open (double rAF unless reduced motion).
 * Matches previous {@link OverlayRefImpl} behavior: no-op when `requestAnimationFrame` is missing.
 */
export function scheduleOverlayEnterAnimation(args: ScheduleOverlayEnterAnimationArgs): void {
  const {
    pane,
    backdrop,
    isAborted,
    applyPosition,
    applyPositionSecondFrame,
    applyTransformOrigin,
  } = args;

  if (prefersReducedMotion()) {
    applyPosition();
    applyTransformOrigin();
    transitionOverlayToOpenState(pane, backdrop);

    return;
  }

  const win = getGlobal();

  if (!win?.requestAnimationFrame) return;

  win.requestAnimationFrame(() => {
    if (isAborted()) return;

    applyPosition();
    void pane.offsetHeight;

    win.requestAnimationFrame(() => {
      if (isAborted()) return;

      applyPositionSecondFrame?.();
      applyTransformOrigin();
      transitionOverlayToOpenState(pane, backdrop);
    });
  });
}

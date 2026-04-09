/**
 * Pure helpers for overlay pane/backdrop DOM: CSS classes, inline styles, and close animation.
 * Keeps styling and animation logic out of OverlayRefImpl (SRP).
 * @internal
 */

/** CSS class for the overlay pane. */
export const PANE_CLASS = 'nxr-overlay-pane';
/** CSS class for the backdrop. */
export const BACKDROP_CLASS = 'nxr-overlay-backdrop';

/** Entering state (before open animation completes). */
export const PANE_ENTERING_CLASS = 'nxr-overlay-pane--entering';
export const BACKDROP_ENTERING_CLASS = 'nxr-overlay-backdrop--entering';

/** Open state (visible). */
export const PANE_OPEN_CLASS = 'nxr-overlay-pane--open';
export const BACKDROP_OPEN_CLASS = 'nxr-overlay-backdrop--open';

/** Closing state (close animation in progress). */
export const PANE_CLOSING_CLASS = 'nxr-overlay-pane--closing';
export const BACKDROP_CLOSING_CLASS = 'nxr-overlay-backdrop--closing';

/** Re-export from central constants for backward compatibility. */
export { DEFAULT_CLOSE_ANIMATION_MS } from '../defaults/constants';

/**
 * Waits for the pane (and optionally backdrop) close transition to finish, or a timeout.
 * Resolves when the pane's transitionend fires or after durationMs, whichever comes first.
 */
export function waitForCloseAnimation(
  pane: HTMLElement,
  backdrop: HTMLElement | null,
  durationMs: number,
): Promise<void> {
  return new Promise((resolve) => {
    let resolved = false;
    let paneDone = false;
    let backdropDone = backdrop == null;

    const done = (): void => {
      if (resolved) return;
      if (!paneDone || !backdropDone) return;

      resolved = true;
      pane.removeEventListener('transitionend', onPaneEnd);

      if (backdrop) backdrop.removeEventListener('transitionend', onBackdropEnd);

      clearTimeout(tid);
      resolve();
    };

    const onPaneEnd = (e: TransitionEvent): void => {
      if (e.target !== pane) return;
      paneDone = true;
      done();
    };

    const onBackdropEnd = (e: TransitionEvent): void => {
      if (e.target !== backdrop) return;
      backdropDone = true;
      done();
    };

    pane.addEventListener('transitionend', onPaneEnd);

    if (backdrop) backdrop.addEventListener('transitionend', onBackdropEnd);

    const tid = setTimeout(() => {
      paneDone = true;
      backdropDone = true;
      done();
    }, durationMs);
  });
}

function addWhitespaceSeparatedClasses(el: HTMLElement, value: string | undefined): void {
  if (!value) return;

  const parts = value.split(/\s+/);

  for (const t of parts) {
    if (t) el.classList.add(t);
  }
}

/**
 * Adds class tokens to an element. Accepts a string or array of strings (space-separated tokens allowed).
 */
export function addClasses(el: HTMLElement, classes: string | string[] | undefined): void {
  if (!classes) return;

  if (Array.isArray(classes)) {
    for (const token of classes) {
      addWhitespaceSeparatedClasses(el, token);
    }
  } else {
    addWhitespaceSeparatedClasses(el, classes);
  }
}

/**
 * Applies inline styles from a record. Keys are camelCased and converted to kebab-case.
 */
export function applyStyles(el: HTMLElement, styles: Record<string, string> | undefined): void {
  if (!styles) return;

  for (const key in styles) {
    if (!Object.prototype.hasOwnProperty.call(styles, key)) continue;

    el.style.setProperty(
      key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`),
      styles[key],
    );
  }
}

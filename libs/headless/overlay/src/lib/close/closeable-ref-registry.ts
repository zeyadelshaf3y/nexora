/**
 * Internal registry that maps overlay pane elements to their closeable ref.
 *
 * Both {@link OverlayRefImpl} and `SnackbarRefImpl` register here so
 * the close directives can walk the DOM to find the nearest pane and close it —
 * no injection tokens required, works with both component and template content.
 *
 * @internal
 */

import { OVERLAY_SELECTOR_PANE } from '../defaults/overlay-attributes';
import { CLOSE_REASON_PROGRAMMATIC } from '../ref/close-reason';
import type { OverlayRef } from '../ref/overlay-ref';

/** A ref that can be closed. Used by close directives to walk the DOM and close the nearest overlay. */
export type CloseableRef = { close(value?: unknown): unknown };

const PANE_REF = new WeakMap<HTMLElement, CloseableRef>();

/** Associates a pane element with a closeable ref. Call again to override (e.g. snackbar). */
export function registerCloseableRef(pane: HTMLElement, ref: CloseableRef): void {
  PANE_REF.set(pane, ref);
}

/** Removes the association. Call when the pane is removed from the DOM. */
export function unregisterCloseableRef(pane: HTMLElement): void {
  PANE_REF.delete(pane);
}

/**
 * Walks up from `el` to find the nearest overlay pane, then returns the
 * registered closeable ref. Returns `null` if not inside an overlay pane.
 */
export function closestCloseableRef(el: HTMLElement): CloseableRef | null {
  const pane = el.closest(OVERLAY_SELECTOR_PANE) as HTMLElement | null;

  return pane ? (PANE_REF.get(pane) ?? null) : null;
}

function isOverlayRef(r: CloseableRef): r is OverlayRef {
  return r != null && typeof (r as OverlayRef).getParentRef === 'function';
}

/** Overlay ref for the nearest overlay pane containing `el`. Used to set parentRef when opening nested overlays. */
export function getContainingOverlayRef(el: HTMLElement): OverlayRef | null {
  const ref = closestCloseableRef(el);

  return ref && isOverlayRef(ref) ? ref : null;
}

/**
 * Shared click handler for close directives (`nxrDialogClose`, `nxrDrawerClose`,
 * `nxrOverlayClose`).  Walks up from `el` to find the nearest closeable ref and
 * closes it with the given `reason`.
 *
 * @internal
 */
export function handleCloseClick(el: HTMLElement, reason: unknown, event: Event): void {
  const ref = closestCloseableRef(el);

  if (!ref) return;

  event.preventDefault();
  event.stopPropagation();
  ref.close(reason ?? CLOSE_REASON_PROGRAMMATIC);
}

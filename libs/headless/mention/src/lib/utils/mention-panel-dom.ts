/**
 * DOM helpers for the suggestion panel: keep the contenteditable focused when picking options
 * (desktop mouse + mobile touch) and detect when deferred blur-close should be skipped.
 */

import { NXR_MENTION_PANEL_HOST_SELECTOR } from '../constants/mention-constants';

const FOCUSABLE_INPUT_TYPES = new Set(['text', 'search', 'email', 'url', 'tel', 'number', '']);

/**
 * When `true`, the event target is a real typing control or link — do **not** call
 * `preventDefault()` on `mousedown` / `touchstart` so users can focus inputs inside a custom panel.
 */
export function targetNeedsPointerDefaultForFocus(target: EventTarget | null): boolean {
  const el = target instanceof Element ? target : null;

  if (!el) return false;
  if (el.closest('[contenteditable="true"]')) return true;

  const input = el.closest('input');

  if (input) {
    const inputType = (input as HTMLInputElement).type;

    if (FOCUSABLE_INPUT_TYPES.has(inputType)) {
      return true;
    }
  }

  if (el.closest('textarea, select')) return true;
  if (el.closest('a[href]')) return true;

  return false;
}

/**
 * `true` if `element` sits inside the overlay pane (by class) or the internal `nxr-mention-panel-host`.
 * Pass `document.activeElement` after editor `blur`, or any node while testing.
 */
export function isElementWithinMentionSuggestionUi(
  element: Element | null,
  mentionOverlayPaneClass: string,
): boolean {
  if (!element) return false;

  const paneSelector = `.${mentionOverlayPaneClass}`;

  return (
    element.closest(paneSelector) != null ||
    element.closest(NXR_MENTION_PANEL_HOST_SELECTOR) != null
  );
}

function preventPanelPointerStealingFocus(event: Event): void {
  if (targetNeedsPointerDefaultForFocus(event.target)) return;

  event.preventDefault();
}

/** Primary-button mouse only; capture phase on panel host. */
export function handlePanelMouseDownForFocusRetention(event: Event): void {
  if (!(event instanceof MouseEvent) || event.button !== 0) return;

  preventPanelPointerStealingFocus(event);
}

/** Single-finger touch; must use `{ passive: false }` so `preventDefault` works on iOS. */
export function handlePanelTouchStartForFocusRetention(event: TouchEvent): void {
  if (event.touches.length !== 1) return;

  preventPanelPointerStealingFocus(event);
}

/**
 * Creates resize/scroll listeners that trigger a reposition callback (e.g. RAF-throttled).
 * Returns an array of cleanup functions. Single responsibility: listen to layout changes and notify.
 * @internal
 */

import { getGlobal, listen, scrollParents } from '@nexora-ui/core';

import type { OverlayConfig } from './overlay-config';
import { overlayHasAnchorOption, overlayHasHostOption } from './overlay-resolve-elements';

export interface RepositionListenersParams {
  /** Callback to run when reposition is needed (e.g. throttled). */
  readonly onReposition: () => void;
  /** Overlay config (used for host and anchor to decide which listeners to add). */
  readonly config: OverlayConfig;
  /** Current host element (pane parent). Null until attached. */
  readonly host: HTMLElement | null;
  /** Returns the current anchor element, if any. */
  readonly getAnchorElement: () => HTMLElement | undefined;
}

/**
 * Subscribes to window/visualViewport resize and scroll; for anchored overlays also
 * subscribes to the anchor's scroll parents so the panel repositions with the trigger.
 * When a host is set, also subscribes to host and scroll parents inside the host.
 * Returns cleanup functions; call each to remove listeners.
 */
export function createRepositionListeners(params: RepositionListenersParams): Array<() => void> {
  const { onReposition, config, host, getAnchorElement } = params;
  const cleanups: Array<() => void> = [];
  const subscribedTargets = new Set<EventTarget>();
  const PASSIVE_SCROLL: AddEventListenerOptions = { passive: true };
  const PASSIVE_SCROLL_CAPTURE: AddEventListenerOptions = { passive: true, capture: true };

  const addScrollListener = (
    target: EventTarget,
    options?: AddEventListenerOptions | boolean,
  ): void => {
    if (subscribedTargets.has(target)) return;
    subscribedTargets.add(target);
    cleanups.push(listen(target, 'scroll', onReposition, options));
  };

  const win = getGlobal();
  if (!win) return cleanups;

  addWindowRepositionListeners(win, onReposition, cleanups);

  if (overlayHasAnchorOption(config)) {
    addScrollListener(win, PASSIVE_SCROLL_CAPTURE);
    addAnchorScrollParentListeners(getAnchorElement(), addScrollListener, PASSIVE_SCROLL);
  }

  if (overlayHasHostOption(config) && host) {
    addScrollListener(host, PASSIVE_SCROLL);
    const anchorEl = getAnchorElement();

    if (anchorEl) {
      for (const p of scrollParents(anchorEl)) {
        if (p === host) continue;

        if (host.contains(p)) {
          addScrollListener(p, PASSIVE_SCROLL);
        }
      }
    }
  }

  return cleanups;
}

function addWindowRepositionListeners(
  win: Window & typeof globalThis,
  onReposition: () => void,
  cleanups: Array<() => void>,
): void {
  cleanups.push(listen(win, 'resize', onReposition));

  const vv = win.visualViewport;

  if (vv) {
    cleanups.push(listen(vv, 'resize', onReposition));
    cleanups.push(listen(vv, 'scroll', onReposition));
  }
}

function addAnchorScrollParentListeners(
  anchorEl: HTMLElement | undefined,
  addScrollListener: (target: EventTarget, options?: AddEventListenerOptions | boolean) => void,
  options: AddEventListenerOptions,
): void {
  // Listen to anchor's scroll parents so the panel repositions with the trigger
  // when the user scrolls inside any scrollable container that contains it.
  if (!anchorEl) return;

  for (const p of scrollParents(anchorEl)) {
    addScrollListener(p, options);
  }
}

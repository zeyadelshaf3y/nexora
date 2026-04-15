import { createRafThrottled, observeResize } from '@nexora-ui/core';

import type { OverlayConfig } from './overlay-config';
import { overlayHasAnchorOption } from './overlay-resolve-elements';
import { createRepositionListeners } from './reposition-listeners';

export interface OverlayRepositionRegistrations {
  /** Cancel the shared RAF-throttled reposition (call before running listener cleanups). */
  cancelThrottledReposition: () => void;
  restCleanups: Array<() => void>;
}

/**
 * RAF-throttled reposition plus scroll/resize subscriptions (and optional pane resize observer).
 */
export function createOverlayRepositionRegistrations(args: {
  applyPosition: () => void;
  config: OverlayConfig;
  host: HTMLElement | null;
  getAnchorElement: () => HTMLElement | undefined;
  pane: HTMLElement | null;
}): OverlayRepositionRegistrations {
  const throttled = createRafThrottled(args.applyPosition);
  const restCleanups = createRepositionListeners({
    onReposition: throttled.run,
    config: args.config,
    host: args.host,
    getAnchorElement: args.getAnchorElement,
  });

  if (overlayHasAnchorOption(args.config) && args.pane) {
    restCleanups.push(observeResize(args.pane, throttled.run));
  }

  return {
    cancelThrottledReposition: () => throttled.cancel(),
    restCleanups,
  };
}

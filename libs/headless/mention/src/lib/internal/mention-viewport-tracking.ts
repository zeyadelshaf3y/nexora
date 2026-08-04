/**
 * Subscribes to window + visualViewport scroll/resize so the mention virtual
 * anchor can track the caret when the soft keyboard opens or the page pans.
 */

import { listen } from '@nexora-ui/core';

/**
 * Invokes `onChange` when the layout or visual viewport moves/resizes.
 * Returns a cleanup that removes all listeners.
 */
export function subscribeMentionViewportChanges(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const cleanups: Array<() => void> = [
    listen(window, 'scroll', onChange, { passive: true, capture: true }),
    listen(window, 'resize', onChange),
  ];

  const vv = window.visualViewport;
  if (vv) {
    cleanups.push(listen(vv, 'resize', onChange));
    cleanups.push(listen(vv, 'scroll', onChange));
  }

  return () => {
    for (const cleanup of cleanups) {
      cleanup();
    }
  };
}

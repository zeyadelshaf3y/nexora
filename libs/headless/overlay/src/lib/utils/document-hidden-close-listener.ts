import { listen } from '@nexora-ui/core';

/**
 * Listens for `visibilitychange` on `doc` and invokes `onHidden` when `doc.hidden` is true
 * (tab hidden, window minimized, or browsing context suspended). Use while a non-modal
 * anchored overlay is open so pointer/hover state cannot desync from the DOM after the user
 * leaves the tab or frame.
 *
 * One listener per document; pair with returned cleanup on overlay close. SSR-safe via `listen`.
 *
 * @internal
 */
export function createDocumentHiddenCloseListener(doc: Document, onHidden: () => void): () => void {
  return listen(doc, 'visibilitychange', () => {
    if (doc.hidden) onHidden();
  });
}

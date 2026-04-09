/**
 * Plain text insertion at collapsed caret with browser-first strategy
 * (`execCommand('insertText')`), then fallback DOM insertion.
 */
import { type NgZone } from '@angular/core';

import { emitEditorInputEvent, getSelectionInRoot } from './contenteditable-events';

export function insertTextAtCaretInEditor(params: {
  root: HTMLElement;
  ngZone: NgZone;
  text: string;
  normalizeEditorTextSpacing: (root: HTMLElement) => void;
  invalidateSnapshotCache: () => void;
}): void {
  const { root, ngZone, text, normalizeEditorTextSpacing, invalidateSnapshotCache } = params;

  if (text.length === 0) return;

  invalidateSnapshotCache();

  const doc = root.ownerDocument;
  const selection = getSelectionInRoot(root);

  if (!selection) return;

  ngZone.runOutsideAngular(() => {
    if (!selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    const wasInsertedByExecCommand = doc.execCommand?.('insertText', false, text) === true;

    if (!wasInsertedByExecCommand) {
      range.deleteContents();

      const textNode = doc.createTextNode(text);
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    emitEditorInputEvent(root);
    normalizeEditorTextSpacing(root);
    invalidateSnapshotCache();
  });
}

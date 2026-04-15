/**
 * Enter/newline behavior for the contenteditable line model:
 * wraps loose roots, normalizes boundary quirks, splits current line,
 * and places caret at the new row start.
 */
import { type NgZone } from '@angular/core';

import { ATTR_MENTION_ID } from './contenteditable-dom-constants';
import { emitEditorInputEvent, getSelectionInRoot } from './contenteditable-events';
import {
  ensureRootLineModel,
  findLineBlockContainingNode,
  isRootLineBlock,
} from './contenteditable-line-model';

export function insertLineBreakInEditor(params: {
  root: HTMLElement;
  ngZone: NgZone;
  normalizeEditorTextSpacing: (root: HTMLElement) => void;
  invalidateSnapshotCache: () => void;
}): void {
  const { root, ngZone, normalizeEditorTextSpacing, invalidateSnapshotCache } = params;

  invalidateSnapshotCache();

  const doc = root.ownerDocument;
  const selection = getSelectionInRoot(root);

  if (!selection) return;

  const setCollapsedSelection = (nextRange: Range): void => {
    nextRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(nextRange);
  };

  const getLineEndRange = (lineElement: HTMLElement): Range => {
    const lineEndRange = doc.createRange();
    const lastChild = lineElement.lastChild;

    if (lastChild?.nodeType === Node.TEXT_NODE) {
      const textNode = lastChild as Text;
      lineEndRange.setStart(textNode, textNode.length);
    } else {
      lineEndRange.setStart(lineElement, lineElement.childNodes.length);
    }

    return lineEndRange;
  };

  ngZone.runOutsideAngular(() => {
    const preWrapRange = selection.getRangeAt(0).cloneRange();
    const preWrapRootBoundaryOffset =
      preWrapRange.collapsed && preWrapRange.startContainer === root
        ? preWrapRange.startOffset
        : null;
    const justWrappedLooseContent = ensureRootLineModel(root, doc);

    const liveSelection = doc.getSelection();
    if (!liveSelection || liveSelection.rangeCount === 0) return;
    let workRange = liveSelection.getRangeAt(0).cloneRange();
    if (!root.contains(workRange.startContainer)) return;

    if (
      justWrappedLooseContent &&
      preWrapRootBoundaryOffset != null &&
      root.childNodes.length === 1 &&
      isRootLineBlock(root.firstChild, root)
    ) {
      const lineRow = root.firstChild;
      const rowOffset = Math.max(0, Math.min(preWrapRootBoundaryOffset, lineRow.childNodes.length));
      const mappedRange = doc.createRange();
      mappedRange.setStart(lineRow, rowOffset);
      setCollapsedSelection(mappedRange);
      workRange = liveSelection.getRangeAt(0).cloneRange();
    }

    if (
      justWrappedLooseContent &&
      workRange.collapsed &&
      workRange.startContainer === root &&
      workRange.startOffset === 0 &&
      root.childNodes.length === 1
    ) {
      const lineRow = root.firstChild;
      if (isRootLineBlock(lineRow, root)) {
        const rowEl = lineRow as HTMLElement;
        const endRange = getLineEndRange(rowEl);
        setCollapsedSelection(endRange);
        workRange = liveSelection.getRangeAt(0).cloneRange();
      }
    }

    if (
      workRange.collapsed &&
      workRange.startContainer === root &&
      workRange.startOffset > 0 &&
      workRange.startOffset <= root.childNodes.length
    ) {
      const lineRow = root.childNodes[workRange.startOffset - 1];
      if (isRootLineBlock(lineRow, root)) {
        const rowEl = lineRow as HTMLElement;
        const normalizedRange = getLineEndRange(rowEl);
        setCollapsedSelection(normalizedRange);
        workRange = liveSelection.getRangeAt(0).cloneRange();
      }
    }

    if (!workRange.collapsed) {
      workRange.deleteContents();
      if (!liveSelection.rangeCount) return;
      workRange = liveSelection.getRangeAt(0).cloneRange();
    }

    if (!root.contains(workRange.startContainer)) return;

    let lineBlock = findLineBlockContainingNode(workRange.startContainer, root);
    if (!lineBlock) {
      lineBlock = root.querySelector(':scope > div, :scope > p') as HTMLElement | null;
    }
    if (!lineBlock) return;

    const newLine = doc.createElement('div');
    const splitRange = doc.createRange();
    splitRange.setStart(workRange.startContainer, workRange.startOffset);
    splitRange.setEnd(lineBlock, lineBlock.childNodes.length);

    const noMeaningfulTrailing = (): boolean => {
      const fragment = splitRange.cloneContents();
      if (fragment.querySelector(`[${ATTR_MENTION_ID}]`)) return false;
      const text = (fragment.textContent || '').replace(/\u00A0/g, ' ').trim();

      return text.length === 0;
    };

    if (noMeaningfulTrailing()) {
      newLine.appendChild(doc.createElement('br'));
      if (lineBlock.parentNode === root) {
        root.insertBefore(newLine, lineBlock.nextSibling);
      } else {
        root.appendChild(newLine);
      }
    } else {
      const trailing = splitRange.extractContents();
      newLine.appendChild(trailing);

      const hasVisibleContent = (el: HTMLElement): boolean => {
        if (el.querySelector(`[${ATTR_MENTION_ID}]`)) return true;
        const text = (el.textContent || '').replace(/\u00A0/g, ' ').trim();

        return text.length > 0;
      };

      if (!hasVisibleContent(newLine)) {
        newLine.replaceChildren(doc.createElement('br'));
      }

      if (!hasVisibleContent(lineBlock)) {
        lineBlock.replaceChildren(doc.createElement('br'));
      }

      if (lineBlock.parentNode === root) {
        root.insertBefore(newLine, lineBlock.nextSibling);
      } else {
        root.appendChild(newLine);
      }
    }

    const caretRange = doc.createRange();
    const first = newLine.firstChild;
    if (first?.nodeType === Node.TEXT_NODE) {
      caretRange.setStart(first, 0);
    } else {
      caretRange.setStart(newLine, 0);
    }
    setCollapsedSelection(caretRange);

    emitEditorInputEvent(root);
    normalizeEditorTextSpacing(root);
    invalidateSnapshotCache();
  });
}

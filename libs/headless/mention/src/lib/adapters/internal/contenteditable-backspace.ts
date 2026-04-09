/**
 * Backspace/delete behavior around mention chips:
 * - merges lines at start-of-line
 * - removes chip immediately before caret
 * - preserves visible caret when chips are adjacent
 */
import { ATTR_MENTION_ID } from './contenteditable-dom-constants';
import { emitEditorInputEvent, getSelectionInRoot } from './contenteditable-events';
import {
  findLineBlockContainingNode,
  isPlaceholderLineBr,
  isRootLineBlock,
} from './contenteditable-line-model';

function isMentionElement(el: Element): boolean {
  return el.hasAttribute(ATTR_MENTION_ID);
}

export function removeMentionBeforeCaretInEditor(params: {
  root: HTMLElement;
  invalidateSnapshotCache: () => void;
  selectStartSuppressedRef: { value: boolean };
}): boolean {
  const { root, invalidateSnapshotCache, selectStartSuppressedRef } = params;

  invalidateSnapshotCache();

  const doc = root.ownerDocument;
  const selection = getSelectionInRoot(root);

  if (!selection) return false;

  const range = selection.getRangeAt(0);

  if (!range.collapsed || !root.contains(range.startContainer)) return false;

  const startContainer = range.startContainer;
  const startOffset = range.startOffset;

  let candidate: Node | null = null;

  const hasTextContent = (node: Node | null | undefined): boolean =>
    node?.nodeType === Node.TEXT_NODE && (node.textContent?.length ?? 0) > 0;

  const isEmptyTextNode = (node: Node | null | undefined): boolean =>
    node?.nodeType === Node.TEXT_NODE && (node.textContent?.length ?? 0) === 0;

  const collapseLiveSelectionIfNeeded = (): void => {
    const liveSelection = doc.getSelection();
    const hasSelectionRange = !!liveSelection && liveSelection.rangeCount > 0;

    if (!hasSelectionRange) return;

    const currentRange = liveSelection.getRangeAt(0);

    if (currentRange.collapsed) return;

    currentRange.collapse(true);
  };

  const placeCaretAtBoundary = (container: Node, offset: number): void => {
    const newRange = doc.createRange();

    if (container.nodeType === Node.ELEMENT_NODE) {
      const containerElement = container as Element;
      const leftSibling = offset > 0 ? containerElement.childNodes[offset - 1] : null;
      const rightSibling =
        offset < containerElement.childNodes.length ? containerElement.childNodes[offset] : null;

      const bothAreMentionElements =
        leftSibling instanceof Element &&
        rightSibling instanceof Element &&
        isMentionElement(leftSibling) &&
        isMentionElement(rightSibling);

      if (bothAreMentionElements) {
        const spacer = doc.createTextNode('');
        containerElement.insertBefore(spacer, rightSibling);
        newRange.setStart(spacer, 0);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);

        return;
      }
    }

    newRange.setStart(container, offset);
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);
  };

  const mergeLineWithPrevious = (previousLine: HTMLElement, currentLine: HTMLElement): boolean => {
    if (previousLine === currentLine) return false;
    if (previousLine.parentNode !== root || currentLine.parentNode !== root) return false;

    if (isPlaceholderLineBr(previousLine.firstChild, root)) {
      previousLine.firstChild?.remove();
    }

    const caretOffset = previousLine.childNodes.length;
    const currentHasOnlyPlaceholder =
      currentLine.childNodes.length === 1 && isPlaceholderLineBr(currentLine.firstChild, root);

    if (!currentHasOnlyPlaceholder) {
      while (currentLine.firstChild) {
        previousLine.appendChild(currentLine.firstChild);
      }
    }

    currentLine.remove();

    if (!previousLine.firstChild) {
      previousLine.appendChild(doc.createElement('br'));
    }

    placeCaretAtBoundary(previousLine, Math.min(caretOffset, previousLine.childNodes.length));
    emitEditorInputEvent(root);

    return true;
  };

  const resolveCurrentLineAtCaret = (): HTMLElement | null => {
    if (startContainer.nodeType === Node.ELEMENT_NODE) {
      const startElement = startContainer as Element;
      const isAtStartOfLineBlock = isRootLineBlock(startElement, root) && startOffset === 0;
      const isWithinRootBetweenChildren =
        startElement === root && startOffset > 0 && startOffset < root.childNodes.length;

      if (isAtStartOfLineBlock) {
        return startElement;
      }

      if (isWithinRootBetweenChildren) {
        const candidateLine = root.childNodes[startOffset];

        if (isRootLineBlock(candidateLine, root)) {
          return candidateLine;
        }
      }
    }

    if (startContainer.nodeType === Node.TEXT_NODE && startOffset === 0) {
      const line = findLineBlockContainingNode(startContainer, root);

      if (line && line.firstChild === startContainer) {
        return line;
      }
    }

    return null;
  };

  const resolveMentionCandidateBeforeCaret = (): Node | null => {
    if (startContainer.nodeType === Node.TEXT_NODE) {
      if (startOffset > 0) return null;

      const previousSibling = startContainer.previousSibling;
      const previousParentSibling = startContainer.parentNode?.previousSibling ?? null;

      return previousSibling ?? previousParentSibling;
    }

    if (startContainer.nodeType !== Node.ELEMENT_NODE) {
      return null;
    }

    const startElement = startContainer as Element;
    let resolvedCandidate: Node | null = null;

    if (startOffset > 0) {
      let leftSibling: ChildNode | null = startElement.childNodes[startOffset - 1] ?? null;

      if (hasTextContent(leftSibling)) {
        return null;
      }

      while (isEmptyTextNode(leftSibling)) {
        leftSibling = leftSibling?.previousSibling ?? null;
      }

      if (leftSibling instanceof Element && isMentionElement(leftSibling)) {
        resolvedCandidate = leftSibling;
      }
    }

    const isAtStartWithChildren = startOffset === 0 && startElement.childNodes.length > 0;

    if (resolvedCandidate == null && isAtStartWithChildren) {
      const firstChild = startElement.childNodes[0];

      if (
        firstChild &&
        firstChild.nodeType === Node.ELEMENT_NODE &&
        isMentionElement(firstChild as Element)
      ) {
        resolvedCandidate = firstChild;
      }
    }

    if (resolvedCandidate == null && startOffset > 0) {
      const previousChild = startElement.childNodes[startOffset - 1];
      const nextChild = startElement.childNodes[startOffset];
      const isMentionBeforeCaret =
        previousChild instanceof Element && isMentionElement(previousChild);
      const hasTextAfterCaret = hasTextContent(nextChild);

      if (isMentionBeforeCaret && hasTextAfterCaret) {
        return null;
      }
    }

    if (resolvedCandidate == null) {
      resolvedCandidate =
        startOffset > 0 ? (startElement.childNodes[startOffset - 1] ?? null) : null;
    }

    return resolvedCandidate;
  };

  const currentLine = resolveCurrentLineAtCaret();
  if (currentLine) {
    const previousNode = currentLine.previousSibling;

    if (isRootLineBlock(previousNode, root)) {
      return mergeLineWithPrevious(previousNode, currentLine);
    }
  }

  candidate = resolveMentionCandidateBeforeCaret();

  if (candidate == null) return false;

  const candidateBeforeCaret =
    candidate?.nodeType === Node.TEXT_NODE ? candidate.previousSibling : candidate;

  if (!(candidateBeforeCaret instanceof Element) || !isMentionElement(candidateBeforeCaret))
    return false;

  const parent = candidateBeforeCaret.parentNode;

  if (!parent) return false;

  const indexInParent = Array.prototype.indexOf.call(parent.childNodes, candidateBeforeCaret);
  selectStartSuppressedRef.value = true;

  try {
    candidateBeforeCaret.remove();

    const safeOffset = Math.max(0, Math.min(indexInParent, parent.childNodes.length));
    placeCaretAtBoundary(parent, safeOffset);

    collapseLiveSelectionIfNeeded();

    emitEditorInputEvent(root);
    invalidateSnapshotCache();

    return true;
  } finally {
    queueMicrotask(() => {
      selectStartSuppressedRef.value = false;
    });
  }
}

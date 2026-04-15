import { ATTR_MENTION_ID, LINE_BREAK_TAG } from './contenteditable-dom-constants';
import {
  isEmptyLinePlaceholderBr,
  isEmptyRootLineBlock,
  isRootLineBlock,
  linearOffsetAtEditingRootBoundary,
  linearOffsetWithinLineChildBoundary,
} from './contenteditable-line-model';

const BLOCK_TAGS = new Set([
  'P',
  'DIV',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'LI',
  'SECTION',
  'ARTICLE',
  'HEADER',
  'FOOTER',
  'NAV',
  'MAIN',
  'ASIDE',
  'BLOCKQUOTE',
  'PRE',
]);

function isBlockElement(el: Element): boolean {
  return BLOCK_TAGS.has(el.tagName);
}

function isMentionElement(el: Element): boolean {
  return el.hasAttribute(ATTR_MENTION_ID);
}

function nodeText(node: Node): string {
  return node.textContent || '';
}

function normalizeNbsp(text: string): string {
  return text.replace(/\u00A0/g, ' ');
}

export interface WalkResult {
  readonly text: string;
  readonly anchorIdx: number | null;
  readonly focusIdx: number | null;
  readonly rangeStartNode: Node | null;
  readonly rangeStartOffset: number;
  readonly rangeEndNode: Node | null;
  readonly rangeEndOffset: number;
}

export function walkSelectionModel(
  root: Node,
  selection: Selection | null,
  state: { readonly rangeStart?: number; readonly rangeEnd?: number },
): WalkResult {
  let text = '';
  let anchorIdx: number | null = null;
  let focusIdx: number | null = null;
  let rangeStartNode: Node | null = null;
  let rangeStartOffset = 0;
  let rangeEndNode: Node | null = null;
  let rangeEndOffset = 0;
  const rangeStart = state.rangeStart ?? -1;
  const rangeEnd = state.rangeEnd ?? -1;
  const editingRoot = root as HTMLElement;

  function visit(node: Node): number {
    if (node.nodeType === Node.TEXT_NODE) {
      const textNodeValue = nodeText(node);
      const textNodeLength = textNodeValue.length;
      if (selection) {
        if (node === selection.anchorNode) {
          anchorIdx = text.length + Math.min(selection.anchorOffset, textNodeLength);
        }
        if (node === selection.focusNode) {
          focusIdx = text.length + Math.min(selection.focusOffset, textNodeLength);
        }
      }
      if (
        rangeStart >= 0 &&
        rangeStart <= text.length + textNodeLength &&
        rangeStartNode === null
      ) {
        rangeStartNode = node;
        rangeStartOffset = Math.min(rangeStart - text.length, textNodeLength);
      }
      if (rangeEnd >= 0 && rangeEnd <= text.length + textNodeLength && rangeEndNode === null) {
        rangeEndNode = node;
        rangeEndOffset = Math.min(rangeEnd - text.length, textNodeLength);
      }
      text += normalizeNbsp(textNodeValue);

      return textNodeLength;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return 0;
    const el = node as Element;

    if (selection) {
      if (node === selection.anchorNode && node === editingRoot) {
        anchorIdx = linearOffsetAtEditingRootBoundary(editingRoot, selection.anchorOffset);
      } else if (node === selection.anchorNode && isRootLineBlock(el, editingRoot)) {
        if (isEmptyRootLineBlock(el, editingRoot)) {
          const ao = selection.anchorOffset;
          if (ao === 0 || ao === 1) anchorIdx = text.length;
        } else {
          anchorIdx =
            text.length +
            linearOffsetWithinLineChildBoundary(
              el as HTMLElement,
              selection.anchorOffset,
              editingRoot,
            );
        }
      }
      if (node === selection.focusNode && node === editingRoot) {
        focusIdx = linearOffsetAtEditingRootBoundary(editingRoot, selection.focusOffset);
      } else if (node === selection.focusNode && isRootLineBlock(el, editingRoot)) {
        if (isEmptyRootLineBlock(el, editingRoot)) {
          const fo = selection.focusOffset;
          if (fo === 0 || fo === 1) focusIdx = text.length;
        } else {
          focusIdx =
            text.length +
            linearOffsetWithinLineChildBoundary(
              el as HTMLElement,
              selection.focusOffset,
              editingRoot,
            );
        }
      }
    }

    if (
      rangeStart >= 0 &&
      rangeStartNode === null &&
      rangeStart === text.length &&
      isEmptyRootLineBlock(el, editingRoot)
    ) {
      const ph = el.querySelector(':scope > br');
      if (ph && isEmptyLinePlaceholderBr(ph, editingRoot)) {
        rangeStartNode = ph;
        rangeStartOffset = 0;
      } else {
        rangeStartNode = el;
        rangeStartOffset = 0;
      }
    }

    if (
      rangeEnd >= 0 &&
      rangeEndNode === null &&
      rangeEnd === text.length &&
      isEmptyRootLineBlock(el, editingRoot)
    ) {
      const ph = el.querySelector(':scope > br');
      if (ph && isEmptyLinePlaceholderBr(ph, editingRoot)) {
        rangeEndNode = ph;
        rangeEndOffset = 0;
      } else {
        rangeEndNode = el;
        rangeEndOffset = 0;
      }
    }

    if (el.tagName === LINE_BREAK_TAG) {
      const placeholder = isEmptyLinePlaceholderBr(el, editingRoot);
      if (selection) {
        if (node === selection.anchorNode) {
          anchorIdx = placeholder ? text.length : text.length + Math.min(selection.anchorOffset, 1);
        }
        if (node === selection.focusNode) {
          focusIdx = placeholder ? text.length : text.length + Math.min(selection.focusOffset, 1);
        }
      }
      if (!placeholder) {
        if (rangeStart >= 0 && rangeStart <= text.length + 1 && rangeStartNode === null) {
          rangeStartNode = node;
          rangeStartOffset = Math.min(rangeStart - text.length, 1);
        }
        if (rangeEnd >= 0 && rangeEnd <= text.length + 1 && rangeEndNode === null) {
          rangeEndNode = node;
          rangeEndOffset = Math.min(rangeEnd - text.length, 1);
        }
        text += '\n';

        return 1;
      }
      if (rangeStart >= 0 && rangeStart <= text.length && rangeStartNode === null) {
        rangeStartNode = node;
        rangeStartOffset = 0;
      }
      if (rangeEnd >= 0 && rangeEnd <= text.length && rangeEndNode === null) {
        rangeEndNode = node;
        rangeEndOffset = 0;
      }

      return 0;
    }

    if (isMentionElement(el)) {
      const mentionText = nodeText(el);
      const mentionTextLength = mentionText.length;
      const parent = el.parentNode;
      const childIndex =
        parent instanceof HTMLElement ? Array.prototype.indexOf.call(parent.childNodes, el) : -1;
      const mentionStartOffset = text.length;
      const mentionEndOffset = text.length + mentionTextLength;

      if (selection) {
        if (node === selection.anchorNode) {
          anchorIdx = text.length + (selection.anchorOffset > 0 ? mentionTextLength : 0);
        }
        if (node === selection.focusNode) {
          focusIdx = text.length + (selection.focusOffset > 0 ? mentionTextLength : 0);
        }
      }

      if (rangeStart >= 0 && rangeEnd >= 0 && parent && childIndex >= 0) {
        const collapsed = rangeStart === rangeEnd;

        if (collapsed) {
          const pos = rangeStart;
          if (mentionTextLength === 0 || pos === mentionStartOffset) {
            rangeStartNode = rangeEndNode = parent;
            rangeStartOffset = rangeEndOffset = childIndex;
          } else if (pos === mentionEndOffset) {
            rangeStartNode = rangeEndNode = parent;
            rangeStartOffset = rangeEndOffset = childIndex + 1;
          } else if (pos > mentionStartOffset && pos < mentionEndOffset) {
            const inner = pos - mentionStartOffset;
            const first = el.firstChild;
            if (first?.nodeType === Node.TEXT_NODE) {
              const tn = first as Text;
              const tl = nodeText(tn).length;
              rangeStartNode = rangeEndNode = tn;
              rangeStartOffset = rangeEndOffset = Math.max(0, Math.min(inner, tl));
            } else {
              rangeStartNode = rangeEndNode = parent;
              rangeStartOffset = rangeEndOffset = childIndex;
            }
          }
        } else {
          if (rangeStartNode === null) {
            if (rangeStart === mentionStartOffset) {
              rangeStartNode = parent;
              rangeStartOffset = childIndex;
            } else if (rangeStart > mentionStartOffset && rangeStart < mentionEndOffset) {
              const inner = rangeStart - mentionStartOffset;
              const first = el.firstChild;
              if (first?.nodeType === Node.TEXT_NODE) {
                const tn = first as Text;
                const tl = nodeText(tn).length;
                rangeStartNode = tn;
                rangeStartOffset = Math.max(0, Math.min(inner, tl));
              } else {
                rangeStartNode = parent;
                rangeStartOffset = childIndex;
              }
            }
          }
          if (rangeEndNode === null) {
            if (rangeEnd === mentionEndOffset) {
              rangeEndNode = parent;
              rangeEndOffset = childIndex + 1;
            } else if (rangeEnd > mentionStartOffset && rangeEnd < mentionEndOffset) {
              const inner = rangeEnd - mentionStartOffset;
              const first = el.firstChild;
              if (first?.nodeType === Node.TEXT_NODE) {
                const tn = first as Text;
                const tl = nodeText(tn).length;
                rangeEndNode = tn;
                rangeEndOffset = Math.max(0, Math.min(inner, tl));
              } else {
                rangeEndNode = parent;
                rangeEndOffset = childIndex + 1;
              }
            }
          }
        }
      }

      text += normalizeNbsp(mentionText);

      return mentionTextLength;
    }

    let len = 0;
    const isBlock = isBlockElement(el);
    let prevWasBlock = false;

    Array.from(el.childNodes).forEach((child, i) => {
      const childIsBlock = child.nodeType === Node.ELEMENT_NODE && isBlockElement(child as Element);
      if (isBlock && i > 0 && (prevWasBlock || childIsBlock)) {
        text += '\n';
        len += 1;
      }
      len += visit(child);
      prevWasBlock = childIsBlock;
    });

    return len;
  }

  visit(root);

  return {
    text,
    anchorIdx,
    focusIdx,
    rangeStartNode,
    rangeStartOffset,
    rangeEndNode,
    rangeEndOffset,
  };
}

function rectFromCollapsedRange(range: Range): DOMRect | null {
  const rect = range.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) {
    const rects = range.getClientRects();
    if (rects.length > 0) return rects.item(0);

    return null;
  }

  return rect;
}

function setCollapsedRangeAtNodeOffset(range: Range, node: Node, off: number): boolean {
  if (node.nodeType === Node.TEXT_NODE) {
    const textNodeLength = nodeText(node).length;
    const clampedOffset = Math.max(0, Math.min(off, textNodeLength));
    range.setStart(node, clampedOffset);
    range.setEnd(node, clampedOffset);

    return true;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return false;

  const el = node as Element;
  if (el.tagName === LINE_BREAK_TAG) {
    if (off <= 0) {
      range.setStartBefore(el);
      range.setEndBefore(el);
    } else {
      range.setStartAfter(el);
      range.setEndAfter(el);
    }

    return true;
  }

  if (isMentionElement(el)) {
    const first = el.firstChild;
    if (first && first.nodeType === Node.TEXT_NODE) {
      const tn = first as Text;
      range.setStart(tn, 0);
      range.setEnd(tn, 0);
    } else {
      range.setStartBefore(el);
      range.setEndBefore(el);
    }

    return true;
  }

  const max = el.childNodes.length;
  if (off >= 0 && off <= max) {
    range.setStart(el, off);
    range.setEnd(el, off);
  } else {
    range.setStartBefore(el);
    range.setEndBefore(el);
  }

  return true;
}

export function getCaretRectFromSelection(root: HTMLElement): DOMRect | null {
  const doc = root.ownerDocument;
  const sel = doc?.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0);
  if (!range.collapsed || !root.contains(range.startContainer)) return null;

  return rectFromCollapsedRange(range);
}

export function getBoundingRectAtLinearOffset(root: HTMLElement, offset: number): DOMRect | null {
  if (offset < 0) return null;
  const doc = root.ownerDocument;
  if (!doc) return null;
  const mapped = walkSelectionModel(root, null, { rangeStart: offset, rangeEnd: offset });
  if (!mapped.rangeStartNode) return null;
  const range = doc.createRange();
  const node = mapped.rangeStartNode;
  const off = mapped.rangeStartOffset;
  try {
    if (!setCollapsedRangeAtNodeOffset(range, node, off)) return null;
  } catch {
    return null;
  }
  if (!root.contains(range.startContainer)) return null;
  if (typeof range.getBoundingClientRect !== 'function') return null;

  return rectFromCollapsedRange(range);
}

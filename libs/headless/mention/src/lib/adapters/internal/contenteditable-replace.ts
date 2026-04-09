/**
 * Text-range replacement for mention adapter:
 * handles plain text insertions, mention chip insertions,
 * caret restoration, and post-input normalization.
 */
import { type NgZone } from '@angular/core';
import { contains } from '@nexora-ui/core';

import type { MentionInsertion } from '../../types/mention-types';
import { readClassFromAttrMap } from '../../utils/mention-attr-map';

import {
  ATTR_CONTENTEDITABLE,
  ATTR_MENTION_ID,
  ATTR_MENTION_LABEL,
} from './contenteditable-dom-constants';
import { emitEditorInputEvent } from './contenteditable-events';
import { walkSelectionModel } from './contenteditable-selection';

export type MentionReplacement = string | MentionInsertion;

function isAllowedMentionAttributeName(name: string): boolean {
  const lower = name.toLowerCase();
  if (lower === 'class' || lower === 'title') return true;
  if (lower.startsWith('data-') || lower.startsWith('aria-')) return true;

  return false;
}

function isProtectedMentionAttributeName(name: string): boolean {
  const lower = name.toLowerCase();

  return (
    lower === ATTR_MENTION_ID.toLowerCase() ||
    lower === ATTR_MENTION_LABEL.toLowerCase() ||
    lower === ATTR_CONTENTEDITABLE.toLowerCase() ||
    lower === 'spellcheck'
  );
}

function resolveBoundaryPoint(node: Node, offset: number): { node: Node; offset: number } {
  if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === 'BR') {
    const parent = node.parentNode;
    if (parent) {
      const idx = Array.prototype.indexOf.call(parent.childNodes, node);

      // A Range cannot be anchored "inside" <br>; map to parent boundary.
      return { node: parent, offset: idx + (offset > 0 ? 1 : 0) };
    }
  }

  return { node, offset };
}

export function createMentionChipElement(
  doc: Document,
  options: {
    text: string;
    id?: string;
    label?: string;
    attributes?: Record<string, string>;
    baseChipClass?: string;
  },
): HTMLSpanElement {
  const mentionSpan = doc.createElement('span');
  mentionSpan.setAttribute(ATTR_MENTION_ID, options.id ?? '');
  if (options.label) mentionSpan.setAttribute(ATTR_MENTION_LABEL, options.label);
  mentionSpan.textContent = options.text;
  mentionSpan.setAttribute(ATTR_CONTENTEDITABLE, 'false');
  mentionSpan.setAttribute('spellcheck', 'false');

  const baseClass = options.baseChipClass ?? '';
  const attrClass = readClassFromAttrMap(options.attributes) ?? '';
  const classParts: string[] = [];

  if (baseClass) classParts.push(baseClass);
  if (attrClass) classParts.push(attrClass);

  const mergedClass = classParts.join(' ');

  if (mergedClass) {
    mentionSpan.setAttribute('class', mergedClass);
  }

  if (options.attributes) {
    const attrs = options.attributes;

    for (const key in attrs) {
      if (!Object.prototype.hasOwnProperty.call(attrs, key)) continue;
      if (key === 'class') continue;
      if (!isAllowedMentionAttributeName(key)) continue;
      if (isProtectedMentionAttributeName(key)) continue;
      mentionSpan.setAttribute(key, attrs[key]);
    }
  }

  return mentionSpan;
}

export function replaceTextRangeInEditor(params: {
  root: HTMLElement;
  ngZone: NgZone;
  start: number;
  end: number;
  replacement: MentionReplacement;
  caretOffset?: number;
  normalizeEditorTextSpacing: (root: HTMLElement) => void;
  invalidateSnapshotCache: () => void;
  baseChipClass?: string;
}): void {
  const {
    root,
    ngZone,
    start,
    end,
    replacement,
    caretOffset,
    normalizeEditorTextSpacing,
    invalidateSnapshotCache,
    baseChipClass,
  } = params;

  invalidateSnapshotCache();

  const insertion: MentionInsertion =
    typeof replacement === 'string'
      ? { replacementText: replacement, caretPlacement: 'end' }
      : replacement;

  const result = walkSelectionModel(root, null, { rangeStart: start, rangeEnd: end });
  const { rangeStartNode, rangeStartOffset, rangeEndNode, rangeEndOffset } = result;
  if (rangeStartNode == null || rangeEndNode == null) return;

  const doc = root.ownerDocument;
  if (!doc) return;

  const startPoint = resolveBoundaryPoint(rangeStartNode, rangeStartOffset);
  const endPoint = resolveBoundaryPoint(rangeEndNode, rangeEndOffset);

  const range = doc.createRange();
  range.setStart(startPoint.node, startPoint.offset);
  range.setEnd(endPoint.node, endPoint.offset);

  ngZone.runOutsideAngular(() => {
    range.deleteContents();

    const hasMention =
      insertion.mentionId != null ||
      insertion.mentionLabel != null ||
      (insertion.mentionAttributes != null && Object.keys(insertion.mentionAttributes).length > 0);
    let caretRange: { node: Node; offset: number } | null = null;

    if (hasMention) {
      const displayText = insertion.replacementText.replace(/\s+$/, '');
      const mentionSpan = createMentionChipElement(doc, {
        id: insertion.mentionId ?? '',
        label: insertion.mentionLabel,
        text: displayText,
        attributes: insertion.mentionAttributes,
        baseChipClass,
      });
      range.insertNode(mentionSpan);
      const trailingWhitespace = /\s+$/.exec(insertion.replacementText)?.[0] ?? '';
      if (trailingWhitespace.length > 0) {
        const afterText = doc.createTextNode(trailingWhitespace.replace(/ /g, '\u00A0'));
        mentionSpan.after(afterText);
        caretRange = { node: afterText, offset: afterText.nodeValue?.length ?? 0 };
      } else {
        const parent = mentionSpan.parentNode;
        if (parent) {
          const idx = Array.prototype.indexOf.call(parent.childNodes, mentionSpan);
          caretRange = { node: parent, offset: idx + 1 };
        }
      }
    } else {
      const text = doc.createTextNode(insertion.replacementText.replace(/ /g, '\u00A0'));
      range.insertNode(text);
      const caretPos =
        caretOffset != null
          ? Math.min(caretOffset, insertion.replacementText.length)
          : insertion.replacementText.length;
      if (caretPos === insertion.replacementText.length) {
        range.setStartAfter(text);
      } else {
        range.setStart(text, caretPos);
      }
      range.collapse(true);
    }

    const selection = doc.getSelection();
    if (selection && caretRange) {
      const nextRange = doc.createRange();
      nextRange.setStart(caretRange.node, caretRange.offset);
      nextRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(nextRange);
    } else if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }

    emitEditorInputEvent(root);

    if (caretRange && selection) {
      const node = caretRange.node;
      const offset = caretRange.offset;

      const restore = (): void => {
        if (!contains(root, node)) return;
        if (!contains(root, doc.activeElement ?? null)) {
          root.focus({ preventScroll: true });
        }
        try {
          const nextRange = doc.createRange();
          nextRange.setStart(node, offset);
          nextRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(nextRange);
        } catch {
          /* ignore */
        }
      };

      queueMicrotask(restore);
      requestAnimationFrame(restore);
    }
    normalizeEditorTextSpacing(root);
    invalidateSnapshotCache();
  });
}

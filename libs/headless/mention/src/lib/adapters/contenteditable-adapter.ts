/**
 * Contenteditable surface adapter: linearizes DOM to plain text, maps selection to
 * character offsets, and replaces ranges with text nodes or mention spans.
 */

import { type ElementRef, type NgZone } from '@angular/core';

import type { MentionDocument, MentionEntity } from '../types/mention-types';

import { removeMentionBeforeCaretInEditor } from './internal/contenteditable-backspace';
import {
  ATTR_CONTENTEDITABLE,
  ATTR_MENTION_DATA,
  ATTR_MENTION_ID,
  ATTR_MENTION_LABEL,
  ATTR_MENTION_TEXT,
  LINE_BREAK_TAG,
  isLineBlockTag,
  readMentionData,
  readMentionLogicalText,
} from './internal/contenteditable-dom-constants';
import { emitEditorInputEvent, getSelectionInRoot } from './internal/contenteditable-events';
import { insertTextAtCaretInEditor } from './internal/contenteditable-insert-text';
import {
  isEmptyLinePlaceholderBr,
  normalizeTextSpacesAndLineModel,
} from './internal/contenteditable-line-model';
import { insertLineBreakInEditor } from './internal/contenteditable-linebreak';
import {
  createMentionChipElement,
  applyMentionChipAttributes,
  applyMentionChipData,
  replaceTextRangeInEditor,
} from './internal/contenteditable-replace';
import {
  getBoundingRectAtLinearOffset,
  getCaretRectFromSelection,
  setSelectionRangeAtLinearOffsets,
  walkSelectionModel,
} from './internal/contenteditable-selection';
import { subscribeEditorSurface } from './internal/contenteditable-subscribe';
import type {
  MentionSurfaceCallbacks,
  MentionReplacement,
  MentionSelectionRange,
  MentionSurfaceSnapshot,
  MentionTextSurfaceAdapter,
} from './mention-surface';

function isMentionElement(el: Element): boolean {
  return el.hasAttribute(ATTR_MENTION_ID);
}

/** Convert non-breaking spaces from DOM text nodes into regular spaces. */
function normalizeNbsp(text: string): string {
  return text.replace(/\u00A0/g, ' ');
}

/** Convert regular spaces to NBSP so contenteditable preserves visual spacing. */
function toNbsp(text: string): string {
  return text.replace(/ /g, '\u00A0');
}

/** Collect non-core attributes from a mention chip so they can round-trip through the model. */
function extractMentionAttributes(el: Element): Record<string, string> | undefined {
  const attrs: Record<string, string> = {};
  const { attributes } = el;

  for (const attr of Array.from(attributes)) {
    if (
      attr.name === ATTR_MENTION_ID ||
      attr.name === ATTR_MENTION_LABEL ||
      attr.name === ATTR_MENTION_TEXT ||
      attr.name === ATTR_MENTION_DATA ||
      attr.name === ATTR_CONTENTEDITABLE ||
      attr.name === 'spellcheck'
    ) {
      continue;
    }

    attrs[attr.name] = attr.value;
  }

  return Object.keys(attrs).length > 0 ? attrs : undefined;
}

function buildMentionDocumentFromDom(root: Node): MentionDocument {
  const mentions: MentionEntity[] = [];
  let text = '';
  const editingRoot = root as HTMLElement;

  function appendInline(node: Node): number {
    if (node.nodeType === Node.TEXT_NODE) {
      const content = normalizeNbsp(node.textContent || '');
      text += content;

      return content.length;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return 0;

    const el = node as Element;

    if (el.tagName === LINE_BREAK_TAG) {
      if (isEmptyLinePlaceholderBr(el, editingRoot)) {
        return 0;
      }

      text += '\n';

      return 1;
    }

    if (isMentionElement(el)) {
      const content = normalizeNbsp(readMentionLogicalText(el));
      const start = text.length;
      text += content;

      mentions.push({
        id: el.getAttribute(ATTR_MENTION_ID) ?? '',
        label: el.getAttribute(ATTR_MENTION_LABEL) ?? undefined,
        text: content,
        start,
        end: start + content.length,
        attributes: extractMentionAttributes(el),
        data: readMentionData(el),
      });

      return content.length;
    }

    let len = 0;

    Array.from(el.childNodes).forEach((child) => {
      len += appendInline(child);
    });

    return len;
  }

  let hasWrittenLine = false;

  Array.from(root.childNodes).forEach((child) => {
    const isLineBlock =
      child.nodeType === Node.ELEMENT_NODE && isLineBlockTag((child as Element).tagName);

    if (isLineBlock) {
      if (hasWrittenLine) {
        text += '\n';
      }

      hasWrittenLine = true;

      Array.from(child.childNodes).forEach((nested) => {
        appendInline(nested);
      });

      return;
    }

    // Inline node at root level: keep as part of current line.
    appendInline(child);
    hasWrittenLine = true;
  });

  return { bodyText: text, mentions };
}

function sanitizeMentionDocumentInput(doc: MentionDocument): MentionDocument {
  const bodyText = doc.bodyText ?? '';
  const source = Array.isArray(doc.mentions) ? doc.mentions : [];
  const sorted = [...source].sort((a, b) => a.start - b.start || a.end - b.end);
  const mentions: MentionEntity[] = [];
  let lastEnd = 0;

  for (const raw of sorted) {
    const start = Number.isFinite(raw.start) ? Math.max(0, Math.floor(raw.start)) : 0;
    const end = Number.isFinite(raw.end) ? Math.min(bodyText.length, Math.floor(raw.end)) : start;

    if (end <= start) continue;
    if (start < lastEnd) continue; // skip overlap

    const id = `${raw.id ?? ''}`.trim();

    if (id.length === 0) continue;

    const textFromRange = bodyText.slice(start, end);
    const mentionText = raw.text && raw.text.length > 0 ? raw.text : textFromRange;
    const label = raw.label && raw.label.length > 0 ? raw.label : undefined;
    const attributes =
      raw.attributes && Object.keys(raw.attributes).length > 0 ? raw.attributes : undefined;

    mentions.push({
      id,
      label,
      text: mentionText,
      start,
      end,
      attributes,
      // Opaque structured payload, intentionally passed through without validation: a garbage shape
      // is only handled (silently dropped) at serialize time via `serializeMentionData`.
      data: raw.data,
    });
    lastEnd = end;
  }

  return { bodyText, mentions };
}

function resolveSelectionBounds(
  anchorIdx: number | null,
  focusIdx: number | null,
): MentionSelectionRange | null {
  const selectionStart =
    anchorIdx != null && focusIdx != null ? Math.min(anchorIdx, focusIdx) : (anchorIdx ?? focusIdx);
  const selectionEnd =
    anchorIdx != null && focusIdx != null ? Math.max(anchorIdx, focusIdx) : (anchorIdx ?? focusIdx);

  if (selectionStart == null || selectionEnd == null) return null;

  return { start: selectionStart, end: selectionEnd };
}

function normalizeEditorTextSpacing(root: HTMLElement): void {
  normalizeTextSpacesAndLineModel(root, walkSelectionModel);
}

/**
 * Creates a contenteditable surface adapter for the given element.
 * Expects a single contenteditable root (or host contains one).
 */
export function createContenteditableAdapter(
  elementRef: ElementRef<HTMLElement>,
  ngZone: NgZone,
): MentionTextSurfaceAdapter {
  const hostElement = elementRef.nativeElement;
  const hostIsEditableRoot = hostElement.getAttribute(ATTR_CONTENTEDITABLE) === 'true';
  const root: HTMLElement = hostIsEditableRoot
    ? hostElement
    : (hostElement.querySelector<HTMLElement>(`[${ATTR_CONTENTEDITABLE}="true"]`) ?? hostElement);

  let unsubscribe: (() => void) | null = null;
  let snapshotVersion = 0;
  /** Block `selectstart` while removing a chip so engines don't highlight it. */
  let suppressSelectStartForMentionDelete = false;

  const selectStartSuppressedRef = {
    get value(): boolean {
      return suppressSelectStartForMentionDelete;
    },
    set value(v: boolean) {
      suppressSelectStartForMentionDelete = v;
    },
  };

  const readSurfaceSnapshot = (): MentionSurfaceSnapshot => {
    const mentionDocument = buildMentionDocumentFromDom(root);

    const mentions = mentionDocument.mentions;
    const lockedMentionTextRanges = mentions.map((m) => ({ start: m.start, end: m.end }));

    return {
      version: snapshotVersion,
      value: mentionDocument.bodyText,
      document: mentionDocument,
      lockedMentionTextRanges,
    };
  };

  let snapshotCache: MentionSurfaceSnapshot | null = null;

  const invalidateSnapshotCache = (): void => {
    snapshotVersion += 1;
    snapshotCache = null;
  };

  const getCachedSnapshot = (): MentionSurfaceSnapshot => {
    if (snapshotCache != null) return snapshotCache;

    const snapshot = readSurfaceSnapshot();
    snapshotCache = snapshot;

    return snapshot;
  };

  const getLinearSelectionOffsets = (): MentionSelectionRange | null => {
    const selection = getSelectionInRoot(root);

    if (!selection) return null;

    const selectionMap = walkSelectionModel(root, selection, {});

    return resolveSelectionBounds(selectionMap.anchorIdx, selectionMap.focusIdx);
  };

  return {
    getValue(): string {
      return getCachedSnapshot().value;
    },

    getDocument(): MentionDocument {
      return getCachedSnapshot().document;
    },

    getSnapshot(): MentionSurfaceSnapshot {
      return getCachedSnapshot();
    },

    getSnapshotVersion(): number {
      return snapshotVersion;
    },

    setDocument(doc: MentionDocument): void {
      invalidateSnapshotCache();

      const normalized = sanitizeMentionDocumentInput(doc);
      const source = normalized.bodyText;
      const mentionList = normalized.mentions;

      const lines = source.split('\n');
      let offset = 0;
      let mentionCursor = 0;
      const peekMention = (): MentionEntity | null => mentionList[mentionCursor] ?? null;

      const advanceMention = (): MentionEntity | null => {
        const mention = mentionList[mentionCursor] ?? null;

        if (mention) mentionCursor += 1;

        return mention;
      };

      root.replaceChildren();
      const docRef = root.ownerDocument;

      if (!docRef) return;

      const appendText = (container: HTMLElement, value: string): void => {
        if (value.length === 0) return;

        container.appendChild(docRef.createTextNode(toNbsp(value)));
      };

      for (const line of lines) {
        const lineStart = offset;
        const lineEnd = lineStart + line.length;
        const lineDiv = docRef.createElement('div');
        let cursor = lineStart;

        while (true) {
          const mention = peekMention();

          if (!mention) break;

          const mentionStartsBeforeLine = mention.start < lineStart;
          const mentionIsOutsideCurrentLine = mention.start >= lineEnd || mention.end > lineEnd;

          if (mentionStartsBeforeLine) {
            advanceMention();

            continue;
          }

          if (mentionIsOutsideCurrentLine) break;

          appendText(lineDiv, source.slice(cursor, mention.start));

          const mentionSpan = createMentionChipElement(docRef, {
            id: mention.id,
            label: mention.label,
            text: mention.text,
            attributes: mention.attributes,
            data: mention.data,
          });

          lineDiv.appendChild(mentionSpan);
          cursor = mention.end;

          advanceMention();
        }

        appendText(lineDiv, source.slice(cursor, lineEnd));

        if (!lineDiv.firstChild) {
          lineDiv.appendChild(docRef.createElement('br'));
        }

        root.appendChild(lineDiv);
        offset = lineEnd + 1;
      }

      if (lines.length === 0) {
        const empty = docRef.createElement('div');
        empty.appendChild(docRef.createElement('br'));
        root.appendChild(empty);
      }

      invalidateSnapshotCache();
    },

    getSelectionRange(): MentionSelectionRange | null {
      return getLinearSelectionOffsets();
    },

    setSelectionRange(range: MentionSelectionRange): boolean {
      return setSelectionRangeAtLinearOffsets(root, range.start, range.end);
    },

    getSelectionStart(): number | null {
      return this.getSelectionRange()?.start ?? null;
    },

    getSelectionEnd(): number | null {
      return this.getSelectionRange()?.end ?? null;
    },

    isSelectionCollapsed(): boolean {
      const doc = root.ownerDocument;
      const sel = doc?.getSelection();

      if (!sel || sel.rangeCount === 0) return true;

      const range = sel.getRangeAt(0);

      return range.collapsed;
    },

    getTextBeforeCaret(): string {
      const value = this.getValue();
      const range = this.getSelectionRange();
      const start = range?.start ?? null;

      if (start == null) return value;

      return value.slice(0, start);
    },

    getCaretRect(): DOMRect | null {
      return getCaretRectFromSelection(root);
    },

    getRectAtLinearOffset(offset: number): DOMRect | null {
      return getBoundingRectAtLinearOffset(root, offset);
    },

    replaceTextRange(
      start: number,
      end: number,
      replacement: MentionReplacement,
      caretOffset?: number,
      baseChipClass?: string,
    ): void {
      replaceTextRangeInEditor({
        root,
        ngZone,
        start,
        end,
        replacement,
        caretOffset,
        normalizeEditorTextSpacing,
        invalidateSnapshotCache,
        baseChipClass,
      });
    },

    updateMentionAttributes(
      mentionId: string,
      attributes: MentionEntity['attributes'],
      baseChipClass?: string,
      index?: number,
    ): boolean {
      const chips = Array.from(root.querySelectorAll<HTMLElement>(`[${ATTR_MENTION_ID}]`));
      const matchesId = (el: HTMLElement | undefined): boolean =>
        el != null && el.getAttribute(ATTR_MENTION_ID) === mentionId;

      // Chips are in document order, so prefer the chip at the entity's index to disambiguate
      // repeated mentions of the same id; fall back to the first chip with that id.
      const byIndex = index != null ? chips[index] : undefined;
      const chip = matchesId(byIndex)
        ? byIndex
        : chips.find((el) => el.getAttribute(ATTR_MENTION_ID) === mentionId);

      if (!chip) return false;

      applyMentionChipAttributes(chip, attributes, baseChipClass);
      invalidateSnapshotCache();
      emitEditorInputEvent(root);

      return true;
    },

    updateMentionData(mentionId: string, data: unknown, index?: number): boolean {
      const chips = Array.from(root.querySelectorAll<HTMLElement>(`[${ATTR_MENTION_ID}]`));
      const matchesId = (el: HTMLElement | undefined): boolean =>
        el != null && el.getAttribute(ATTR_MENTION_ID) === mentionId;

      const byIndex = index != null ? chips[index] : undefined;
      const chip = matchesId(byIndex)
        ? byIndex
        : chips.find((el) => el.getAttribute(ATTR_MENTION_ID) === mentionId);

      if (!chip) return false;

      applyMentionChipData(chip, data);
      invalidateSnapshotCache();
      emitEditorInputEvent(root);

      return true;
    },

    isFocused(): boolean {
      const doc = root.ownerDocument;
      const active = doc?.activeElement;

      return active === root || (active != null && root.contains(active));
    },

    insertLineBreak(): void {
      insertLineBreakInEditor({
        root,
        ngZone,
        normalizeEditorTextSpacing,
        invalidateSnapshotCache,
      });
    },

    insertTextAtCaret(text: string): void {
      insertTextAtCaretInEditor({
        root,
        ngZone,
        text,
        normalizeEditorTextSpacing,
        invalidateSnapshotCache,
      });
    },

    removeMentionBeforeCaret(): boolean {
      return removeMentionBeforeCaretInEditor({
        root,
        invalidateSnapshotCache,
        selectStartSuppressedRef,
      });
    },

    subscribe(this: MentionTextSurfaceAdapter, callbacks: MentionSurfaceCallbacks): () => void {
      if (unsubscribe) unsubscribe();

      unsubscribe = subscribeEditorSurface({
        root,
        ngZone,
        adapter: this,
        callbacks,
        invalidateSnapshotCache,
        normalizeEditorTextSpacing,
        getSelectStartSuppressed: () => suppressSelectStartForMentionDelete,
      });

      return unsubscribe;
    },
  };
}

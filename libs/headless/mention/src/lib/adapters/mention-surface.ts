import type { MentionDocument, MentionInsertion } from '../types/mention-types';

/**
 * Surface adapter contract for contenteditable mention.
 */

/** Callbacks for surface events. */
export interface MentionSurfaceCallbacks {
  readonly input?: () => void;
  readonly keydown?: (event: KeyboardEvent) => void;
  readonly click?: () => void;
  readonly selectionchange?: () => void;
  readonly scroll?: () => void;
  readonly focus?: () => void;
  readonly blur?: () => void;
  readonly compositionstart?: () => void;
  readonly compositionend?: () => void;
  readonly paste?: (event: ClipboardEvent) => void;
}

/** Replacement: plain text or insertion with optional mention span metadata. */
export type MentionReplacement = string | MentionInsertion;

/** Linear offsets in adapter plain-text space. */
export type MentionSelectionRange = { readonly start: number; readonly end: number };

/** Generic immutable text range shape used by snapshot metadata. */
export type MentionTextRange = { readonly start: number; readonly end: number };

/** Combined plain-text + structured snapshot from one DOM walk. */
export interface MentionSurfaceSnapshot {
  /** Monotonic revision of adapter content state when this snapshot was produced. */
  readonly version: number;
  readonly value: string;
  readonly document: MentionDocument;
  /** Optional precomputed ranges for parser locked-mention checks. */
  readonly lockedMentionTextRanges?: ReadonlyArray<MentionTextRange>;
}

/** Contenteditable surface adapter. */
export interface MentionTextSurfaceAdapter {
  getValue(): string;
  getDocument(): MentionDocument;
  /**
   * Optional optimization: produce plain value + document together from a single traversal.
   * Fallback callers can still use `getValue()` and `getDocument()` independently.
   */
  getSnapshot?(): MentionSurfaceSnapshot;
  /** Optional monotonic content version used to detect stale async snapshots. */
  getSnapshotVersion?(): number;
  setDocument(doc: MentionDocument): void;
  /**
   * Linear selection range in one `walkSelectionModel` pass. Prefer this over calling
   * `getSelectionStart` and `getSelectionEnd` separately when both offsets are needed.
   */
  getSelectionRange(): MentionSelectionRange | null;
  getSelectionStart(): number | null;
  getSelectionEnd(): number | null;
  isSelectionCollapsed(): boolean;
  getTextBeforeCaret(): string;
  getCaretRect(): DOMRect | null;
  /**
   * Bounding rect for a collapsed caret at the given linear text offset
   * (same index space as `getValue()`).
   * Used to anchor the panel on the trigger character instead of the live caret.
   */
  getRectAtLinearOffset?(offset: number): DOMRect | null;
  replaceTextRange(
    start: number,
    end: number,
    replacement: MentionReplacement,
    caretOffset?: number,
    baseChipClass?: string,
  ): void;
  isFocused(): boolean;
  subscribe(callbacks: MentionSurfaceCallbacks): () => void;
  /** Optional: insert a new line block (div > br) and place caret there. */
  insertLineBreak?: () => void;
  /** Optional: if caret is after a mention chip, remove the whole chip. */
  removeMentionBeforeCaret?: () => boolean;
  /**
   * Inserts plain text at the collapsed caret (e.g. after calling `focus()` to open a trigger).
   * Dispatches `input` so mention detection runs.
   */
  insertTextAtCaret?: (text: string) => void;
}

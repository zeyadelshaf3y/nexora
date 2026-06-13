/**
 * Mention events, callbacks, and programmatic insertion options.
 */

import type {
  MentionAttributes,
  MentionDocument,
  MentionEntity,
  MentionLinearRange,
} from './mention-types-core';

/**
 * Emitted by chip interaction outputs (mouseover/out delegation + click).
 *
 * **`entity` is not a full document slice:** `id`, `label`, and chip text are taken from the DOM.
 * `start` and `end` are **placeholders (`0`)** — they are not resolved to linear offsets in the
 * serialized document. Use `MentionDirective.getDocument()` / `getMentions()` when you need
 * positions in `bodyText`.
 */
export interface MentionChipInteractionEvent {
  readonly element: HTMLElement;
  readonly entity: MentionEntity;
  readonly nativeEvent: MouseEvent;
}

/** Emitted when a mention item is selected from the panel. */
export interface MentionSelectEvent<T = unknown> {
  readonly item: T;
  readonly trigger: string;
}

/** Callback signatures reused across mention APIs. */
export type MentionSelectHandler<T = unknown> = (payload: MentionSelectEvent<T>) => void;

export type MentionOpenChangeHandler = (open: boolean) => void;

export type MentionQueryChangeHandler = (query: string) => void;

export type MentionBeforePasteHandler = (event: MentionPasteEvent) => void;

/** Mutable event object passed to `nxrMentionBeforePaste` callback. */
export interface MentionPasteEvent {
  readonly plainText: string;
  readonly htmlText: string | null;
  /** Set to transformed text to override default paste behavior. */
  transformedText?: string;
  /** Set to true to prevent paste entirely (nothing gets inserted). */
  preventDefault?: boolean;
}

/** Programmatic insertion options for `MentionDirective.insertMention(...)`. */
export interface MentionInsertOptions {
  /** Trigger to use when multiple triggers are configured. */
  readonly trigger?: string;
  /** Where to insert when not using the current selection/caret. */
  readonly at?: 'selection' | 'start' | 'end' | MentionLinearRange;
}

/** Predicate used by programmatic APIs to resolve a mention from the current document snapshot. */
export type MentionEntityPredicate = (mention: MentionEntity, index: number) => boolean;

/** Shared target accepted by APIs that operate on an existing mention. */
export type MentionEntityTarget = string | MentionEntityPredicate;

/** Programmatic mention upsert options. */
export interface MentionUpsertOptions {
  /** Trigger to use when inserting/replacing through trigger config. */
  readonly trigger?: string;
  /** Mention id to replace when present. */
  readonly mentionId?: string;
  /** Custom matcher for existing mentions. Checked after `mentionId` when both are provided. */
  readonly matchBy?: MentionEntityPredicate;
  /** Where to insert when no existing mention matches. Defaults to the current selection. */
  readonly fallbackAt?: 'selection' | 'start' | 'end' | MentionLinearRange;
}

/** Programmatic mention replacement options. */
export interface MentionReplaceOptions {
  /** Trigger to use when replacing through trigger config. */
  readonly trigger?: string;
}

/** Programmatic mention focus behavior. */
export interface MentionFocusOptions {
  /** Scroll the chip into view before focusing/selecting it. Default `false`. */
  readonly scrollIntoView?: boolean | ScrollIntoViewOptions;
  /** Selection placement after focus. Default `'select'`. */
  readonly select?: 'select' | 'before' | 'after' | false;
  /** Prevent browser scroll while focusing the editor. Default `true`. */
  readonly preventScroll?: boolean;
}

/** Programmatic document update options. */
export interface MentionUpdateDocumentOptions {
  /** Emit value/document outputs when the applied document differs. Default `true`. */
  readonly emit?: boolean;
}

/** Attribute patch or updater for `MentionDirective.updateMentionAttributes(...)`. */
export type MentionAttributesUpdate =
  | MentionAttributes
  | ((attributes: MentionAttributes | undefined, mention: MentionEntity) => MentionAttributes);

/** Document updater for `MentionDirective.updateDocument(...)`. */
export type MentionDocumentUpdater = (document: MentionDocument) => MentionDocument;

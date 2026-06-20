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
 * positions in `bodyText`. Unlike `start`/`end`, the structured `data` payload IS available
 * (parsed from the chip's reserved `data-mention-data` attribute), so handlers can read it. Type
 * the handler with `MentionChipInteractionEvent<MyData>` (or read via the directive's `D`) for a
 * concrete `data` type; otherwise it is `unknown`.
 */
export interface MentionChipInteractionEvent<D = unknown> {
  readonly element: HTMLElement;
  readonly entity: MentionEntity<D>;
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
export type MentionEntityPredicate<D = unknown> = (
  mention: MentionEntity<D>,
  index: number,
) => boolean;

/** Shared target accepted by APIs that operate on an existing mention. */
export type MentionEntityTarget<D = unknown> = string | MentionEntityPredicate<D>;

/** Programmatic mention upsert options. */
export interface MentionUpsertOptions<D = unknown> {
  /** Trigger to use when inserting/replacing through trigger config. */
  readonly trigger?: string;
  /** Mention id to replace when present. */
  readonly mentionId?: string;
  /** Custom matcher for existing mentions. Checked after `mentionId` when both are provided. */
  readonly matchBy?: MentionEntityPredicate<D>;
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
export type MentionAttributesUpdate<D = unknown> =
  | MentionAttributes
  | ((attributes: MentionAttributes | undefined, mention: MentionEntity<D>) => MentionAttributes);

/**
 * Structured-`data` patch or updater for `MentionDirective.updateMentionData(...)`. Mirrors
 * {@link MentionAttributesUpdate}. Return `undefined` (or an updater that returns `undefined`) to
 * clear the payload. See {@link MentionEntity.data} for the serialization contract.
 */
export type MentionDataUpdate<D = unknown> =
  | D
  | undefined
  | ((data: D | undefined, mention: MentionEntity<D>) => D | undefined);

/** Document updater for `MentionDirective.updateDocument(...)`. */
export type MentionDocumentUpdater<D = unknown> = (
  document: MentionDocument<D>,
) => MentionDocument<D>;

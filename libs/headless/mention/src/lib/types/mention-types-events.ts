/**
 * Mention events, callbacks, and programmatic insertion options.
 */

import type { MentionEntity, MentionLinearRange } from './mention-types-core';

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

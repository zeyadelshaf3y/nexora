/**
 * Typeahead: buffer input, match on normalized labels, cycle/wrap, reset on timeout and nav.
 * Options with empty normalized label are ignored.
 */

import { LISTBOX_NAV_OR_HOME_END_KEYS } from '../constants/listbox-keyboard-constants';

const TYPEAHEAD_BUFFER_MS = 400;

export interface TypeaheadOption<T> {
  readonly item: T;
  readonly label: string;
  /** Pre-lowercased label used for matching, avoids repeated `.toLowerCase()` calls. */
  readonly normalizedLabel: string;
  readonly disabled: boolean;
}

/**
 * Stateful typeahead helper. Call handleKey with key; returns the next matching option item or null.
 * Search starts from the option after the current active one, then wraps.
 */
export class Typeahead<T> {
  private buffer = '';
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly bufferMs = TYPEAHEAD_BUFFER_MS) {}

  /**
   * Handles a key. Returns the item to set as active if there is a match; otherwise null.
   * Resets buffer on navigation keys (arrows, Home, End).
   *
   * @param key - The key character (e.g. from event.key)
   * @param options - Enabled options with labels in navigation order (empty labels excluded)
   * @param currentItem - The currently active item, or null
   * @param currentIndexInOptions - When supplied and consistent with `currentItem`, skips a linear scan
   * @returns The item to activate, or null
   */
  handleKey(
    key: string,
    options: TypeaheadOption<T>[],
    currentItem: T | null,
    currentIndexInOptions?: number,
    /** When set, used instead of `===` to locate the current option (listbox `sameItem`). */
    itemsMatch?: (a: T, b: T) => boolean,
  ): T | null {
    if (options.length === 0) return null;

    if (LISTBOX_NAV_OR_HOME_END_KEYS.has(key)) {
      this.reset();

      return null;
    }

    if (key.length !== 1) return null;

    this.extendBuffer(key);

    const same = itemsMatch ?? ((a: T, b: T) => a === b);
    const match = this.findMatch(options, currentItem, currentIndexInOptions, same);

    return match?.item ?? null;
  }

  /** Resets the buffer (e.g. when options or registry change). */
  reset(): void {
    this.clearTimeout();
    this.buffer = '';
  }

  destroy(): void {
    this.clearTimeout();
  }

  private extendBuffer(char: string): void {
    this.clearTimeout();

    this.buffer += char.toLowerCase();

    this.timeoutId = setTimeout(() => {
      this.buffer = '';
      this.timeoutId = null;
    }, this.bufferMs);
  }

  private clearTimeout(): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);

      this.timeoutId = null;
    }
  }

  private findMatch(
    options: TypeaheadOption<T>[],
    currentItem: T | null,
    currentIndexInOptions: number | undefined,
    itemsMatch: (a: T, b: T) => boolean,
  ): TypeaheadOption<T> | null {
    const search = this.buffer;

    if (!search) return null;

    const len = options.length;
    const startAfter = this.resolveStartAfterIndex(
      options,
      currentItem,
      currentIndexInOptions,
      itemsMatch,
    );

    for (let i = 1; i <= len; i++) {
      const idx = (startAfter + i) % len;

      const opt = options[idx];
      if (opt.normalizedLabel.startsWith(search)) {
        return opt;
      }
    }

    return null;
  }

  private resolveStartAfterIndex(
    options: TypeaheadOption<T>[],
    currentItem: T | null,
    hint: number | undefined,
    itemsMatch: (a: T, b: T) => boolean,
  ): number {
    if (
      hint !== undefined &&
      hint >= 0 &&
      hint < options.length &&
      currentItem != null &&
      itemsMatch(options[hint].item, currentItem)
    ) {
      return hint;
    }

    return this.findCurrentIndex(options, currentItem, itemsMatch);
  }

  private findCurrentIndex(
    options: TypeaheadOption<T>[],
    currentItem: T | null,
    itemsMatch: (a: T, b: T) => boolean,
  ): number {
    if (currentItem === null) return -1;

    return options.findIndex((o) => itemsMatch(o.item, currentItem));
  }
}

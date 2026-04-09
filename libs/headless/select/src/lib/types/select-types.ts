/**
 * Public types for the headless select.
 *
 * `SelectAccessors` is an alias for `ListboxAccessors` — keeps the public API
 * self-contained so consumers import from `@nexora-ui/select` without needing
 * to know about the listbox layer.
 */

import type { ListboxAccessors, ListboxInitialHighlight } from '@nexora-ui/listbox';

/**
 * Accessor functions for mapping option items to value, label, and disabled state.
 *
 * When options are objects (e.g. `{ id, name, disabled }`), provide accessors so
 * the select can extract the value for comparison, the label for display, and the
 * disabled flag for each item.
 *
 * When options are primitives (e.g. `string[]`), omit accessors — each item is
 * both its own value and label.
 *
 * @example
 * ```ts
 * const accessors: SelectAccessors<Fruit> = {
 *   value: (f) => f.id,
 *   label: (f) => f.name,
 *   disabled: (f) => f.outOfStock,
 * };
 * ```
 */
export type SelectAccessors<T> = ListboxAccessors<T>;

/**
 * Scroll behavior while the select panel is open.
 *
 * - `'noop'`       — No special scroll handling (panel follows trigger via repositioning).
 * - `'reposition'` — Alias for `'noop'` — explicit intent that the panel repositions on scroll.
 * - `'block'`      — Prevents body scroll while the panel is open.
 * - `'close'`      — Closes the panel when the user scrolls.
 */
export type SelectScrollStrategy = 'noop' | 'reposition' | 'block' | 'close';

/** Re-export so consumers can type the `[initialHighlight]` input without importing from listbox. */
export type SelectInitialHighlight = ListboxInitialHighlight;

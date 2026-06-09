/**
 * Public types for the headless combobox.
 * Reuses listbox types where applicable for consistency.
 */

import type {
  ListboxAccessors,
  ListboxInitialHighlight,
  ListboxPointerHighlight,
} from '@nexora-ui/listbox';

/** Accessors for option items (value, label, disabled). Same contract as listbox/select. */
export type ComboboxAccessors<T> = ListboxAccessors<T>;

/** Which option to highlight when the panel opens. */
export type ComboboxInitialHighlight = ListboxInitialHighlight;

/** Pointer-driven active highlight for the option list. */
export type ComboboxPointerHighlight = ListboxPointerHighlight;

/** Scroll strategy for the panel. Same as dropdown/select. */
export type ComboboxScrollStrategy = 'noop' | 'reposition' | 'block' | 'close';

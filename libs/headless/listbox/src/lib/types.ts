/**
 * Public and internal types for the listbox primitive.
 * @module listbox/types
 */

import { InjectionToken } from '@angular/core';

/**
 * Controller interface that the listbox directive exposes for option directives.
 * Option directives inject NXR_LISTBOX_CONTROLLER to register and get ARIA state.
 */
export interface NxrListboxController<T = unknown> {
  registerOption(item: T, element: HTMLElement): string;
  unregisterOption(item: T): void;
  /** Re-sync option metadata (e.g. disabled/accessor-derived state) for an already-registered item. */
  refreshOption(item: T): void;
  getOptionId(item: T): string | null;
  isSelected(item: T): boolean;
  isActive(item: T): boolean;
  isDisabled(item: T): boolean;
  getRole(): 'option' | 'menuitem';
  setDisabled(item: T, disabled: boolean): void;
  /** Current active (highlighted) option, or null. Used e.g. for virtual scroll sync. */
  activeOption(): T | null;
  /** Sets the option as active (highlighted) without triggering selection. */
  setActiveOption(item: T): void;
  /** Activates the option: selects it (selection mode) or fires optionActivated (action mode). */
  activateOption(item: T): void;
}

/** Token for the listbox controller so option directives can inject the parent listbox. */
export const NXR_LISTBOX_CONTROLLER = new InjectionToken<NxrListboxController>(
  'NXR_LISTBOX_CONTROLLER',
);

/**
 * How to align the active option when scrolling in a virtual viewport.
 * - start: option at top of viewport (e.g. ArrowUp, Home)
 * - end: option at bottom of viewport (e.g. ArrowDown, End) — list appears to move under a fixed highlight
 * - nearest: scroll only if index not visible; then align to start or end so minimum scroll (like non-virtual)
 */
export type ListboxScrollAlignment = 'start' | 'end' | 'nearest';

/**
 * Optional handler for virtual-scroll listboxes. When provided (via token or registry), the
 * listbox uses it for all arrow-key and Home/End navigation: it resolves the logical index
 * from the handler, scrolls the viewport, and sets the active option. The registry is still
 * used for ARIA (e.g. aria-activedescendant) and selection; only keyboard navigation is
 * index-based when a handler is present.
 */
export interface NxrListboxVirtualScrollHandler<T = unknown> {
  /** Current logical index of the active option in the full list, or -1 if none. */
  getCurrentIndex(active: T | null): number;
  /**
   * When {@link getCurrentIndex} returns -1 but the active value is still one of the logical rows
   * (e.g. different object reference, or custom `compareWith`), resolves the index via the same
   * rules as listbox `sameItem`. Optional; built-in CDK panel implements this.
   */
  resolveIndexForActive?(active: T, sameItem: (a: T, b: T) => boolean): number;
  /** Total number of logical options. */
  getCount(): number;
  /** Returns the option at the given logical index. Caller must ensure 0 <= index < getCount(). */
  getItemAtIndex(index: number): T;
  /**
   * Scrolls the virtual viewport so the option at index is visible.
   * @param alignment - 'start' = option at top, 'end' = option at bottom, 'nearest' = minimum scroll (only if not visible).
   */
  scrollToIndex(index: number, alignment?: ListboxScrollAlignment): void;
}

/** Token for optional virtual scroll handler. Provide in the panel host when using CDK virtual scroll. */
export const NXR_LISTBOX_VIRTUAL_SCROLL_HANDLER =
  new InjectionToken<NxrListboxVirtualScrollHandler>('NXR_LISTBOX_VIRTUAL_SCROLL_HANDLER');

/** ARIA role of the listbox container and its options. */
export type ListboxRole = 'listbox' | 'menu';

/** Orientation for keyboard navigation and aria-orientation. */
export type ListboxOrientation = 'vertical' | 'horizontal';

/** Which option is active when the listbox gains relevance (e.g. on open/focus). */
export type ListboxInitialHighlight = 'selected' | 'first' | 'last' | 'none';

/**
 * Accessors for option items when T is an object.
 * When options are primitives (e.g. string[]), omit this; the listbox treats each item as value and label.
 */
export interface ListboxAccessors<T> {
  readonly value: (item: T) => unknown;
  readonly label: (item: T) => string;
  readonly disabled?: (item: T) => boolean;
}

/** Default identity comparator used by state and directive when no custom `compareWith` is provided. */
export const DEFAULT_COMPARE_WITH = (a: unknown, b: unknown): boolean => a === b;

/** Direction emitted when keyboard navigation hits the edge of the list with wrap disabled. */
export type ListboxBoundary = 'start' | 'end';

/** Payload when the user activates an option (Enter/click). */
export interface ListboxOptionActivatedEvent<T> {
  readonly option: T;
}

/**
 * Normalized option shape used internally (value, label, disabled).
 * Derived from the logical collection via accessors or primitive defaults.
 */
export interface NormalizedOption<T> {
  readonly item: T;
  readonly value: unknown;
  readonly label: string;
  readonly disabled: boolean;
}

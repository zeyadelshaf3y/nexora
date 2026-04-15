/**
 * Constants for dropdown-style overlays (select, menu, combobox).
 * Centralizes keys, scroll strategy mapping, and defaults for reuse.
 */

import type { ScrollStrategy } from '@nexora-ui/overlay';
import {
  BlockScrollStrategy,
  CloseOnScrollStrategy,
  NoopScrollStrategy,
  RepositionScrollStrategy,
} from '@nexora-ui/overlay';

/** Keys that open the panel when pressed on a closed trigger — O(1) lookup. */
export const OPEN_KEYS: ReadonlySet<string> = new Set(['Enter', ' ', 'ArrowDown', 'ArrowUp']);

/** Stateless — safe to share across all instances. */
const NOOP_SCROLL_STRATEGY = new NoopScrollStrategy();
const REPOSITION_SCROLL_STRATEGY = new RepositionScrollStrategy();

/**
 * Scroll behavior while the dropdown panel is open.
 *
 * - `'noop'`       — Panel sticks to trigger; height fixed at open; no viewport clamping.
 * - `'reposition'` — Reposition/flip with viewport; optional maintainInViewport.
 * - `'block'`      — Prevents body scroll while the panel is open.
 * - `'close'`      — Closes the panel when the user scrolls.
 */
export type DropdownScrollStrategy = 'noop' | 'reposition' | 'block' | 'close';

/** Maps DropdownScrollStrategy to overlay ScrollStrategy factory. */
export const SCROLL_STRATEGY_MAP: Readonly<Record<DropdownScrollStrategy, () => ScrollStrategy>> = {
  noop: () => NOOP_SCROLL_STRATEGY,
  reposition: () => REPOSITION_SCROLL_STRATEGY,
  block: () => new BlockScrollStrategy(),
  close: () => new CloseOnScrollStrategy(),
};

/** Default duration (ms) to wait for CSS close animation before detaching the pane. */
export const DEFAULT_CLOSE_ANIMATION_MS = 150;

/** Default maximum height of the dropdown panel. */
export const DEFAULT_MAX_HEIGHT = '16rem';

/** Default gap in px between trigger and panel. */
export const DEFAULT_OFFSET = 4;

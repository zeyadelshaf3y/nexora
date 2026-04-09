/**
 * Core reactive state: active option, selection reconciliation, navigation, activation.
 * Consumes registry for enabled-order traversal; uses accessors for selection identity.
 */

import { signal } from '@angular/core';

import { DEFAULT_COMPARE_WITH } from '../types';
import type {
  ListboxAccessors,
  ListboxBoundary,
  ListboxInitialHighlight,
  ListboxOrientation,
} from '../types';

import type { OptionEntry, OptionRegistry } from './option-registry';

/** Sentinel so the first `isSelected` call always rebuilds the cache. */
const CACHE_UNSET: unique symbol = Symbol('CACHE_UNSET');

export interface ListboxStateConfig<T> {
  readonly registry: OptionRegistry<T>;

  getValue: () => T | null | readonly T[];
  getMulti: () => boolean;
  getSelectionMode: () => boolean;
  getAccessors: () => ListboxAccessors<T> | undefined;
  getCompareWith: () => (a: unknown, b: unknown) => boolean;
  getInitialHighlight: () => ListboxInitialHighlight;
  getWrap: () => boolean;
  getOrientation: () => ListboxOrientation;
  getDir: () => 'ltr' | 'rtl';
  onValueChange: (value: T | null | readonly T[]) => void;
  onOptionActivated: (item: T) => void;
  onBoundaryReached: (boundary: ListboxBoundary) => void;
  /** When true, do not reset active in reconcile when active is missing from registry (e.g. virtual scroll). */
  getKeepActiveWhenMissingFromRegistry?: () => boolean;
}

/**
 * Listbox state: active option, navigation (next/prev/first/last), selection, activation.
 * When option values duplicate in the registry, the first matching entry is treated as selected.
 */
export class ListboxState<T> {
  readonly activeOption = signal<T | null>(null);

  /**
   * Lazily-built Set of selected value identities for O(1) `isSelected` checks.
   * Keyed by `accessors.value(item)` (or the item itself for primitives).
   * Invalidated by reference-checking `selectionCacheSource` against the current value.
   */
  private selectionCache: ReadonlySet<unknown> | null = null;
  private selectionCacheSource: unknown = CACHE_UNSET;

  constructor(private readonly config: ListboxStateConfig<T>) {}

  setActive(item: T | null): void {
    this.activeOption.set(item);
  }

  /**
   * O(1) for default comparator (identity or accessor-based): uses a cached `Set`.
   * Falls back to O(M) linear scan only when a custom `compareWith` is provided.
   */
  isSelected(item: T): boolean {
    if (!this.config.getSelectionMode()) return false;

    const value = this.config.getValue();

    if (this.config.getCompareWith() !== DEFAULT_COMPARE_WITH) {
      return this.isSelectedLinear(item, value);
    }

    // Arrays are rebuilt eagerly to stay correct even if callers mutate in place.
    // (Reactive best practice is immutable updates, but this guard prevents stale selection state.)
    if (Array.isArray(value) || this.selectionCacheSource !== value) {
      this.selectionCache = this.buildSelectionSet(value);
      this.selectionCacheSource = value;
    }

    const accessors = this.config.getAccessors();
    const key = accessors ? accessors.value(item) : item;

    return this.selectionCache?.has(key) ?? false;
  }

  isActive(item: T): boolean {
    const active = this.activeOption();
    if (active == null) return false;

    return this.itemsMatch(active, item);
  }

  /**
   * Whether two items are the same option (same rules as {@link isActive} / selection:
   * `compareWith`, or `accessors.value`, or `===`).
   */
  sameItem(a: T, b: T): boolean {
    return this.itemsMatch(a, b);
  }

  getNext(): T | null {
    return this.getAdjacent(1);
  }

  getPrev(): T | null {
    return this.getAdjacent(-1);
  }

  getFirst(): T | null {
    const entries = this.config.registry.getEnabledEntries();

    return entries.length > 0 ? entries[0].item : null;
  }

  getLast(): T | null {
    const entries = this.config.registry.getEnabledEntries();

    return entries.length > 0 ? entries[entries.length - 1].item : null;
  }

  /**
   * Activates the option: in selection mode updates value and emits valueChange + optionActivated;
   * in action mode emits optionActivated only.
   */
  activate(item: T): void {
    const selectionMode = this.config.getSelectionMode();

    if (selectionMode) {
      const multi = this.config.getMulti();

      if (multi) {
        this.config.onValueChange(this.getNextMultiSelection(item));
      } else {
        this.config.onValueChange(item);
      }
    }

    this.config.onOptionActivated(item);
  }

  private getNextMultiSelection(item: T): readonly T[] {
    const current = this.config.getValue();
    const arr = Array.isArray(current) ? [...current] : [];
    const idx = arr.findIndex((x) => this.itemsMatch(x, item));

    if (idx >= 0) {
      arr.splice(idx, 1);
    } else {
      arr.push(item);
    }

    return arr;
  }

  /**
   * Sets the active option based on the configured initial-highlight strategy.
   * @param enabledHint - When supplied (e.g. from {@link reconcileAfterRegistryChange}), avoids a second
   * `getEnabledEntries()` read.
   */
  applyInitialHighlight(enabledHint?: readonly OptionEntry<T>[]): void {
    const strategy = this.config.getInitialHighlight();
    const entries = enabledHint ?? this.config.registry.getEnabledEntries();

    if (entries.length === 0) {
      this.setActive(null);

      return;
    }
    const item = this.computeInitialActiveItem(strategy, entries);
    this.setActive(item);
  }

  /**
   * Returns the item to highlight for the given strategy and entries.
   * For 'selected': matches current value; falls back to first when nothing selected or no match.
   */
  private computeInitialActiveItem(
    strategy: ListboxInitialHighlight,
    entries: readonly OptionEntry<T>[],
  ): T | null {
    if (strategy === 'none') return null;
    if (strategy === 'first') return entries[0].item;
    if (strategy === 'last') return entries[entries.length - 1].item;

    // 'selected': highlight the option matching the current value.
    const value = this.config.getValue();
    const multi = this.config.getMulti();
    const hasValue = multi
      ? Array.isArray(value) && value.length > 0
      : value != null && !Array.isArray(value);

    if (!hasValue) return entries[0].item;

    const searchValue = multi ? (value as readonly T[])[0] : (value as T);

    return entries.find((e) => this.itemsMatch(e.item, searchValue))?.item ?? null;
  }

  /**
   * Re-applies initial highlight when the active option is no longer registered
   * (e.g. option removed from DOM).
   */
  reconcileAfterRegistryChange(): void {
    const active = this.activeOption();
    const registry = this.config.registry;
    const keepWhenMissing = this.config.getKeepActiveWhenMissingFromRegistry?.();
    const enabled = registry.getEnabledEntries();

    if (enabled.length === 0) {
      if (!keepWhenMissing) this.setActive(null);

      return;
    }

    const registeredActive =
      active != null
        ? (registry.findEntry(active, (a, b) => this.itemsMatch(a, b))?.item ?? null)
        : null;
    const activeInEnabledList =
      registeredActive != null && registry.getEnabledIndex(registeredActive) >= 0;

    if (active == null || !activeInEnabledList) {
      if (keepWhenMissing) return;
      this.applyInitialHighlight(enabled);
    }
  }

  /**
   * Fallback O(M) scan used only when a custom `compareWith` is provided.
   *
   * @remarks Non-array branch uses `value as T` when `T` may overlap array types (TS / Angular
   * cannot narrow `T | readonly T[]` there).
   */
  private isSelectedLinear(item: T, value: T | null | readonly T[]): boolean {
    const multi = this.config.getMulti();

    if (multi && Array.isArray(value)) {
      const arr = value;

      return arr.some((v) => this.itemsMatch(v, item));
    }

    if (!multi && value != null && !Array.isArray(value)) {
      return this.itemsMatch(value as T, item);
    }

    return false;
  }

  /**
   * Builds a Set of selected value identities — O(M) once, then O(1) per lookup.
   *
   * @remarks Non-array branch uses `value as T` for the same generic-overlap reason as
   * {@link isSelectedLinear}.
   */
  private buildSelectionSet(value: T | null | readonly T[]): ReadonlySet<unknown> {
    const set = new Set<unknown>();
    const accessors = this.config.getAccessors();
    const extractKey = accessors ? (v: T) => accessors.value(v) : (v: T) => v;

    if (Array.isArray(value)) {
      for (const v of value) {
        set.add(extractKey(v));
      }
    } else if (value != null) {
      set.add(extractKey(value as T));
    }

    return set;
  }

  /**
   * Compares two items for identity. When a custom `compareWith` is provided, it receives
   * raw items (T). When using the default comparator, accessor-extracted values are compared
   * so object identity is not required when accessors extract a stable id.
   */
  private itemsMatch(a: T, b: T): boolean {
    const compare = this.config.getCompareWith();

    if (compare !== DEFAULT_COMPARE_WITH) {
      return compare(a, b);
    }

    const accessors = this.config.getAccessors();

    if (accessors) {
      return accessors.value(a) === accessors.value(b);
    }

    return a === b;
  }

  private getAdjacent(direction: 1 | -1): T | null {
    const registry = this.config.registry;
    const entries = registry.getEnabledEntries();

    if (entries.length === 0) return null;

    const orientation = this.config.getOrientation();
    const dir = this.config.getDir();
    const wrap = this.config.getWrap();
    const effectiveDirection = this.getEffectiveDirection(direction, orientation, dir);

    const current = this.activeOption();
    const currentEntry =
      current != null ? registry.findEntry(current, (a, b) => this.itemsMatch(a, b)) : null;
    const currentIndex = currentEntry != null ? registry.getEnabledIndex(currentEntry.item) : -1;
    let nextIndex: number;

    if (currentIndex === -1) {
      nextIndex = effectiveDirection === 1 ? 0 : entries.length - 1;
    } else {
      nextIndex = currentIndex + effectiveDirection;

      if (wrap) {
        if (nextIndex >= entries.length) {
          nextIndex = 0;
        } else if (nextIndex < 0) {
          nextIndex = entries.length - 1;
        }
      } else {
        if (nextIndex < 0 || nextIndex >= entries.length) {
          this.config.onBoundaryReached(this.boundaryFromDirection(effectiveDirection));

          return null;
        }
      }
    }

    return entries[nextIndex]?.item ?? null;
  }

  private getEffectiveDirection(
    direction: 1 | -1,
    orientation: ListboxOrientation,
    dir: 'ltr' | 'rtl',
  ): 1 | -1 {
    return orientation === 'horizontal' && dir === 'rtl' ? (-direction as 1 | -1) : direction;
  }

  private boundaryFromDirection(direction: 1 | -1): ListboxBoundary {
    return direction === 1 ? 'end' : 'start';
  }
}

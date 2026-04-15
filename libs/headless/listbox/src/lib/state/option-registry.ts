/**
 * Option registry: maintains ordered list of registered options (item + element).
 * Navigation order is determined by DOM order (not registration order) so that
 * dynamic lists (e.g. combobox filter) work correctly when Angular reuses views.
 */

import { createId } from '@nexora-ui/core';

import { findDomOrderInsertionIndex, sortOptionEntriesByDomOrder } from './option-entry-dom-order';

const OPTION_ID_PREFIX = 'nxr-listbox-option-';

export interface OptionEntry<T> {
  readonly id: string;
  readonly item: T;
  readonly element: HTMLElement;
  /** Mutable so registry can update when accessors change. */
  disabled: boolean;
}

/**
 * Registry of option directives (item + element).
 * getEnabledEntries() returns enabled options sorted by DOM order for navigation.
 *
 * Performance:
 * - When the enabled cache already exists, registering a new enabled option inserts it in DOM
 *   order instead of invalidating that cache (dynamic lists avoid O(N²) rebuilds).
 * - DOM-order sort of all entries is cached until register/unregister/clear; {@link findEntry}
 *   and {@link getEnabledEntries} rebuilds share that sort (no per-call O(N log N) sort).
 * - Optional {@link setEquivalenceKeyFn}: when listbox provides `accessors.value`, a lazily-built
 *   map (first DOM-ordered row per key) can short-circuit {@link findEntry} before a linear scan.
 */
export class OptionRegistry<T> {
  private readonly entries: OptionEntry<T>[] = [];
  private readonly idByItem = new Map<T, string>();
  private readonly entryByItem = new Map<T, OptionEntry<T>>();
  /** Slot index of each entry in {@link entries}; maintained for O(1) {@link unregister}. */
  private readonly entrySlotIndex = new Map<OptionEntry<T>, number>();

  private cachedEnabled: OptionEntry<T>[] | null = null;
  private enabledIndexMap: Map<T, number> | null = null;
  /**
   * All entries sorted by DOM order. Invalidated on register/unregister/clear.
   * Reused by {@link findEntry} (equivalent-item scans) and {@link buildEnabledEntries} (no second sort).
   */
  private domSortedEntries: OptionEntry<T>[] | null = null;
  /**
   * When set (e.g. listbox `accessors.value`), {@link findEntry} tries a key lookup first.
   * Cleared when the function reference changes or DOM sort cache is invalidated.
   */
  private equivalenceKeyFn: ((item: T) => unknown) | null = null;
  private equivalenceKeyIndex: Map<unknown, OptionEntry<T>> | null = null;

  /**
   * Registers an option. Call when the option directive is initialized.
   * When cache exists and the option is enabled, inserts in DOM order; otherwise invalidates cache.
   */
  register(item: T, element: HTMLElement, disabled: boolean): string {
    const id = `${OPTION_ID_PREFIX}${createId()}`;
    const entry: OptionEntry<T> = { id, item, element, disabled };
    this.entries.push(entry);
    this.entrySlotIndex.set(entry, this.entries.length - 1);
    this.idByItem.set(item, id);
    this.entryByItem.set(item, entry);

    if (!disabled && this.cachedEnabled !== null) {
      const idx = findDomOrderInsertionIndex(this.cachedEnabled, entry);
      this.cachedEnabled.splice(idx, 0, entry);
      this.enabledIndexMap = null;
    } else {
      this.invalidateEnabledCache();
    }

    this.invalidateDomSortedCache();

    return id;
  }

  /**
   * Unregisters an option. Call when the option directive is destroyed.
   */
  unregister(item: T): void {
    const entry = this.entryByItem.get(item);

    if (!entry) return;

    this.idByItem.delete(item);
    this.entryByItem.delete(item);

    const index = this.entrySlotIndex.get(entry);
    this.entrySlotIndex.delete(entry);

    if (index !== undefined) {
      const lastIdx = this.entries.length - 1;

      if (index !== lastIdx) {
        const moved = this.entries[lastIdx];
        this.entries[index] = moved;
        this.entrySlotIndex.set(moved, index);
      }

      this.entries.length = lastIdx;
    }

    this.invalidateEnabledCache();
    this.invalidateDomSortedCache();
  }

  /** Returns true if the item is currently registered (any disabled state). */
  has(item: T): boolean {
    return this.entryByItem.has(item);
  }

  /**
   * When listbox exposes `accessors.value`, pass it here so equivalent-item lookups can use an
   * O(1) map (first DOM-ordered row per key). Pass `null` when options are primitives without accessors.
   */
  setEquivalenceKeyFn(fn: ((item: T) => unknown) | null | undefined): void {
    const next = fn ?? null;
    if (this.equivalenceKeyFn === next) return;
    this.equivalenceKeyFn = next;
    this.equivalenceKeyIndex = null;
  }

  /** True if any registered option matches {@link candidate} by reference or {@link isSameItem}. */
  hasEquivalent(candidate: T, isSameItem: (registered: T, candidate: T) => boolean): boolean {
    return this.findEntry(candidate, isSameItem) != null;
  }

  /**
   * The registered entry for {@link candidate} (direct reference or first DOM-ordered match).
   */
  findEntry(
    candidate: T,
    isSameItem: (registered: T, candidate: T) => boolean,
  ): OptionEntry<T> | null {
    const direct = this.entryByItem.get(candidate);
    if (direct) return direct;

    const keyFn = this.equivalenceKeyFn;
    if (keyFn != null) {
      const idx = this.getEquivalenceKeyIndex();
      if (idx !== null) {
        const k = keyFn(candidate);
        const hit = idx.get(k);
        if (hit != null && isSameItem(hit.item, candidate)) return hit;
      }
    }

    const sorted = this.getDomSortedEntries();

    for (const e of sorted) {
      if (isSameItem(e.item, candidate)) return e;
    }

    return null;
  }

  /** Returns the stable id for the item if it is currently registered; otherwise null. */
  getId(item: T): string | null {
    return this.idByItem.get(item) ?? null;
  }

  /**
   * Resolves the id of a registered option that matches {@link candidate} when reference-keyed
   * {@link getId} misses (e.g. same logical row, different object instance). Includes disabled rows.
   */
  getIdForEquivalentItem(
    candidate: T,
    isSameItem: (registered: T, candidate: T) => boolean,
  ): string | null {
    return this.findEntry(candidate, isSameItem)?.id ?? null;
  }

  /**
   * Resolves the element for a registered option matching {@link candidate} when {@link getElement} misses.
   */
  getElementForEquivalentItem(
    candidate: T,
    isSameItem: (registered: T, candidate: T) => boolean,
  ): HTMLElement | null {
    return this.findEntry(candidate, isSameItem)?.element ?? null;
  }

  /**
   * All registered entries. Array order is an internal slot sequence and may change when
   * options unregister (swap-with-last). For DOM/navigation order use {@link getEnabledEntries}.
   */
  getEntries(): readonly OptionEntry<T>[] {
    return this.entries;
  }

  /**
   * Updates `disabled` on every registered option in one pass.
   * Invalidates the enabled cache at most once, so bulk updates avoid O(k) cache thrashing
   * from repeated {@link setDisabled} calls.
   */
  syncDisabledFlags(resolveDisabled: (item: T) => boolean): void {
    let changed = false;

    for (const entry of this.entries) {
      const disabled = resolveDisabled(entry.item);

      if (entry.disabled !== disabled) {
        entry.disabled = disabled;
        changed = true;
      }
    }

    if (changed) {
      this.invalidateEnabledCache();
    }
  }

  /**
   * Returns enabled entries in DOM order (for navigation and scroll-into-view).
   * Cached until invalidated by register/unregister/setDisabled/clear.
   */
  getEnabledEntries(): readonly OptionEntry<T>[] {
    if (this.cachedEnabled === null) {
      this.cachedEnabled = this.buildEnabledEntries();
      this.enabledIndexMap = null;
    }

    return this.cachedEnabled;
  }

  /**
   * Returns the index of an item within the enabled entries, or -1 if not found.
   * Backed by a lazily-built Map for O(1) lookup.
   */
  getEnabledIndex(item: T): number {
    if (this.enabledIndexMap === null) {
      this.enabledIndexMap = this.buildEnabledIndexMap(this.getEnabledEntries());
    }

    return this.enabledIndexMap.get(item) ?? -1;
  }

  /** Returns the element for the given item if registered; otherwise null. */
  getElement(item: T): HTMLElement | null {
    return this.entryByItem.get(item)?.element ?? null;
  }

  /** O(1) disabled check using the cached entry. */
  isDisabled(item: T): boolean {
    return this.entryByItem.get(item)?.disabled ?? false;
  }

  /** Updates the disabled state of an option (e.g. when accessors change). */
  setDisabled(item: T, disabled: boolean): void {
    const entry = this.entryByItem.get(item);

    if (entry && entry.disabled !== disabled) {
      entry.disabled = disabled;
      this.invalidateEnabledCache();
    }
  }

  /** Clears all entries (e.g. when listbox is destroyed). */
  clear(): void {
    this.entries.length = 0;
    this.idByItem.clear();
    this.entryByItem.clear();
    this.entrySlotIndex.clear();
    this.invalidateEnabledCache();
    this.invalidateDomSortedCache();
  }

  private invalidateEnabledCache(): void {
    this.cachedEnabled = null;
    this.enabledIndexMap = null;
  }

  private invalidateDomSortedCache(): void {
    this.domSortedEntries = null;
    this.equivalenceKeyIndex = null;
  }

  private getEquivalenceKeyIndex(): Map<unknown, OptionEntry<T>> | null {
    const fn = this.equivalenceKeyFn;
    if (fn == null) return null;
    if (this.equivalenceKeyIndex !== null) return this.equivalenceKeyIndex;

    const map = new Map<unknown, OptionEntry<T>>();
    const sorted = this.getDomSortedEntries();

    for (const e of sorted) {
      const k = fn(e.item);
      if (!map.has(k)) map.set(k, e);
    }

    this.equivalenceKeyIndex = map;

    return map;
  }

  private getDomSortedEntries(): OptionEntry<T>[] {
    if (this.domSortedEntries === null) {
      this.domSortedEntries = sortOptionEntriesByDomOrder(this.entries);
    }

    return this.domSortedEntries;
  }

  private buildEnabledEntries(): OptionEntry<T>[] {
    const sorted = this.getDomSortedEntries();
    const enabled: OptionEntry<T>[] = [];

    for (const e of sorted) {
      if (!e.disabled) enabled.push(e);
    }

    return enabled;
  }

  private buildEnabledIndexMap(enabled: readonly OptionEntry<T>[]): Map<T, number> {
    const map = new Map<T, number>();

    for (const [i, e] of enabled.entries()) {
      map.set(e.item, i);
    }

    return map;
  }
}

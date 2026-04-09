/**
 * Listbox container: host semantics, keyboard, registry, typeahead, and optional virtual-scroll handler.
 * Virtual arrow/Home/End index math lives in `virtual-scroll-nav-index`; active index resolution
 * for the virtual handler lives in `resolve-listbox-virtual-scroll-index`. Overlay hosts can import
 * `scheduleListboxScrollActiveOnNextMicrotask` for `onListboxReady` scroll timing.
 */

import {
  Directive,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import type { OnDestroy } from '@angular/core';
import { createRafThrottled, getResolvedDir, idFactory, warnOnce } from '@nexora-ui/core';

import { LISTBOX_NAV_OR_HOME_END_KEYS } from '../constants/listbox-keyboard-constants';
import { NxrListboxVirtualScrollRegistry } from '../internal/virtual-scroll-registry';
import { ListboxState } from '../state/listbox-state';
import type { ListboxStateConfig } from '../state/listbox-state';
import { OptionRegistry } from '../state/option-registry';
import { Typeahead } from '../state/typeahead';
import type { TypeaheadOption } from '../state/typeahead';
import {
  DEFAULT_COMPARE_WITH,
  NXR_LISTBOX_CONTROLLER,
  NXR_LISTBOX_VIRTUAL_SCROLL_HANDLER,
  type ListboxAccessors,
  type ListboxBoundary,
  type ListboxInitialHighlight,
  type ListboxOrientation,
  type ListboxRole,
  type NxrListboxController,
  type NxrListboxVirtualScrollHandler,
} from '../types';
import { isTextInputEventTarget } from '../utils/event-target-text-input';
import { LISTBOX_OPTION_SCROLL_INTO_VIEW } from '../utils/listbox-scroll-into-view';
import { normalizeOption } from '../utils/normalize-options';
import { resolveListboxVirtualScrollIndex } from '../utils/resolve-listbox-virtual-scroll-index';
import {
  computeVirtualListKeyNavigationIndex,
  virtualScrollAlignmentForListboxKey,
} from '../utils/virtual-scroll-nav-index';

const ACTIVATION_KEYS: ReadonlySet<string> = new Set(['Enter', ' ']);

@Directive({
  selector: '[nxrListbox]',
  exportAs: 'nxrListbox',
  host: {
    '[attr.role]': 'nxrListboxRole()',
    '[attr.id]': 'listboxId()',
    '[attr.tabindex]': '"0"',
    '[attr.aria-orientation]': 'nxrListboxOrientation()',
    '[attr.aria-multiselectable]': 'ariaMultiSelectable()',
    '[attr.aria-activedescendant]': 'activeOptionId()',
    '(keydown)': 'handleKeydown($event)',
  },
  providers: [{ provide: NXR_LISTBOX_CONTROLLER, useExisting: ListboxDirective }],
})
export class ListboxDirective<T = unknown> implements OnDestroy, NxrListboxController<T> {
  private readonly hostRef = inject(ElementRef<HTMLElement>);
  private readonly hostId = idFactory('nxr-listbox')();

  readonly nxrListboxValue = input<T | null | readonly T[]>(null);
  readonly nxrListboxMulti = input<boolean>(false);
  readonly nxrListboxAccessors = input<ListboxAccessors<T> | undefined>(undefined);
  readonly nxrListboxCompareWith = input<((a: unknown, b: unknown) => boolean) | undefined>(
    undefined,
  );
  readonly nxrListboxRole = input<ListboxRole>('listbox');
  readonly nxrListboxOrientation = input<ListboxOrientation>('vertical');
  readonly nxrListboxWrap = input<boolean>(false);
  readonly nxrListboxInitialHighlight = input<ListboxInitialHighlight>('none');
  /** When `'action'`, no value binding; only optionActivated is emitted. Default `'selection'`. */
  readonly nxrListboxMode = input<'selection' | 'action'>('selection');

  readonly nxrListboxValueChange = output<T | null | readonly T[]>();
  readonly nxrListboxOptionActivated = output<{ option: T }>();
  /** Emits when keyboard navigation hits the edge of the list with wrap disabled. */
  readonly nxrListboxBoundaryReached = output<ListboxBoundary>();

  readonly ariaMultiSelectable = computed(() => {
    const r = this.nxrListboxRole();
    const multi = this.nxrListboxMulti();

    return r === 'listbox' && multi ? 'true' : null;
  });

  private readonly registry = new OptionRegistry<T>();
  private readonly typeahead = new Typeahead<T>();
  private readonly valueSignal = linkedSignal<T | null | readonly T[]>(
    () => this.nxrListboxValue() ?? null,
  );
  private readonly hostDir: 'ltr' | 'rtl';
  private readonly state: ListboxState<T>;
  /** Predicate for {@link OptionRegistry.findEntry} / equivalent lookups (compareWith / accessors / ===). */
  private readonly matchRegistryItem = (reg: T, cand: T): boolean => this.state.sameItem(reg, cand);
  private readonly virtualScrollHandler = inject(NXR_LISTBOX_VIRTUAL_SCROLL_HANDLER, {
    optional: true,
  }) as NxrListboxVirtualScrollHandler<T> | undefined;
  private readonly virtualScrollRegistry = inject(NxrListboxVirtualScrollRegistry, {
    optional: true,
  });

  /** Scroll-into-view is only enabled after the first keyboard interaction. */
  private scrollEnabled = false;
  private typeaheadDirty = true;
  private cachedTypeaheadOptions: TypeaheadOption<T>[] = [];
  /** Indices into {@link cachedTypeaheadOptions} by item; only valid when `typeaheadDirty` is false. */
  private typeaheadIndexByItem: Map<T, number> | null = null;
  private pendingScrollItem: T | null = null;
  private readonly throttledScroll = createRafThrottled(() => {
    const item = this.pendingScrollItem;

    if (item != null) {
      this.scrollOptionIntoView(item);
      this.pendingScrollItem = null;
    }
  });

  constructor() {
    this.hostDir = getResolvedDir(this.hostRef.nativeElement);
    this.state = new ListboxState(this.buildStateConfig());
    this.state.applyInitialHighlight();

    effect(() => this.warnMultiMenuIfNeeded());
    effect(() => {
      this.nxrListboxAccessors();
      this.refreshAllOptionDisabledStates();
    });
    effect(() => {
      const acc = this.nxrListboxAccessors();
      this.registry.setEquivalenceKeyFn(acc?.value ?? null);
    });
    // Scroll active option into view when active changes. Skipped when a virtual scroll handler
    // is present (handler owns scrolling via scrollToIndex(index, alignment)).
    effect(() => this.scheduleScrollActiveIntoView());
  }

  /** Builds the config object for ListboxState (getters and callbacks). */
  private buildStateConfig(): ListboxStateConfig<T> {
    return {
      registry: this.registry,
      getValue: () => this.valueSignal(),
      getMulti: () => this.nxrListboxMulti(),
      getSelectionMode: () => this.nxrListboxMode() === 'selection',
      getAccessors: () => this.nxrListboxAccessors(),
      getCompareWith: () => this.nxrListboxCompareWith() ?? DEFAULT_COMPARE_WITH,
      getInitialHighlight: () => this.nxrListboxInitialHighlight(),
      getWrap: () => this.nxrListboxWrap(),
      getOrientation: () => this.nxrListboxOrientation(),
      getDir: () => this.hostDir,
      onValueChange: (v) => {
        this.valueSignal.set(v);
        this.nxrListboxValueChange.emit(v);
      },
      onOptionActivated: (item) => {
        this.nxrListboxOptionActivated.emit({ option: item });
      },
      onBoundaryReached: (boundary) => {
        this.nxrListboxBoundaryReached.emit(boundary);
      },
      getKeepActiveWhenMissingFromRegistry: () => this.getVirtualScrollHandler() != null,
    };
  }

  private warnMultiMenuIfNeeded(): void {
    if (this.nxrListboxMulti() && this.nxrListboxRole() === 'menu') {
      warnOnce(
        'listbox-multi-menu',
        'nxrListboxMulti is true with nxrListboxRole="menu"; multi-select is not meaningful for menu role and is ignored.',
      );
    }
  }

  private scheduleScrollActiveIntoView(): void {
    if (this.hasVirtualScrollHandler()) return;
    const active = this.state.activeOption();
    if (active != null && this.scrollEnabled) {
      this.pendingScrollItem = active;
      this.throttledScroll.run();
    }
  }

  private getVirtualScrollHandler(): NxrListboxVirtualScrollHandler<T> | undefined {
    return (this.virtualScrollHandler ?? this.virtualScrollRegistry?.getHandler()) as
      | NxrListboxVirtualScrollHandler<T>
      | undefined;
  }

  private resolveVirtualScrollIndex(
    handler: NxrListboxVirtualScrollHandler<T>,
    active: T | null,
  ): number {
    return resolveListboxVirtualScrollIndex(handler, active, (a, b) => this.state.sameItem(a, b));
  }

  private hasVirtualScrollHandler(): boolean {
    return this.getVirtualScrollHandler() != null;
  }

  listboxId(): string {
    return this.hostId;
  }

  activeOption(): T | null {
    return this.state.activeOption();
  }

  activeOptionId(): string | null {
    const active = this.state.activeOption();
    if (active == null) return null;

    return this.getOptionId(active);
  }

  isSelected(item: T): boolean {
    return this.state.isSelected(item);
  }

  isActive(item: T): boolean {
    return this.state.isActive(item);
  }

  selectOption(item: T): void {
    if (this.nxrListboxMode() === 'action') return;
    this.state.activate(item);
  }

  /** Scroll the currently active option into view (e.g. on panel open). */
  scrollActiveIntoView(): void {
    const active = this.state.activeOption();
    if (active == null) return;
    const handler = this.getVirtualScrollHandler();
    if (handler != null) {
      const idx = this.resolveVirtualScrollIndex(handler, active);
      if (idx >= 0) {
        handler.scrollToIndex(idx, 'nearest');
        return;
      }
    }
    this.scrollOptionIntoView(active);
  }

  handleKeydown(event: KeyboardEvent): void {
    this.scrollEnabled = true;
    const key = event.key;
    const isVertical = this.nxrListboxOrientation() === 'vertical';
    const fromTextInput = isTextInputEventTarget(event.target);

    if (this.isListboxNavKey(key, isVertical)) {
      if (this.shouldSkipNavFromTextInput(key, fromTextInput)) return;
      event.preventDefault();
      this.typeahead.reset();
      const vscrollHandled = this.tryVirtualScrollNav(key, isVertical);
      if (vscrollHandled === true) return;
      if (vscrollHandled === 'boundary') {
        const boundary = this.boundaryForKey(key);
        this.nxrListboxBoundaryReached.emit(boundary);

        return;
      }
      const nextItem = this.resolveNavigation(key, isVertical);
      if (nextItem !== undefined) {
        if (nextItem != null) this.state.setActive(nextItem);

        return;
      }

      return;
    }

    if (ACTIVATION_KEYS.has(key)) {
      if (fromTextInput && key === ' ') return;
      event.preventDefault();
      const active = this.state.activeOption();
      if (active != null) this.state.activate(active);

      return;
    }

    if (fromTextInput) return;

    const typeaheadOpts = this.getTypeaheadOptions();
    const rawActive = this.state.activeOption();
    const active =
      rawActive != null
        ? (this.registry.findEntry(rawActive, this.matchRegistryItem)?.item ?? rawActive)
        : null;
    const typeaheadIdx = active != null ? (this.typeaheadIndexByItem?.get(active) ?? -1) : -1;
    const typeaheadMatch = this.typeahead.handleKey(
      key,
      typeaheadOpts,
      active,
      typeaheadIdx >= 0 ? typeaheadIdx : undefined,
      (a, b) => this.state.sameItem(a, b),
    );
    if (typeaheadMatch != null) {
      event.preventDefault();
      this.state.setActive(typeaheadMatch);
    }
  }

  private isListboxNavKey(key: string, isVertical: boolean): boolean {
    if (!LISTBOX_NAV_OR_HOME_END_KEYS.has(key)) return false;
    if (key === 'ArrowDown' || key === 'ArrowUp') return isVertical;
    if (key === 'ArrowLeft' || key === 'ArrowRight') return !isVertical;

    return true;
  }

  private shouldSkipNavFromTextInput(key: string, fromTextInput: boolean): boolean {
    return fromTextInput && (key === 'Home' || key === 'End');
  }

  private boundaryForKey(key: string): ListboxBoundary {
    return key === 'ArrowDown' || key === 'ArrowRight' ? 'end' : 'start';
  }

  /**
   * When a virtual scroll handler is present, use it for all nav keys (index-based).
   * Returns true if handled, 'boundary' if at start/end, false if no handler.
   */
  private tryVirtualScrollNav(key: string, isVertical: boolean): boolean | 'boundary' {
    const handler = this.getVirtualScrollHandler();
    if (handler == null) return false;

    const active = this.state.activeOption();
    const currentIndex = this.resolveVirtualScrollIndex(handler, active);
    const count = handler.getCount();
    if (count === 0) return false;

    const isVerticalNav = isVertical;
    const nextIndex = computeVirtualListKeyNavigationIndex({
      key,
      currentIndex,
      count,
      isVerticalNav,
      rtl: this.hostDir === 'rtl',
    });
    if (nextIndex == null) return false;

    if (nextIndex < 0 || nextIndex >= count) return 'boundary';

    const alignment = virtualScrollAlignmentForListboxKey(key);
    const nextItem = handler.getItemAtIndex(nextIndex);
    // Set active before scroll so option rows and `data-active` line up with CDK updates; scrolling
    // first can leave one frame (or more) where the viewport row still shows the previous item.
    this.state.setActive(nextItem);
    handler.scrollToIndex(nextIndex, alignment);

    return true;
  }

  private resolveNavigation(key: string, isVertical: boolean): T | null | undefined {
    switch (key) {
      case 'ArrowDown':
        return isVertical ? this.state.getNext() : undefined;
      case 'ArrowUp':
        return isVertical ? this.state.getPrev() : undefined;
      case 'ArrowRight':
        return !isVertical ? this.state.getNext() : undefined;
      case 'ArrowLeft':
        return !isVertical ? this.state.getPrev() : undefined;
      case 'Home':
        return this.state.getFirst();
      case 'End':
        return this.state.getLast();
      default:
        return undefined;
    }
  }

  registerOption(item: T, element: HTMLElement): string {
    const accessors = this.nxrListboxAccessors();
    const normalized = normalizeOption(item, accessors ?? null);
    const id = this.registry.register(item, element, normalized.disabled);
    this.typeaheadDirty = true;
    this.state.reconcileAfterRegistryChange();

    return id;
  }

  unregisterOption(item: T): void {
    const entry = this.registry.findEntry(item, this.matchRegistryItem);
    if (!entry) return;

    this.registry.unregister(entry.item);
    this.typeaheadDirty = true;
    this.state.reconcileAfterRegistryChange();
  }

  refreshOption(item: T): void {
    const entry = this.registry.findEntry(item, this.matchRegistryItem);
    if (!entry) return;

    const accessors = this.nxrListboxAccessors();
    const normalized = normalizeOption(item, accessors ?? null);
    this.registry.setDisabled(entry.item, normalized.disabled);
    this.typeaheadDirty = true;
    this.state.reconcileAfterRegistryChange();
  }

  getOptionId(item: T): string | null {
    return this.registry.getIdForEquivalentItem(item, this.matchRegistryItem);
  }

  isDisabled(item: T): boolean {
    return this.registry.findEntry(item, this.matchRegistryItem)?.disabled ?? false;
  }

  getRole(): 'option' | 'menuitem' {
    return this.nxrListboxRole() === 'menu' ? 'menuitem' : 'option';
  }

  setDisabled(item: T, disabled: boolean): void {
    const entry = this.registry.findEntry(item, this.matchRegistryItem);
    if (!entry) return;

    this.registry.setDisabled(entry.item, disabled);
  }

  setActiveOption(item: T): void {
    this.state.setActive(item);
  }

  activateOption(item: T): void {
    this.state.activate(item);
  }

  ngOnDestroy(): void {
    this.throttledScroll.cancel();
    this.typeahead.destroy();
    this.registry.clear();
  }

  // ---------------------------------------------------------------------------
  // Private — typeahead, scroll
  // ---------------------------------------------------------------------------

  private getTypeaheadOptions(): TypeaheadOption<T>[] {
    if (!this.typeaheadDirty) return this.cachedTypeaheadOptions;

    const accessors = this.nxrListboxAccessors() ?? null;
    const entries = this.registry.getEnabledEntries();
    const result: TypeaheadOption<T>[] = [];

    const indexByItem = new Map<T, number>();

    for (const entry of entries) {
      const { label, disabled } = normalizeOption(entry.item, accessors);

      if (label.length > 0 && !disabled) {
        const opt: TypeaheadOption<T> = {
          item: entry.item,
          label,
          normalizedLabel: label.toLowerCase(),
          disabled,
        };
        indexByItem.set(entry.item, result.length);
        result.push(opt);
      }
    }

    this.cachedTypeaheadOptions = result;
    this.typeaheadIndexByItem = indexByItem;
    this.typeaheadDirty = false;

    return result;
  }

  private refreshAllOptionDisabledStates(): void {
    const accessors = this.nxrListboxAccessors() ?? null;

    this.registry.syncDisabledFlags((item) => normalizeOption(item, accessors).disabled);

    this.typeaheadDirty = true;
    this.state.reconcileAfterRegistryChange();
  }

  private scrollOptionIntoView(item: T): void {
    const el = this.registry.getElementForEquivalentItem(item, this.matchRegistryItem);

    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView(LISTBOX_OPTION_SCROLL_INTO_VIEW);
    }
  }
}

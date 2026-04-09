/**
 * nxr-combobox — Root component for headless combobox.
 *
 * Owns value, input/search state, overlay lifecycle, CVA, and listbox coordination.
 * Supports single-select and multi-select with distinct behavior:
 *
 * Single mode:
 * - Input shows selected option label when not editing; serves as search when typing.
 * - isEditing separates "display selection" from "active filter": when false, effective
 *   filter query is '' so reopening shows full list; when true, filter = inputValue.
 *
 * Multi mode:
 * - Input is search-only; selected values are shown as chips/tags (consumer markup).
 * - Effective filter query is always inputValue; clear inputValue on option select.
 *
 * Child directives delegate to this component. Reuses DropdownRef and Listbox.
 *
 * Performance (large lists): Filter options in the consumer using the search query so only
 * visible options are rendered. For very large lists, consider virtual scrolling inside the
 * panel template (e.g. @angular/cdk/scrolling). See LARGE_LIST_ITEM_THRESHOLD in constants.
 *
 * Built-in virtual mode: `createListboxVirtualDropdownPanelStyle` / `mergeVirtualDropdownPaneStyle`
 * plus listbox-cdk overlay flex layout; viewport height is capped by `viewportMaxHeight`.
 * Overlay `onListboxReady` uses `bindListboxReadyWithActiveScroll` from `@nexora-ui/listbox`.
 *
 * **`disable()`** closes an open panel (reason `programmatic`) before applying programmatic disable; pair with **`enable()`**.
 */

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  DestroyRef,
  effect,
  ElementRef,
  Injector,
  ViewContainerRef,
  ViewEncapsulation,
  afterNextRender,
  forwardRef,
  inject,
  input,
  isDevMode,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { type ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { safeFocus, warnOnce } from '@nexora-ui/core';
import {
  canOpenDropdown,
  computeDisplayValue,
  DEFAULT_CLOSE_ANIMATION_MS,
  DEFAULT_MAX_HEIGHT,
  DEFAULT_OFFSET,
  DropdownRef,
  getEmptySelectionValue,
  hasSelectionValue,
  normalizeSingleOrMultiValue,
  resolveOpenPanelDirective,
  teardownAnchoredDropdownHostState,
  toSelectedValuesArray,
  type DropdownRefOptions,
} from '@nexora-ui/dropdown';
import { type ListboxInitialHighlight } from '@nexora-ui/listbox';
import type { ListboxDirective } from '@nexora-ui/listbox/internal';
import { BuiltinVirtualDropdownPanelComponent } from '@nexora-ui/listbox-cdk';
import { createBuiltinVirtualPanelSignals } from '@nexora-ui/listbox-cdk/internal';
import {
  type BeforeCloseCallback,
  type BeforeOpenCallback,
  CLOSE_REASON_PROGRAMMATIC,
  CLOSE_REASON_SELECTION,
  OverlayService,
  type CloseReason,
  type Placement,
  type ViewportBoundaries,
} from '@nexora-ui/overlay';

import { COMBOBOX_HOST_CLASS } from '../constants/combobox-constants';
import { ComboboxAnchorDirective } from '../directives/combobox-anchor.directive';
import { ComboboxInputDirective } from '../directives/combobox-input.directive';
import { ComboboxPanelDirective } from '../directives/combobox-panel.directive';
import {
  ComboboxVirtualFooterTemplateDirective,
  ComboboxVirtualHeaderTemplateDirective,
  ComboboxVirtualOptionTemplateDirective,
} from '../directives/combobox-virtual-panel-templates.directive';
import {
  assertComboboxContentStructure,
  applySelectionChange,
  buildComboboxDropdownRefOptions,
  clearSearchState,
  ComboboxDisplaySync,
  ComboboxFocusOpenState,
  createComboboxListboxOverlayPortal,
  handleComboboxDropdownClosed,
  handleComboboxDropdownOpened,
  handleComboboxInputKeydown,
  multiSelectionRemovingEquivalentItems,
  normalizeSelectionValue,
  setSearchQuery,
} from '../internal';
import { NXR_COMBOBOX, type ComboboxController } from '../tokens/combobox-tokens';
import type { ComboboxAccessors, ComboboxScrollStrategy } from '../types/combobox-types';

@Component({
  selector: 'nxr-combobox',
  standalone: true,
  imports: [BuiltinVirtualDropdownPanelComponent, ComboboxPanelDirective],
  templateUrl: './combobox.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'nxrCombobox',
  host: {
    class: COMBOBOX_HOST_CLASS,
    '[attr.data-open]': 'isOpen() ? "" : null',
  },
  providers: [
    { provide: NXR_COMBOBOX, useExisting: forwardRef(() => ComboboxComponent) },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ComboboxComponent),
      multi: true,
    },
  ],
})
export class ComboboxComponent<T = unknown> implements ComboboxController, ControlValueAccessor {
  /* ═══ Injections and content children ═══ */
  private readonly overlay = inject(OverlayService);
  private readonly vcr = inject(ViewContainerRef);
  private readonly injector = inject(Injector);
  private readonly hostRef = inject(ElementRef<HTMLElement>);

  private readonly inputRef = contentChild(ComboboxInputDirective);
  private readonly panelRef = contentChild(ComboboxPanelDirective);
  private readonly anchorRef = contentChild(ComboboxAnchorDirective);
  private readonly virtualBuiltinPanel = viewChild<ComboboxPanelDirective>('virtualBuiltin');

  /** Optional `ng-template` slots for built-in virtual panel (template-visible for binding). */
  readonly virtualOptionTpl = contentChild(ComboboxVirtualOptionTemplateDirective);
  readonly virtualHeaderTpl = contentChild(ComboboxVirtualHeaderTemplateDirective);
  readonly virtualFooterTpl = contentChild(ComboboxVirtualFooterTemplateDirective);

  /* ═══ Value and selection inputs ═══ */
  readonly value = model<T | null | readonly T[]>(null);
  readonly multi = input(false);
  readonly accessors = input<ComboboxAccessors<T> | undefined>(undefined);
  readonly compareWith = input<((a: unknown, b: unknown) => boolean) | undefined>(undefined);
  readonly placeholder = input('');
  readonly initialHighlight = input<ListboxInitialHighlight>('selected');
  readonly disabled = input(false);
  readonly required = input(false);

  /** Built-in CDK virtual scroll for large lists. Requires {@link virtualItems}. */
  readonly virtualScroll = input(false);
  /** Items shown in the virtual list (e.g. filtered). Required when {@link virtualScroll} is true. */
  readonly virtualItems = input<readonly T[] | null>(null);
  readonly virtualItemSize = input(40);
  /** Optional identity for option rows; defaults via {@link virtualTrackKeyFn}. */
  readonly virtualTrackByKey = input<((item: T) => unknown) | undefined>(undefined);
  /** Empty-state text when `virtualItems` is an empty array. */
  readonly virtualEmptyMessage = input('No results');

  /** Emitted when the effective filter query changes. Use for filtering options. */
  readonly searchChange = output<string>();

  /** Raw input text (user typing). Single: when !isEditing, display uses value label. Multi: always search. */
  private readonly inputValue = signal('');
  /** Single mode only: true when user is typing; when false, effective filter is '' so reopen shows full list. */
  private readonly isEditing = signal(false);

  /* ═══ Overlay / panel inputs ═══ */
  readonly placement = input<Placement>('bottom');
  readonly panelClass = input<string | string[] | undefined>(undefined);
  readonly panelStyle = input<Record<string, string> | undefined>(undefined);
  readonly backdropClass = input<string | string[] | undefined>(undefined);
  readonly backdropStyle = input<Record<string, string> | undefined>(undefined);
  readonly hasBackdrop = input(false);
  readonly beforeOpen = input<BeforeOpenCallback | undefined>(undefined);
  readonly beforeClose = input<BeforeCloseCallback | undefined>(undefined);
  readonly maxHeight = input(DEFAULT_MAX_HEIGHT);
  readonly offset = input(DEFAULT_OFFSET);
  readonly matchTriggerWidth = input(true);
  readonly scrollStrategy = input<ComboboxScrollStrategy>('noop');
  readonly maintainInViewport = input(true);
  readonly boundaries = input<ViewportBoundaries | undefined>(undefined);
  readonly closeAnimationDurationMs = input(DEFAULT_CLOSE_ANIMATION_MS);
  /** When true (default), focusing the input opens the panel. */
  readonly openPanelOnFocus = input(true);

  readonly opened = output();
  readonly closed = output<CloseReason | undefined>();

  /* ═══ Internal state ═══ */
  private readonly isOpenSignal = signal(false);
  private readonly listboxRef = signal<ListboxDirective<T> | null>(null);
  private readonly formDisabled = signal(false);
  private readonly programmaticDisabled = signal(false);
  private readonly focusOpenState = new ComboboxFocusOpenState();
  private readonly displaySync = new ComboboxDisplaySync();
  private closingViaToggle = false;
  private readonly destroyRef = inject(DestroyRef);
  private readonly dropdownRef: DropdownRef;
  private isDestroying = false;

  private onChanges?: (value: T | null | readonly T[]) => void;
  private onTouched?: () => void;

  /* ═══ Public readonly state (signals / computed) ═══ */
  readonly isOpen = this.isOpenSignal.asReadonly();
  readonly isDisabled = computed(
    () => this.disabled() || this.formDisabled() || this.programmaticDisabled(),
  );
  readonly listboxId = computed(() => this.listboxRef()?.listboxId() ?? null);
  readonly activeOptionId = computed(() => this.listboxRef()?.activeOptionId() ?? null);

  /**
   * Effective filter query for option filtering.
   * Single: isEditing ? inputValue : ''. Multi: inputValue.
   */
  readonly search = computed(() =>
    this.multi() ? this.inputValue() : this.isEditing() ? this.inputValue() : '',
  );

  /**
   * Text to show in the input. Single: value label when !isEditing && hasValue; else inputValue. Multi: inputValue.
   */
  readonly displayValue = computed(() => {
    const isMulti = this.multi();
    const hasVal = this.hasValue();
    const inputVal = this.inputValue();

    if (isMulti) return inputVal;
    if (!this.isEditing() && hasVal) return computeDisplayValue(this.value(), this.accessors(), '');

    return inputVal;
  });

  readonly hasValue = computed(() => hasSelectionValue(this.value()));

  /**
   * Current selection as an array. Multi mode: value; single mode: [value] or [].
   * Use for rendering chips/tags or iterating selected items from the template ref.
   */
  readonly selectedValues = computed<readonly T[]>(() =>
    toSelectedValuesArray(this.value(), this.multi()),
  );

  private readonly builtInVirtualPanelSignals = createBuiltinVirtualPanelSignals<T>({
    virtualScroll: () => this.virtualScroll(),
    virtualItems: () => this.virtualItems(),
    virtualTrackByKey: () => this.virtualTrackByKey(),
    accessors: () => this.accessors(),
    value: () => this.value(),
    multi: () => this.multi(),
    compareWith: () => this.compareWith(),
  });

  readonly useVirtualPanel = this.builtInVirtualPanelSignals.useVirtualPanel;
  readonly virtualLabelFor = this.builtInVirtualPanelSignals.virtualLabelFor;
  readonly virtualTrackKeyFn = this.builtInVirtualPanelSignals.virtualTrackKeyFn;
  readonly virtualSelectedIndex = this.builtInVirtualPanelSignals.virtualSelectedIndex;

  constructor() {
    this.dropdownRef = DropdownRef.create(this.buildDropdownRefOptions());

    effect(() => {
      this.isOpenSignal();
      this.displayValue();
      this.syncInputToDisplay();
    });

    effect(() => {
      const query = this.search();
      this.searchChange.emit(query);
    });

    if (isDevMode()) {
      effect(() => {
        if (this.useVirtualPanel() && this.panelRef()) {
          warnOnce(
            'nxr-combobox-virtual-and-panel',
            'nxrComboboxPanel is ignored when virtualScroll is true and virtualItems is set; remove the redundant ng-template (use nxrComboboxVirtualOption / Header / Footer only).',
          );
        }
      });
      afterNextRender(() => this.runDevModeInvariants());
    }

    this.destroyRef.onDestroy(() => this.destroyOverlay());
  }

  /* ═══ Dropdown ref and panel config ═══ */

  private buildDropdownRefOptions(): DropdownRefOptions {
    return buildComboboxDropdownRefOptions({
      overlay: this.overlay,
      destroyRef: this.destroyRef,
      getAnchor: () => this.anchorRef()?.elementRef.nativeElement ?? this.hostRef.nativeElement,
      getFocusRestoreTarget: () => this.inputRef()?.elementRef.nativeElement ?? null,
      placement: () => this.placement(),
      offset: () => this.offset(),
      matchTriggerWidth: () => this.matchTriggerWidth(),
      scrollStrategy: () => this.scrollStrategy(),
      maintainInViewport: () => this.maintainInViewport(),
      boundaries: () => this.boundaries(),
      closeAnimationDurationMs: () => this.closeAnimationDurationMs(),
      maxHeight: () => this.maxHeight(),
      hasBackdrop: () => this.hasBackdrop(),
      panelClass: () => this.panelClass(),
      backdropClass: () => this.backdropClass(),
      panelStyle: () => this.panelStyle(),
      backdropStyle: () => this.backdropStyle(),
      beforeOpen: () => this.beforeOpen(),
      beforeClose: () => this.beforeClose(),
      useVirtualPanel: () => this.useVirtualPanel(),
      onOpened: () => this.onDropdownOpened(),
      onClosed: (reason: CloseReason | undefined) => this.onDropdownClosed(reason),
    });
  }

  /** Writes displayValue() to the input element when it differs from current value. */
  private syncInputToDisplay(): void {
    this.displaySync.sync(this.inputRef()?.elementRef, this.displayValue());
  }

  private onDropdownOpened(): void {
    handleComboboxDropdownOpened({
      isDestroying: this.isDestroying,
      isOpenSignal: this.isOpenSignal,
      emitOpened: () => this.opened.emit(),
      afterOpened: () => this.focusInput(),
    });
  }

  private onDropdownClosed(reason?: CloseReason): void {
    const wasClosingViaToggle = this.closingViaToggle;
    this.closingViaToggle = false;
    handleComboboxDropdownClosed({
      isDestroying: this.isDestroying,
      reason,
      wasClosingViaToggle,
      isOpenSignal: this.isOpenSignal,
      listboxRef: this.listboxRef,
      emitClosed: (r) => this.closed.emit(r),
      markTouched: this.onTouched,
      focusOpenState: this.focusOpenState,
      syncSearchToValue: () => this.syncSearchToValue(),
      focusInput: () => this.focusInput(),
    });
  }

  /* ═══ Focus restore (used by input/toggle directives) ═══ */

  takeFocusRestore(): boolean {
    return this.focusOpenState.consumeFocusRestore();
  }

  skipNextOpen(): void {
    this.focusOpenState.markSkipNextOpen();
  }

  /* ═══ Dev invariants ═══ */

  private runDevModeInvariants(): void {
    assertComboboxContentStructure({
      inputPresent: !!this.inputRef(),
      useVirtualPanel: this.useVirtualPanel(),
      panelPresent: !!this.panelRef(),
    });
  }

  /* ═══ Public API: open / close / toggle ═══ */

  /**
   * Opens the panel if not already open and not disabled.
   * @returns Promise resolving to true if opened, false if not (e.g. cancelled or already open).
   */
  async open(): Promise<boolean> {
    const panel = this.resolvePanelForOpen();
    if (!this.canOpenCombobox(panel)) return false;
    if (!panel) return false;
    const portal = this.createPanelPortal(panel);

    return this.dropdownRef.open(portal);
  }

  /**
   * Closes the panel with the given reason. Default reason is programmatic.
   * @param options.skipFocusRestore - When true, focus is not restored to the trigger.
   */
  close(reason?: CloseReason, options?: { skipFocusRestore?: boolean }): void {
    this.dropdownRef.close(reason ?? CLOSE_REASON_PROGRAMMATIC, options);
  }

  /** Toggles the panel open or closed. */
  toggle(): void {
    if (this.isOpen()) {
      this.closingViaToggle = true;
      this.dropdownRef.close(CLOSE_REASON_PROGRAMMATIC, { skipFocusRestore: true });
    } else {
      void this.open();
    }
  }

  /* ═══ Public API: selection ═══ */

  /**
   * Sets the current value (single: T | null, multi: readonly T[]).
   * Null/undefined are normalized to null (single) or [] (multi). Notifies form control and updates UI.
   */
  select(valueOrValues: T | null | readonly T[] | undefined): void {
    const normalized = normalizeSelectionValue(valueOrValues, this.multi());
    this.applySelectionChange(normalized);
  }

  /**
   * Removes one item from the selection. No-op when not in multi mode or value is not an array.
   * Uses compareWith when provided so removal matches selection identity (e.g. by id).
   */
  unselect(item: T): void {
    if (!this.multi()) return;
    const current = this.value();
    if (!Array.isArray(current)) return;
    const compare = this.compareWith();
    const eq = (a: T, b: T) => (compare ? compare(a, b) : a === b);
    const next = multiSelectionRemovingEquivalentItems(current, item, eq);
    this.value.set(next);
    this.onChanges?.(next);
  }

  /**
   * Resets value to defaultValue, or to empty (null single / [] multi). Clears search state and marks touched.
   * Edge: undefined defaultValue clears to empty; pass explicit null/[] to set that value.
   */
  reset(defaultValue?: T | readonly T[]): void {
    if (defaultValue !== undefined) {
      this.value.set(defaultValue);
      this.onChanges?.(defaultValue);
    } else {
      const empty = getEmptySelectionValue<T>(this.multi());
      this.value.set(empty);
      this.onChanges?.(empty);
    }
    this.clearSearchState();
    this.syncInputToDisplay();
    this.onTouched?.();
  }

  /* ═══ Public API: search ═══ */

  /**
   * Sets the search query and optionally opens the panel.
   * Single mode: sets isEditing true so the input shows the typed text (including when cleared);
   * only blur or selection will set isEditing false and show the value label again.
   */
  setSearchQuery(query: string, options?: { openPanel?: boolean }): void {
    setSearchQuery({
      query,
      isMulti: this.multi(),
      isOpen: this.isOpenSignal(),
      isDisabled: this.isDisabled(),
      openPanel: options?.openPanel,
      inputValue: this.inputValue,
      setInputValue: (value) => this.inputValue.set(value),
      setIsEditing: (editing) => this.isEditing.set(editing),
      syncInputToDisplay: () => this.syncInputToDisplay(),
      open: () => this.open(),
    });
  }

  /** Clears the search query. Optionally opens the panel. */
  clearSearchQuery(options?: { openPanel?: boolean }): void {
    this.setSearchQuery('', options);
  }

  /**
   * Syncs search/display state to value: single sets isEditing false; multi clears inputValue.
   * Call on blur when panel is closed, or from reset/clear.
   */
  syncSearchToValue(): void {
    this.clearSearchState();
    this.syncInputToDisplay();
  }

  /* ═══ Public API: disable / focus / selection check ═══ */

  /**
   * Programmatic disable (in addition to `[disabled]` and form disabled).
   * If the panel is open, closes it first with reason `programmatic`.
   */
  disable(): void {
    if (this.isOpenSignal()) {
      this.close(CLOSE_REASON_PROGRAMMATIC);
    }
    this.programmaticDisabled.set(true);
  }

  enable(): void {
    this.programmaticDisabled.set(false);
  }

  /** Moves focus to the combobox input element, if present. */
  focusInput(): void {
    safeFocus(this.inputRef()?.elementRef.nativeElement);
  }

  /** Returns whether the given item is selected (delegates to listbox when panel is open). */
  isSelected(item: T): boolean {
    return this.listboxRef()?.isSelected(item) ?? false;
  }

  /**
   * Handles keydown on the input: when closed, opens on Enter / ArrowDown / ArrowUp (not Space, so
   * Space can type in the input). When open, forwards to listbox via DropdownRef.
   * Multi mode: Backspace with empty input removes the last selected value.
   */
  handleInputKeydown(event: KeyboardEvent): void {
    handleComboboxInputKeydown({
      event,
      isDisabled: this.isDisabled(),
      isMulti: this.multi(),
      inputValue: this.inputValue(),
      hasValue: this.hasValue(),
      isOpen: this.isOpenSignal(),
      getSelectedArray: () => {
        const v = this.value();
        return Array.isArray(v) ? v : null;
      },
      unselect: (x) => this.unselect(x),
      open: () => void this.open(),
      dropdownRef: this.dropdownRef,
      forwardKeydownToListbox: (ev) => this.forwardKeydownToListbox(ev),
    });
  }

  markAsTouched(): void {
    this.onTouched?.();
  }

  private forwardKeydownToListbox(event: KeyboardEvent): void {
    this.listboxRef()?.handleKeydown(event);
  }

  /* ═══ ControlValueAccessor ═══ */

  /**
   * CVA: writes form value.
   * Single mode normalizes null/undefined to null; multi mode normalizes to [].
   */
  writeValue(value: T | null | readonly T[]): void {
    this.value.set(normalizeSingleOrMultiValue(value, this.multi()));
  }

  registerOnChange(fn: (value: T | null | readonly T[]) => void): void {
    this.onChanges = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  /* ═══ Panel portal and context ═══ */

  private resolvePanelForOpen(): ComboboxPanelDirective | undefined {
    return resolveOpenPanelDirective(
      this.useVirtualPanel(),
      this.virtualBuiltinPanel(),
      this.panelRef(),
    );
  }

  private createPanelPortal(panel: ComboboxPanelDirective) {
    return createComboboxListboxOverlayPortal({
      vcr: this.vcr,
      injector: this.injector,
      panel,
      childOwnsScroll: this.useVirtualPanel(),
      value: this.value,
      multi: this.multi,
      accessors: this.accessors,
      compareWith: this.compareWith,
      initialHighlight: this.initialHighlight,
      onValueChange: (v) => this.applySelectionChange(v),
      setListboxRef: (listbox) => this.listboxRef.set(listbox),
    });
  }

  private canOpenCombobox(panel: ComboboxPanelDirective | undefined): boolean {
    return canOpenDropdown({
      isOverlayOpen: this.dropdownRef.isOpen(),
      isDisabled: this.isDisabled(),
      hasAnchor: !!this.inputRef(),
      hasPanel: !!panel,
    });
  }

  /* ═══ Private — selection and search state ═══ */

  private applySelectionChange(newValue: T | null | readonly T[]): void {
    applySelectionChange({
      newValue,
      isMulti: this.multi(),
      isOpen: this.isOpenSignal(),
      value: this.value,
      inputValue: this.inputValue,
      onChange: this.onChanges,
      syncInputToDisplay: () => this.syncInputToDisplay(),
      closeWithSelection: () => this.close(CLOSE_REASON_SELECTION),
      focusInput: () => this.focusInput(),
    });
  }

  private clearSearchState(): void {
    clearSearchState(this.inputValue, this.isEditing, this.multi());
  }

  private destroyOverlay(): void {
    teardownAnchoredDropdownHostState({
      beginHostDestroy: () => {
        this.isDestroying = true;
      },
      dropdownRef: this.dropdownRef,
      detachListboxRef: () => this.listboxRef.set(null),
      clearOpenState: () => this.isOpenSignal.set(false),
    });
  }
}

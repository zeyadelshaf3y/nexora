/**
 * `<nxr-select>` — Root compound component for the headless select.
 *
 * Owns all state, overlay lifecycle, keyboard logic, CVA integration,
 * and value coordination. Child directives (`nxrSelectTrigger`,
 * `nxrSelectPanel`, `nxrSelectOption`, etc.) are thin bridges that
 * delegate to this component.
 *
 * ## Programmatic API
 *
 * Consumers access the full component API via template ref or `viewChild()`:
 *
 * ```html
 * <nxr-select #sel="nxrSelect" [(value)]="selected">...</nxr-select>
 * <button (click)="sel.open()">Open</button>
 * ```
 *
 * ```ts
 * readonly select = viewChild.required(SelectComponent);
 * doSomething() {
 *   this.select().open();
 *   this.select().close();
 *   const open = this.select().isOpen();
 * }
 * ```
 *
 * **`disable()`** closes an open panel (reason `programmatic`) before applying programmatic disable; pair with **`enable()`**.
 *
 * Overlay `onListboxReady` uses `bindListboxReadyWithActiveScroll` from `@nexora-ui/listbox`
 * so the active option scrolls after layout/virtual geometry settles.
 */

import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  ViewContainerRef,
  ViewEncapsulation,
  afterNextRender,
  computed,
  contentChild,
  effect,
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
  DEFAULT_CLOSE_ANIMATION_MS,
  DEFAULT_MAX_HEIGHT,
  DEFAULT_OFFSET,
  DropdownRef,
  hasSelectionValue,
  resolveOpenPanelDirective,
  routeHeadlessDropdownTriggerKeydown,
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
  DEFAULT_OVERLAY_DEFAULTS_CONFIG,
  mergeOverlayClassValue,
  resolveOverlayBackdropClassValue,
  resolveOverlayBackdropStyleValue,
  mergeOverlayStyleValue,
  OverlayService,
  OVERLAY_DEFAULTS_CONFIG,
  type CloseReason,
  type Placement,
  type ViewportBoundaries,
} from '@nexora-ui/overlay';

import { SelectPanelDirective } from '../directives/select-panel.directive';
import { SelectTriggerDirective } from '../directives/select-trigger.directive';
import {
  SelectVirtualFooterTemplateDirective,
  SelectVirtualHeaderTemplateDirective,
  SelectVirtualOptionTemplateDirective,
} from '../directives/select-virtual-panel-templates.directive';
import {
  applySelectionValue,
  assertSelectContentStructure,
  buildSelectDropdownRefOptions,
  createSelectListboxOverlayPortal,
  getEmptySelectValue,
  handleSelectDropdownClosed,
  handleSelectDropdownOpened,
  normalizeWriteValue,
} from '../internal';
import { DEFAULT_SELECT_DEFAULTS_CONFIG, SELECT_DEFAULTS_CONFIG } from './select-defaults.config';
import { NXR_SELECT, type SelectController } from '../tokens/select-tokens';
import type { SelectAccessors, SelectScrollStrategy } from '../types/select-types';
import { computeDisplayValue } from '../utils/select-value-utils';

@Component({
  selector: 'nxr-select',
  standalone: true,
  imports: [BuiltinVirtualDropdownPanelComponent, SelectPanelDirective],
  templateUrl: './select.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'nxrSelect',
  host: { class: 'nxr-select' },
  providers: [
    { provide: NXR_SELECT, useExisting: forwardRef(() => SelectComponent) },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
})
export class SelectComponent<T = unknown> implements SelectController, ControlValueAccessor {
  // ---------------------------------------------------------------------------
  // Injected services
  // ---------------------------------------------------------------------------

  private readonly overlay = inject(OverlayService);
  private readonly vcr = inject(ViewContainerRef);
  private readonly injector = inject(Injector);
  private readonly overlayDefaults = {
    ...DEFAULT_OVERLAY_DEFAULTS_CONFIG,
    ...(inject(OVERLAY_DEFAULTS_CONFIG, { optional: true }) ?? {}),
  };
  private readonly classMergeMode = this.overlayDefaults.classMergeMode ?? 'replace';
  private readonly styleMergeMode = this.overlayDefaults.styleMergeMode ?? 'replace';
  private readonly defaults = {
    ...DEFAULT_SELECT_DEFAULTS_CONFIG,
    hasBackdrop: this.overlayDefaults.hasBackdrop ?? DEFAULT_SELECT_DEFAULTS_CONFIG.hasBackdrop,
    closeAnimationDurationMs:
      this.overlayDefaults.closeAnimationDurationMs ??
      DEFAULT_SELECT_DEFAULTS_CONFIG.closeAnimationDurationMs,
    maintainInViewport:
      this.overlayDefaults.maintainInViewport ?? DEFAULT_SELECT_DEFAULTS_CONFIG.maintainInViewport,
    boundaries: this.overlayDefaults.boundaries ?? DEFAULT_SELECT_DEFAULTS_CONFIG.boundaries,
    panelClass: this.overlayDefaults.panelClass,
    panelStyle: this.overlayDefaults.panelStyle,
    backdropClass: this.overlayDefaults.backdropClass,
    backdropStyle: this.overlayDefaults.backdropStyle,
    ...(inject(SELECT_DEFAULTS_CONFIG, { optional: true }) ?? {}),
  };

  // ---------------------------------------------------------------------------
  // Content children (signal queries — modern Angular API)
  // ---------------------------------------------------------------------------

  private readonly triggerRef = contentChild(SelectTriggerDirective);
  private readonly panelRef = contentChild(SelectPanelDirective);
  private readonly virtualBuiltinPanel = viewChild<SelectPanelDirective>('virtualBuiltin');

  readonly virtualOptionTpl = contentChild(SelectVirtualOptionTemplateDirective);
  readonly virtualHeaderTpl = contentChild(SelectVirtualHeaderTemplateDirective);
  readonly virtualFooterTpl = contentChild(SelectVirtualFooterTemplateDirective);

  // ---------------------------------------------------------------------------
  // Inputs
  // ---------------------------------------------------------------------------

  /** Current selected value. Two-way bindable via `[(value)]`. */
  readonly value = model<T | null | readonly T[]>(null);

  /** Enable multi-select mode. */
  readonly multi = input(false);

  /** Accessor functions for object options (value, label, disabled). */
  readonly accessors = input<SelectAccessors<T> | undefined>(undefined);

  /** Custom equality comparator for matching selected value to options. */
  readonly compareWith = input<((a: unknown, b: unknown) => boolean) | undefined>(undefined);

  /** Text shown in `displayValue()` when no value is selected. */
  readonly placeholder = input('');

  /** Which option to highlight when the panel opens. */
  readonly initialHighlight = input<ListboxInitialHighlight>('selected');

  /** Prevents the select from opening. */
  readonly disabled = input(false);

  /**
   * When true, the trigger gets aria-required="true" (see SelectTriggerDirective).
   * Validation (e.g. Validators.required) is handled by Angular forms, not here.
   */
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

  /** Preferred placement of the dropdown panel. */
  readonly placement = input<Placement>(this.defaults.placement ?? 'bottom');

  /** CSS class(es) applied to the overlay pane. */
  readonly panelClass = input<string | string[] | undefined>(undefined);

  /** CSS class(es) applied to the backdrop. */
  readonly backdropClass = input<string | string[] | undefined>(undefined);
  /** Alias backdrop class input for consistency across overlay components. */
  readonly nxrBackdropClass = input<string | string[] | undefined>(undefined);

  readonly panelStyle = input<Record<string, string> | undefined>(undefined);

  readonly backdropStyle = input<Record<string, string> | undefined>(undefined);
  /** Alias backdrop style input for consistency across overlay components. */
  readonly nxrBackdropStyles = input<Record<string, string> | undefined>(undefined);

  /** Called before opening. Return false to prevent opening. */
  readonly beforeOpen = input<BeforeOpenCallback | undefined>(undefined);

  /** Called before closing. Return false to prevent closing. */
  readonly beforeClose = input<BeforeCloseCallback | undefined>(undefined);

  /** Whether to show a backdrop behind the panel. */
  readonly hasBackdrop = input<boolean>(this.defaults.hasBackdrop ?? false);

  /** Maximum panel height (e.g. `'300px'`). Defaults to `16rem`. */
  readonly maxHeight = input<string>(this.defaults.maxHeight ?? DEFAULT_MAX_HEIGHT);

  /** Gap in px between trigger and panel. */
  readonly offset = input(this.defaults.offset ?? DEFAULT_OFFSET);

  /** When `true`, panel width matches the trigger element width. */
  readonly matchTriggerWidth = input(this.defaults.matchTriggerWidth ?? true);

  /** Scroll behavior while the panel is open. */
  readonly scrollStrategy = input<SelectScrollStrategy>(this.defaults.scrollStrategy ?? 'noop');

  /**
   * Only used when scroll strategy is `'reposition'`. When `true` (default), keep the panel
   * in the viewport; when `false`, let it follow the trigger off-screen. Ignored for `noop`, `block`, and `close`.
   */
  readonly maintainInViewport = input<boolean>(this.defaults.maintainInViewport ?? true);

  /** Viewport inset for overlay max dimensions (same as combobox / overlay `boundaries`). */
  readonly boundaries = input<ViewportBoundaries | undefined>(this.defaults.boundaries);

  /**
   * Duration (ms) to wait for the CSS close animation before detaching.
   * Set to `0` for instant close. The overlay system applies
   * `nxr-overlay-pane--closing` during this window.
   */
  readonly closeAnimationDurationMs = input(
    this.defaults.closeAnimationDurationMs ?? DEFAULT_CLOSE_ANIMATION_MS,
  );

  // ---------------------------------------------------------------------------
  // Outputs
  // ---------------------------------------------------------------------------

  /** Emitted after the dropdown panel opens. */
  readonly opened = output();

  /** Emitted after the dropdown panel closes. Payload is the close reason (e.g. 'selection', 'escape', 'outside'). */
  readonly closed = output<CloseReason | undefined>();

  // ---------------------------------------------------------------------------
  // Internal state
  // ---------------------------------------------------------------------------

  private readonly isOpenSignal = signal(false);
  private readonly listboxRef = signal<ListboxDirective<T> | null>(null);
  private readonly formDisabled = signal(false);
  private readonly programmaticDisabled = signal(false);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dropdownRef: DropdownRef;
  private isDestroying = false;

  // ---------------------------------------------------------------------------
  // CVA callbacks (set by Angular forms runtime)
  // ---------------------------------------------------------------------------

  private onChanges?: (value: T | null | readonly T[]) => void;
  private onTouched?: () => void;

  // ---------------------------------------------------------------------------
  // Computed signals / inputs exposed as public API (exportAs + SelectController)
  // ---------------------------------------------------------------------------

  /** Whether the dropdown is open. */
  readonly isOpen = this.isOpenSignal.asReadonly();

  /** Effective disabled state: `disabled` input, form control, or `disable()`. */
  readonly isDisabled = computed(
    () => this.disabled() || this.formDisabled() || this.programmaticDisabled(),
  );

  /** Listbox element ID when open; `null` when closed. */
  readonly listboxId = computed(() => this.listboxRef()?.listboxId() ?? null);

  /** Active (highlighted) option ID when open; `null` otherwise. */
  readonly activeOptionId = computed(() => this.listboxRef()?.activeOptionId() ?? null);

  /**
   * Convenience string for the trigger.
   * Returns placeholder when empty, or label(s) from accessors.
   */
  readonly displayValue = computed(() =>
    computeDisplayValue(this.value(), this.accessors(), this.placeholder()),
  );

  /** Whether there is a current selection (single: value != null, multi: array length > 0). */
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

  // ---------------------------------------------------------------------------
  // Constructor (modern lifecycle: DestroyRef + afterNextRender)
  // ---------------------------------------------------------------------------

  constructor() {
    this.dropdownRef = DropdownRef.create(this.buildDropdownRefOptions());

    if (isDevMode()) {
      effect(() => {
        if (this.useVirtualPanel() && this.panelRef()) {
          warnOnce(
            'nxr-select-virtual-and-panel',
            'nxrSelectPanel is ignored when virtualScroll is true and virtualItems is set; remove the redundant ng-template (use nxrSelectVirtualOption / Header / Footer only).',
          );
        }
      });
      afterNextRender(() => this.runDevModeInvariants());
    }

    this.destroyRef.onDestroy(() => this.destroyOverlay());
  }

  /** Options for DropdownRef: anchor, overlay, placement, callbacks. All reactive inputs are getters. */
  private buildDropdownRefOptions(): DropdownRefOptions {
    return buildSelectDropdownRefOptions({
      overlay: this.overlay,
      destroyRef: this.destroyRef,
      getAnchor: () => this.triggerRef()?.elementRef.nativeElement ?? null,
      placement: () => this.placement(),
      offset: () => this.offset(),
      matchTriggerWidth: () => this.matchTriggerWidth(),
      scrollStrategy: () => this.scrollStrategy(),
      maintainInViewport: () => this.maintainInViewport(),
      boundaries: () => this.boundaries(),
      closeAnimationDurationMs: () => this.closeAnimationDurationMs(),
      maxHeight: () => this.maxHeight(),
      hasBackdrop: () => this.hasBackdrop(),
      panelClass: () => this.resolvePanelClassInput(),
      backdropClass: () => this.resolveBackdropClassInput(),
      panelStyle: () => this.resolvePanelStyleInput(),
      backdropStyle: () => this.resolveBackdropStylesInput(),
      beforeOpen: () => this.beforeOpen(),
      beforeClose: () => this.beforeClose(),
      useVirtualPanel: () => this.useVirtualPanel(),
      onOpened: () => this.onDropdownOpened(),
      onClosed: (reason) => this.onDropdownClosed(reason),
    });
  }

  private onDropdownOpened(): void {
    handleSelectDropdownOpened({
      isDestroying: this.isDestroying,
      isOpenSignal: this.isOpenSignal,
      emitOpened: () => this.opened.emit(),
    });
  }

  private onDropdownClosed(reason: CloseReason | undefined): void {
    handleSelectDropdownClosed({
      isDestroying: this.isDestroying,
      reason,
      isOpenSignal: this.isOpenSignal,
      listboxRef: this.listboxRef,
      emitClosed: (r) => this.closed.emit(r),
      markTouched: this.onTouched,
    });
  }

  private resolveBackdropClassInput(): string | string[] | undefined {
    return resolveOverlayBackdropClassValue({
      defaultsBackdropClass: this.defaults.backdropClass,
      instanceBackdropClass: this.backdropClass(),
      defaultsNxrBackdropClass: this.overlayDefaults.nxrBackdropClass,
      instanceNxrBackdropClass: this.nxrBackdropClass(),
      classMergeMode: this.classMergeMode,
    });
  }

  private resolveBackdropStylesInput(): Record<string, string> | undefined {
    return resolveOverlayBackdropStyleValue({
      defaultsBackdropStyle: this.defaults.backdropStyle,
      instanceBackdropStyle: this.backdropStyle(),
      defaultsNxrBackdropStyles: this.overlayDefaults.nxrBackdropStyles,
      instanceNxrBackdropStyles: this.nxrBackdropStyles(),
      styleMergeMode: this.styleMergeMode,
    });
  }

  private resolvePanelClassInput(): string | string[] | undefined {
    return mergeOverlayClassValue(this.defaults.panelClass, this.panelClass(), this.classMergeMode);
  }

  private resolvePanelStyleInput(): Record<string, string> | undefined {
    return mergeOverlayStyleValue(this.defaults.panelStyle, this.panelStyle(), this.styleMergeMode);
  }

  /** Dev-only: assert required content children (trigger, panel) are present. */
  private runDevModeInvariants(): void {
    assertSelectContentStructure({
      triggerPresent: !!this.triggerRef(),
      useVirtualPanel: this.useVirtualPanel(),
      panelPresent: !!this.panelRef(),
    });
  }

  // ---------------------------------------------------------------------------
  // Public API (accessible via exportAs #sel="nxrSelect" or viewChild)
  // ---------------------------------------------------------------------------

  /** Open the dropdown panel. Returns false if already open, disabled, or attach failed. */
  async open(): Promise<boolean> {
    const panel = this.resolvePanelForOpen();
    if (!this.canOpenSelect(panel)) return false;
    if (!panel) return false;

    const portal = this.createPanelPortal(panel);

    return this.dropdownRef.open(portal);
  }

  /** Close the dropdown panel. No-op when already closed. Pass optional reason for the closed output. */
  close(reason?: CloseReason): void {
    this.dropdownRef.close(reason ?? CLOSE_REASON_PROGRAMMATIC);
  }

  /** Toggle the dropdown panel. Opens if closed; closes if open. Disabled guard is in `open()`. */
  toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      void this.open();
    }
  }

  /**
   * Reset selection to empty (single: null, multi: []).
   * Notifies the bound model/CVA and closes the panel if open.
   */
  reset(): void {
    const empty = getEmptySelectValue<T>(this.multi());
    this.value.set(empty);
    this.onChanges?.(empty);
    this.onTouched?.();

    if (this.isOpenSignal()) {
      this.close();
    }
  }

  /** Focus the trigger element. Use after reset() or when scrolling to the select. */
  focusTrigger(): void {
    safeFocus(this.triggerRef()?.elementRef.nativeElement);
  }

  /**
   * Disables interaction without using the `[disabled]` input (e.g. async guard). Pair with `enable()`.
   * If the panel is open, closes it first with reason `programmatic`.
   */
  disable(): void {
    if (this.isOpenSignal()) {
      this.close(CLOSE_REASON_PROGRAMMATIC);
    }
    this.programmaticDisabled.set(true);
  }

  /** Clears programmatic disabling from `disable()`. */
  enable(): void {
    this.programmaticDisabled.set(false);
  }

  // ---------------------------------------------------------------------------
  // Keyboard (owned here, delegated from SelectTriggerDirective)
  // ---------------------------------------------------------------------------

  /** Handle keydown on the trigger (Enter/Space/Arrows open; Escape/Tab close; when open, forwards to listbox). */
  handleTriggerKeydown(event: KeyboardEvent): void {
    routeHeadlessDropdownTriggerKeydown({
      event,
      isDisabled: this.isDisabled(),
      isOpen: this.isOpenSignal(),
      open: () => void this.open(),
      dropdownRef: this.dropdownRef,
      forwardKeydown: (ev) => this.forwardKeydown(ev),
    });
  }

  /**
   * Forward a keyboard event to the internal listbox.
   * No-op when panel is closed. Public for advanced patterns via template ref.
   */
  forwardKeydown(event: KeyboardEvent): void {
    this.listboxRef()?.handleKeydown(event);
  }

  /**
   * Whether the given option is currently selected.
   * Returns false when the panel is closed or the item is not selected.
   */
  isSelected(item: T): boolean {
    return this.listboxRef()?.isSelected(item) ?? false;
  }

  // ---------------------------------------------------------------------------
  // ControlValueAccessor
  // ---------------------------------------------------------------------------

  /**
   * CVA: writes form value.
   * Single mode normalizes null/undefined to null; multi mode normalizes to [].
   */
  writeValue(value: T | null | readonly T[]): void {
    this.value.set(normalizeWriteValue(value, this.multi()));
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

  // ---------------------------------------------------------------------------
  // Private — open flow
  // ---------------------------------------------------------------------------

  private resolvePanelForOpen(): SelectPanelDirective | undefined {
    return resolveOpenPanelDirective(
      this.useVirtualPanel(),
      this.virtualBuiltinPanel(),
      this.panelRef(),
    );
  }

  private createPanelPortal(panel: SelectPanelDirective) {
    return createSelectListboxOverlayPortal({
      vcr: this.vcr,
      injector: this.injector,
      panel,
      childOwnsScroll: this.useVirtualPanel(),
      value: this.value,
      multi: this.multi,
      accessors: this.accessors,
      compareWith: this.compareWith,
      initialHighlight: this.initialHighlight,
      onValueChange: (value) => this.handleValueChange(value),
      setListboxRef: (listbox) => this.listboxRef.set(listbox),
    });
  }

  private canOpenSelect(panel: SelectPanelDirective | undefined): boolean {
    return canOpenDropdown({
      isOverlayOpen: this.dropdownRef.isOpen(),
      isDisabled: this.isDisabled(),
      hasAnchor: !!this.triggerRef(),
      hasPanel: !!panel,
    });
  }

  // ---------------------------------------------------------------------------
  // Private — value, focus, teardown
  // ---------------------------------------------------------------------------

  private handleValueChange(value: T | null | readonly T[]): void {
    applySelectionValue({
      value,
      isMulti: this.multi(),
      setValue: this.value,
      onChange: this.onChanges,
      closeWithSelection: () => this.close(CLOSE_REASON_SELECTION),
    });
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

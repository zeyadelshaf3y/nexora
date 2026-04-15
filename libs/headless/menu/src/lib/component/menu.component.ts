/**
 * `<nxr-menu>` — Root compound component for the headless menu.
 *
 * Owns overlay lifecycle and listbox-in-panel coordination. No value binding;
 * on item activation emits optionActivated and closes. Child directives
 * (nxrMenuTrigger, nxrMenuPanel, nxrMenuItem, etc.) delegate to this component.
 *
 * **`disable()`** closes an open panel (reason `programmatic`) before applying programmatic disable; pair with **`enable()`**.
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
  forwardRef,
  inject,
  input,
  isDevMode,
  output,
  signal,
} from '@angular/core';
import { safeFocus } from '@nexora-ui/core';
import {
  canOpenDropdown,
  DEFAULT_CLOSE_ANIMATION_MS,
  DEFAULT_MAX_HEIGHT,
  DEFAULT_OFFSET,
  DropdownRef,
  routeHeadlessDropdownTriggerKeydown,
  teardownAnchoredDropdownHostState,
  type DropdownRefOptions,
} from '@nexora-ui/dropdown';
import type { ListboxDirective } from '@nexora-ui/listbox';
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

import { MENU_DEFAULT_ARROW } from '../constants/menu-constants';
import { MenuPanelDirective } from '../directives/menu-panel.directive';
import { MenuTriggerDirective } from '../directives/menu-trigger.directive';
import {
  assertMenuContentStructure,
  buildMenuDropdownRefOptions,
  createMenuPanelPortal,
  focusMenuPanelAutofocusTarget,
  handleMenuDropdownClosed,
  handleMenuDropdownOpened,
} from '../internal';
import { DEFAULT_MENU_DEFAULTS_CONFIG, MENU_DEFAULTS_CONFIG } from './menu-defaults.config';
import { NXR_MENU, type MenuController } from '../tokens/menu-tokens';
import type { MenuOptionActivatedEvent } from '../types/menu-types';

@Component({
  selector: 'nxr-menu',
  standalone: true,
  template: '<ng-content />',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'nxrMenu',
  host: { class: 'nxr-menu' },
  providers: [{ provide: NXR_MENU, useExisting: forwardRef(() => MenuComponent) }],
})
export class MenuComponent<T = unknown> implements MenuController {
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
    ...DEFAULT_MENU_DEFAULTS_CONFIG,
    hasBackdrop: this.overlayDefaults.hasBackdrop ?? DEFAULT_MENU_DEFAULTS_CONFIG.hasBackdrop,
    closeAnimationDurationMs:
      this.overlayDefaults.closeAnimationDurationMs ??
      DEFAULT_MENU_DEFAULTS_CONFIG.closeAnimationDurationMs,
    maintainInViewport:
      this.overlayDefaults.maintainInViewport ?? DEFAULT_MENU_DEFAULTS_CONFIG.maintainInViewport,
    boundaries: this.overlayDefaults.boundaries ?? DEFAULT_MENU_DEFAULTS_CONFIG.boundaries,
    panelClass: this.overlayDefaults.panelClass,
    panelStyle: this.overlayDefaults.panelStyle,
    backdropClass: this.overlayDefaults.backdropClass,
    backdropStyle: this.overlayDefaults.backdropStyle,
    ...(inject(MENU_DEFAULTS_CONFIG, { optional: true }) ?? {}),
  };

  private readonly triggerRef = contentChild(MenuTriggerDirective);
  private readonly panelRef = contentChild(MenuPanelDirective);

  readonly disabled = input(false);
  readonly placement = input<Placement>(this.defaults.placement ?? 'bottom-start');
  readonly panelClass = input<string | string[] | undefined>(undefined);
  readonly backdropClass = input<string | string[] | undefined>(undefined);
  /** Alias backdrop class input for consistency across overlay components. */
  readonly nxrBackdropClass = input<string | string[] | undefined>(undefined);
  readonly panelStyle = input<Record<string, string> | undefined>(undefined);
  readonly backdropStyle = input<Record<string, string> | undefined>(undefined);
  /** Alias backdrop style input for consistency across overlay components. */
  readonly nxrBackdropStyles = input<Record<string, string> | undefined>(undefined);
  readonly beforeOpen = input<BeforeOpenCallback | undefined>(undefined);
  readonly beforeClose = input<BeforeCloseCallback | undefined>(undefined);
  readonly hasBackdrop = input<boolean>(this.defaults.hasBackdrop ?? false);
  readonly maxHeight = input<string>(this.defaults.maxHeight ?? DEFAULT_MAX_HEIGHT);
  /** Viewport inset for overlay max dimensions (same as select/combobox / overlay `boundaries`). */
  readonly boundaries = input<ViewportBoundaries | undefined>(this.defaults.boundaries);
  /** Gap in px between trigger and panel. Default: 4. */
  readonly offset = input(this.defaults.offset ?? DEFAULT_OFFSET);
  /** When true, panel width matches the trigger. Default: false for menu (panel uses min-width from content). */
  readonly matchTriggerWidth = input(this.defaults.matchTriggerWidth ?? false);
  readonly scrollStrategy = input<'noop' | 'reposition' | 'block' | 'close'>(
    this.defaults.scrollStrategy ?? 'noop',
  );
  /**
   * Only used when scroll strategy is `'reposition'`. When `true` (default), keep the panel
   * in the viewport; when `false`, let it follow the trigger off-screen. Ignored for `noop`, `block`, and `close`.
   */
  readonly maintainInViewport = input<boolean>(this.defaults.maintainInViewport ?? true);
  readonly closeAnimationDurationMs = input(
    this.defaults.closeAnimationDurationMs ?? DEFAULT_CLOSE_ANIMATION_MS,
  );
  /** When true (default), show an arrow pointing at the trigger. Set to false to hide. */
  readonly displayArrow = input(this.defaults.displayArrow ?? true);
  /** Arrow dimensions in px. Default 12×6 when displayArrow is true. */
  readonly arrowSize = input<{ width: number; height: number } | undefined>(
    this.defaults.arrowSize,
  );

  readonly optionActivated = output<MenuOptionActivatedEvent<T>>();
  readonly opened = output();
  readonly closed = output<CloseReason | undefined>();

  private readonly isOpenSignal = signal(false);
  private readonly listboxRef = signal<ListboxDirective<T> | null>(null);
  private readonly programmaticDisabled = signal(false);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dropdownRef: DropdownRef;
  private isDestroying = false;

  readonly isOpen = this.isOpenSignal.asReadonly();
  /** Effective disabled state: `disabled` input or `disable()`. */
  readonly isDisabled = computed(() => this.disabled() || this.programmaticDisabled());
  readonly listboxId = computed(() => this.listboxRef()?.listboxId() ?? null);
  readonly activeOptionId = computed(() => this.listboxRef()?.activeOptionId() ?? null);

  constructor() {
    this.dropdownRef = DropdownRef.create(this.buildDropdownRefOptions());

    if (isDevMode()) {
      afterNextRender(() => this.runDevModeInvariants());
    }

    this.destroyRef.onDestroy(() => this.destroyOverlay());
  }

  /** Options for DropdownRef (menu preset). Reactive inputs are getters. */
  private buildDropdownRefOptions(): DropdownRefOptions {
    return buildMenuDropdownRefOptions({
      getAnchor: () => this.triggerRef()?.elementRef.nativeElement ?? null,
      overlay: this.overlay,
      destroyRef: this.destroyRef,
      configPreset: 'menu',
      placement: () => this.placement(),
      offset: () => this.offset(),
      matchTriggerWidth: () => this.matchTriggerWidth(),
      scrollStrategy: () => this.scrollStrategy(),
      maintainInViewport: () => this.maintainInViewport(),
      boundaries: () => this.boundaries(),
      closeAnimationDurationMs: () => this.closeAnimationDurationMs(),
      maxHeight: () => this.maxHeight(),
      hasBackdrop: () => this.hasBackdrop(),
      arrowSize: () => this.getEffectiveArrowSize(),
      panelClass: () => this.resolvePanelClassInput(),
      backdropClass: () => this.resolveBackdropClassInput(),
      panelStyle: () => this.resolvePanelStyleInput(),
      backdropStyle: () => this.resolveBackdropStylesInput(),
      beforeOpen: () => this.beforeOpen(),
      beforeClose: () => this.beforeClose(),
      useVirtualPanel: () => false,
      onOpened: () => this.onMenuDropdownOpened(),
      onClosed: (reason) => this.onMenuDropdownClosed(reason),
    });
  }

  private getEffectiveArrowSize(): { width: number; height: number } | undefined {
    return this.displayArrow() ? (this.arrowSize() ?? { ...MENU_DEFAULT_ARROW }) : undefined;
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

  private onMenuDropdownOpened(): void {
    handleMenuDropdownOpened({
      isDestroying: this.isDestroying,
      isOpenSignal: this.isOpenSignal,
      emitOpened: () => this.opened.emit(),
      afterOpened: () => focusMenuPanelAutofocusTarget(this.dropdownRef.getOverlayRef()),
    });
  }

  private onMenuDropdownClosed(reason: CloseReason | undefined): void {
    handleMenuDropdownClosed({
      isDestroying: this.isDestroying,
      reason,
      isOpenSignal: this.isOpenSignal,
      listboxRef: this.listboxRef,
      emitClosed: (r) => this.closed.emit(r),
    });
  }

  /** Dev-only: assert required content children (trigger, panel) are present. */
  private runDevModeInvariants(): void {
    assertMenuContentStructure({
      triggerPresent: !!this.triggerRef(),
      panelPresent: !!this.panelRef(),
    });
  }

  async open(): Promise<boolean> {
    const panel = this.panelRef();
    if (!panel || !this.canOpenMenu(panel)) return false;

    const portal = this.createPanelPortal(panel);

    return this.dropdownRef.open(portal);
  }

  close(reason?: CloseReason): void {
    this.dropdownRef.close(reason ?? CLOSE_REASON_PROGRAMMATIC);
  }

  toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      void this.open();
    }
  }

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

  handleTriggerKeydown(event: KeyboardEvent): void {
    routeHeadlessDropdownTriggerKeydown({
      event,
      isDisabled: this.isDisabled(),
      isOpen: this.isOpenSignal(),
      open: () => void this.open(),
      dropdownRef: this.dropdownRef,
      forwardKeydown: (ev) => this.forwardKeydownToListbox(ev),
    });
  }

  private forwardKeydownToListbox(event: KeyboardEvent): void {
    this.listboxRef()?.handleKeydown(event);
  }

  private createPanelPortal(panel: MenuPanelDirective) {
    return createMenuPanelPortal<T>({
      vcr: this.vcr,
      parentInjector: this.injector,
      panel,
      showArrow: this.displayArrow(),
      onOptionActivated: (event) => {
        this.optionActivated.emit(event);
        this.close(CLOSE_REASON_SELECTION);
      },
      setListboxRef: (listbox) => this.listboxRef.set(listbox),
    });
  }

  private canOpenMenu(panel: MenuPanelDirective | undefined): boolean {
    return canOpenDropdown({
      isOverlayOpen: this.dropdownRef.isOpen(),
      isDisabled: this.isDisabled(),
      hasAnchor: !!this.triggerRef(),
      hasPanel: !!panel,
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

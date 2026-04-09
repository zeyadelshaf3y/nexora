import {
  CdkFixedSizeVirtualScroll,
  CdkVirtualForOf,
  CdkVirtualScrollViewport,
} from '@angular/cdk/scrolling';
import { NgTemplateOutlet } from '@angular/common';
import {
  type AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Injector,
  type OnDestroy,
  type TemplateRef,
  ViewChild,
  ViewEncapsulation,
  computed,
  inject,
  input,
} from '@angular/core';
import { createRafThrottled } from '@nexora-ui/core';
import {
  ListboxOptionDirective,
  NXR_LISTBOX_CONTROLLER,
  NxrListboxVirtualScrollRegistry,
  type ListboxScrollAlignment,
  type NxrListboxController,
  type NxrListboxVirtualScrollHandler,
} from '@nexora-ui/listbox';

import {
  LISTBOX_CDK_OVERLAY_FLEX_COLUMN_STYLES,
  NXR_LISTBOX_CDK_OVERLAY_FLEX_COLUMN_CLASS,
} from '../layout/overlay-flex-layout';
import { buildFirstIndexByTrackKey } from '../virtual/build-first-index-by-track-key';
import { findIndexBySameItem } from '../virtual/find-index-by-same-item';
import { LabelLruCache } from '../virtual/label-lru-cache';
import { scrollVirtualViewportToIndex } from '../virtual/scroll-virtual-viewport';
import { afterVirtualPanelFirstPaint } from '../virtual/virtual-panel-first-paint';

import { LISTBOX_CDK_VIRTUAL_PANEL_STYLES } from './listbox-cdk-virtual-panel.styles';

/**
 * Headless CDK virtual list wired into `NxrListboxVirtualScrollRegistry` so keyboard navigation
 * targets the logical list while DOM rows stay windowed.
 */
@Component({
  selector: 'nxr-listbox-cdk-virtual-panel',
  standalone: true,
  imports: [
    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
    ListboxOptionDirective,
    NgTemplateOutlet,
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'nxr-listbox-cdk-virtual-panel',
  },
  template: `
    <cdk-virtual-scroll-viewport
      #viewport
      [itemSize]="itemSize()"
      class="nxr-listbox-cdk-viewport"
      [class.nxr-listbox-cdk-viewport--fill]="fillAvailableHeight()"
      [style.height]="fillAvailableHeight() ? undefined : viewportMaxHeight()"
      [style.max-height]="viewportMaxHeight()"
    >
      <div
        *cdkVirtualFor="let item of items(); trackBy: trackByIndex"
        class="nxr-listbox-cdk-option"
        [style.height.px]="itemSize()"
        [nxrListboxOption]="rowItem(item)"
      >
        @if (optionTemplate(); as rowTpl) {
          <ng-container *ngTemplateOutlet="rowTpl; context: { $implicit: item }" />
        } @else {
          {{ labelForRenderedItem(rowItem(item)) }}
        }
      </div>
      @if (items().length === 0) {
        <div class="nxr-listbox-cdk-empty" role="status" aria-live="polite">
          {{ emptyMessage() }}
        </div>
      }
    </cdk-virtual-scroll-viewport>
  `,
  styles: [LISTBOX_CDK_OVERLAY_FLEX_COLUMN_STYLES, LISTBOX_CDK_VIRTUAL_PANEL_STYLES],
})
export class ListboxCdkVirtualPanelComponent<T = unknown>
  implements NxrListboxVirtualScrollHandler<T>, AfterViewInit, OnDestroy
{
  readonly items = input.required<readonly T[]>();
  readonly itemSize = input(40);
  readonly initialSelectedIndex = input(-1);
  readonly viewportMaxHeight = input('200px');
  readonly fillAvailableHeight = input(false);
  readonly labelFor = input<(item: T) => string>((item) => String(item));
  readonly trackByKey = input<(item: T) => unknown>((item) => item);
  readonly emptyMessage = input('No results');
  readonly optionTemplate = input<TemplateRef<{ $implicit: T }> | null>(null);

  @ViewChild(CdkVirtualScrollViewport) private viewport!: CdkVirtualScrollViewport;

  private readonly registry = inject(NxrListboxVirtualScrollRegistry);
  private readonly listbox = inject<NxrListboxController<T>>(NXR_LISTBOX_CONTROLLER);
  private readonly injector = inject(Injector);
  private readonly throttledRefresh = createRafThrottled(() => this.refreshViewportSize());
  private resizeObserver: ResizeObserver | undefined;
  private readonly labelLruCache = new LabelLruCache<T>();

  @HostBinding('class.nxr-listbox-cdk-virtual-panel--fill')
  @HostBinding(`class.${NXR_LISTBOX_CDK_OVERLAY_FLEX_COLUMN_CLASS}`)
  get hostFillLayout(): boolean {
    return this.fillAvailableHeight();
  }

  private readonly indexByTrackKey = computed(() =>
    buildFirstIndexByTrackKey(this.items(), this.trackByKey()),
  );

  readonly trackByIndex = (_index: number, item: T): unknown => this.trackByKey()(item);

  /**
   * CDK virtual-for context types `item` loosely; narrow to `T` for listbox option bindings.
   */
  protected rowItem(item: unknown): T {
    return item as T;
  }

  protected labelForRenderedItem(item: T): string {
    return this.labelLruCache.resolve(this.items(), this.labelFor(), this.trackByKey(), item);
  }

  private refreshViewportSize(): void {
    this.viewport?.checkViewportSize();
  }

  getCurrentIndex(active: T | null): number {
    if (active == null) return -1;
    const key = this.trackByKey()(active);
    return this.indexByTrackKey().get(key) ?? -1;
  }

  resolveIndexForActive(active: T, sameItem: (a: T, b: T) => boolean): number {
    return findIndexBySameItem(this.items(), active, sameItem);
  }

  getCount(): number {
    return this.items().length;
  }

  getItemAtIndex(index: number): T {
    const list = this.items();
    const row = list[index];
    if (row === undefined) {
      throw new Error(
        `ListboxCdkVirtualPanel: index ${index} out of bounds (length ${list.length})`,
      );
    }

    return row;
  }

  scrollToIndex(index: number, alignment: ListboxScrollAlignment = 'start'): void {
    const viewport = this.viewport;
    if (!viewport) return;
    scrollVirtualViewportToIndex(viewport, index, alignment, this.itemSize(), this.getCount());
  }

  ngAfterViewInit(): void {
    this.registry.setHandler(this);

    const syncInitial = this.createAlignInitialSelectionCallback();
    afterVirtualPanelFirstPaint(this.injector, {
      measure: () => this.refreshViewportSize(),
      afterMeasure: syncInitial ?? undefined,
    });

    const el = this.viewport?.elementRef.nativeElement;
    if (el && typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.throttledRefresh.run());
      this.resizeObserver.observe(el);
    }
  }

  private createAlignInitialSelectionCallback(): (() => void) | null {
    const idx = this.initialSelectedIndex();
    const list = this.items();
    if (idx < 0 || idx >= list.length) return null;
    const item = list[idx];
    if (item === undefined) return null;

    return (): void => {
      if (!this.viewport) return;
      this.refreshViewportSize();
      this.scrollToIndex(idx, 'start');
      this.listbox.setActiveOption(item);
    };
  }

  ngOnDestroy(): void {
    this.throttledRefresh.cancel();
    this.resizeObserver?.disconnect();
    this.labelLruCache.clear();
    this.registry.setHandler(null);
  }
}

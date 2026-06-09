/**
 * Portals the option panel inside `role="listbox"`. `ngTemplateOutletInjector` injects
 * `NXR_LISTBOX_CONTROLLER` and `NxrListboxVirtualScrollRegistry` into the template (required for virtual lists).
 *
 * When `headerTemplate` or `footerTemplate` are present on the panel context the host switches to a
 * flex-column layout so the header and footer remain fixed while the listbox scrolls independently.
 */

import { NgTemplateOutlet } from '@angular/common';
import {
  type AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  type ElementRef,
  inject,
  Injector,
  signal,
  ViewEncapsulation,
  viewChild,
} from '@angular/core';
// Secondary entry must import the primary package so ng-packagr does not bundle a
// second NXR_LISTBOX_CONTROLLER token into @nexora-ui/listbox/internal.
// eslint-disable-next-line @nx/enforce-module-boundaries -- intentional cross-entry import
import { createListboxPanelOutletInjector, ListboxDirective } from '@nexora-ui/listbox';
import {
  NXR_LISTBOX_OVERLAY_PANEL_CONTEXT,
  type NxrListboxOverlayPanelContext,
} from './nxr-listbox-overlay-panel-context';
import { NxrListboxVirtualScrollRegistry } from './virtual-scroll-registry';

/** CSS class on the host element; use for demo/app styling hooks. */
export const NXR_LISTBOX_OVERLAY_PANEL_HOST_CLASS = 'nxr-listbox-overlay-panel-host';

@Component({
  selector: 'nxr-listbox-overlay-panel-host',
  standalone: true,
  imports: [ListboxDirective, NgTemplateOutlet],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [NxrListboxVirtualScrollRegistry],
  host: {
    class: NXR_LISTBOX_OVERLAY_PANEL_HOST_CLASS,
    '[class.nxr-listbox-overlay-panel-host--child-scroll]': 'childOwnsScrollLayout',
    '[class.nxr-listbox-overlay-panel-host--with-chrome]': 'hasChromeLayout',
    style: 'max-height: inherit; overflow: hidden',
  },
  template: `
    @if (panelContext.headerTemplate) {
      <div class="nxr-listbox-overlay-panel-host__header">
        <ng-container [ngTemplateOutlet]="panelContext.headerTemplate" />
      </div>
    }
    <div
      nxrListbox
      class="nxr-listbox-overlay-panel-host__listbox"
      [class.nxr-listbox-overlay-panel-host__listbox--child-scroll]="childOwnsScrollLayout"
      [style.overflow]="panelContext.childOwnsScroll ? 'hidden' : 'auto'"
      [style.maxHeight]="hasChromeLayout ? null : 'inherit'"
      [nxrListboxValue]="panelContext.value()"
      (nxrListboxValueChange)="panelContext.onValueChange($event)"
      [nxrListboxMulti]="panelContext.multi()"
      [nxrListboxAccessors]="panelContext.accessors()"
      [nxrListboxCompareWith]="panelContext.compareWith()"
      [nxrListboxInitialHighlight]="panelContext.initialHighlight()"
      #listbox="nxrListbox"
      #listboxEl
    >
      @if (panelOutletInjector(); as inj) {
        <ng-container [ngTemplateOutlet]="panelContext.template" [ngTemplateOutletInjector]="inj" />
      }
    </div>
    @if (panelContext.footerTemplate) {
      <div class="nxr-listbox-overlay-panel-host__footer">
        <ng-container [ngTemplateOutlet]="panelContext.footerTemplate" />
      </div>
    }
  `,
  styles: [
    `
      .${NXR_LISTBOX_OVERLAY_PANEL_HOST_CLASS} {
        display: block;
      }
      .${NXR_LISTBOX_OVERLAY_PANEL_HOST_CLASS}--child-scroll,
        .${NXR_LISTBOX_OVERLAY_PANEL_HOST_CLASS}__listbox--child-scroll {
        display: flex;
        flex: 1 1 auto;
        flex-direction: column;
        min-height: 0;
        min-width: 0;
      }

      /*
       * When header or footer are present, switch to flex-column so the listbox
       * scrolls independently while header/footer remain fixed.
       */
      .${NXR_LISTBOX_OVERLAY_PANEL_HOST_CLASS}--with-chrome {
        display: flex;
        flex-direction: column;
      }

      .${NXR_LISTBOX_OVERLAY_PANEL_HOST_CLASS}--with-chrome
        .${NXR_LISTBOX_OVERLAY_PANEL_HOST_CLASS}__listbox {
        flex: 1 1 auto;
        min-height: 0;
        max-height: none;
      }

      .${NXR_LISTBOX_OVERLAY_PANEL_HOST_CLASS}__header,
        .${NXR_LISTBOX_OVERLAY_PANEL_HOST_CLASS}__footer {
        flex: none;
      }
    `,
  ],
})
export class NxrListboxOverlayPanelHostComponent implements AfterViewInit {
  readonly panelContext = inject<NxrListboxOverlayPanelContext>(NXR_LISTBOX_OVERLAY_PANEL_CONTEXT);

  readonly childOwnsScrollLayout = this.panelContext.childOwnsScroll === true;
  readonly hasChromeLayout =
    !!this.panelContext.headerTemplate || !!this.panelContext.footerTemplate;

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly hostInjector = inject(Injector);
  private readonly registry = inject(NxrListboxVirtualScrollRegistry);

  private readonly listboxRef = viewChild.required<ListboxDirective>('listbox');
  private readonly listboxElRef = viewChild.required<ElementRef<HTMLElement>>('listboxEl');

  readonly panelOutletInjector = signal<Injector | undefined>(undefined);

  ngAfterViewInit(): void {
    const listbox = this.listboxRef();
    const el = this.listboxElRef();

    const inj = createListboxPanelOutletInjector(this.hostInjector, listbox, {
      provide: NxrListboxVirtualScrollRegistry,
      useValue: this.registry,
    });

    el.nativeElement.tabIndex = -1;
    this.panelOutletInjector.set(inj);
    // Signal update alone may not run the @if + outlet in this CD turn when portaled.
    this.cdr.detectChanges();
    queueMicrotask(() => this.panelContext.onListboxReady(listbox));
  }
}

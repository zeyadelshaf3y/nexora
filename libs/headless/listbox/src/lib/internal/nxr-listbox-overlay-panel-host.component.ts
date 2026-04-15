/**
 * Portals the option panel inside `role="listbox"`. `ngTemplateOutletInjector` injects
 * `NXR_LISTBOX_CONTROLLER` and `NxrListboxVirtualScrollRegistry` into the template (required for virtual lists).
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

import { ListboxDirective } from '../directives/listbox.directive';
import { createListboxPanelOutletInjector } from '../utils/create-listbox-panel-outlet-injector';

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
    style: 'max-height: inherit; overflow: hidden',
  },
  template: `
    <div
      nxrListbox
      class="nxr-listbox-overlay-panel-host__listbox"
      [class.nxr-listbox-overlay-panel-host__listbox--child-scroll]="childOwnsScrollLayout"
      [style.overflow]="panelContext.childOwnsScroll ? 'hidden' : 'auto'"
      style="max-height: inherit"
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
    `,
  ],
})
export class NxrListboxOverlayPanelHostComponent implements AfterViewInit {
  readonly panelContext = inject<NxrListboxOverlayPanelContext>(NXR_LISTBOX_OVERLAY_PANEL_CONTEXT);

  readonly childOwnsScrollLayout = this.panelContext.childOwnsScroll === true;

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

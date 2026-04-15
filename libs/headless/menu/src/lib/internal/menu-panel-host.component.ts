/**
 * Internal panel host — rendered inside the overlay pane.
 *
 * Wraps the user's `<ng-template nxrMenuPanel>` in a ListboxDirective with
 * role="menu" and mode="action", and provides NXR_LISTBOX_CONTROLLER so
 * portaled nxrMenuItem directives register correctly. When showArrow is true,
 * renders an arrow element (nxrOverlayArrow) styled as part of the panel.
 */

import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  type ElementRef,
  inject,
  Injector,
  ViewEncapsulation,
  viewChild,
  type AfterViewInit,
} from '@angular/core';
import { createListboxPanelOutletInjector, ListboxDirective } from '@nexora-ui/listbox';
import { ARROW_HOST_STYLES, OverlayArrowDirective } from '@nexora-ui/overlay';

import { NXR_MENU_CONTEXT, type MenuContext } from './menu-context';

@Component({
  selector: 'nxr-menu-panel-host',
  standalone: true,
  imports: [ListboxDirective, NgTemplateOutlet, OverlayArrowDirective],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'nxr-menu-panel-host',
    style: 'display: block; max-height: inherit; position: relative',
    '[class.nxr-menu-panel-host--with-arrow]': 'menuContext.showArrow',
    '[style.overflow]': 'menuContext.showArrow ? "visible" : "hidden"',
  },
  template: `
    @if (menuContext.showArrow) {
      <span class="nxr-menu-panel-host-arrow nxr-overlay-arrow-host" nxrOverlayArrow></span>
    }
    <div
      nxrListbox
      style="max-height: inherit; overflow: auto"
      nxrListboxRole="menu"
      nxrListboxMode="action"
      nxrListboxInitialHighlight="first"
      (nxrListboxOptionActivated)="menuContext.onOptionActivated($event)"
      #listbox="nxrListbox"
      #listboxEl
    >
      <ng-container
        [ngTemplateOutlet]="menuContext.template"
        [ngTemplateOutletInjector]="optionInjector"
      />
    </div>
  `,
  styles: [
    ARROW_HOST_STYLES,
    `
      .nxr-menu-panel-host-arrow {
        width: var(--nxr-arrow-width, 12px);
        height: var(--nxr-arrow-height, 6px);
        background: var(--nxr-menu-arrow-bg, var(--nxr-overlay-bg, #fff));
        clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        box-sizing: border-box;
        z-index: 1;
      }
    `,
  ],
})
export class MenuPanelHostComponent implements AfterViewInit {
  readonly menuContext = inject<MenuContext>(NXR_MENU_CONTEXT);

  private readonly listboxDirective = viewChild.required<ListboxDirective>('listbox');
  private readonly listboxElementRef = viewChild.required<ElementRef<HTMLElement>>('listboxEl');

  /** Injector for the panel template so option directives receive NXR_LISTBOX_CONTROLLER. */
  optionInjector!: Injector;

  private readonly parentInjector = inject(Injector);
  private readonly cdr = inject(ChangeDetectorRef);

  ngAfterViewInit(): void {
    const listbox = this.listboxDirective();
    const el = this.listboxElementRef();

    this.optionInjector = createListboxPanelOutletInjector(this.parentInjector, listbox);

    el.nativeElement.tabIndex = -1;
    /* Plain field + portaled host: OnPush needs an explicit pass so the outlet sees `optionInjector`. */
    this.cdr.detectChanges();
    this.menuContext.onListboxReady(listbox);
    queueMicrotask(() => listbox.scrollActiveIntoView());
  }
}

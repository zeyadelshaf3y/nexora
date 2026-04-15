import { Component } from '@angular/core';
import { FocusTrapDirective } from '@nexora-ui/interactions';
import { CloseDrawerDirective } from '@nexora-ui/overlay';

/**
 * Content for the drawer opened from inside the dialog.
 * Uses a component instead of a template so the overlay can attach it with ComponentPortal
 * and avoid TemplatePortal + ViewContainerRef context issues (e.g. ssrId) when opening
 * from within another overlay.
 */
@Component({
  selector: 'app-nested-drawer-content',
  standalone: true,
  imports: [CloseDrawerDirective, FocusTrapDirective],
  template: `
    <div class="tpl-drawer" nxrFocusTrap>
      <h2>Nested Drawer</h2>
      <p>Opened from inside the template dialog.</p>
      <p>Escape or backdrop closes this drawer; the dialog stays open.</p>
      <div class="tpl-drawer-footer">
        <button class="btn btn-ghost" nxrDrawerClose>Close drawer</button>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class NestedDrawerContentComponent {}

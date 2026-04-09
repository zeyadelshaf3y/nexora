import { Component } from '@angular/core';
import { OverlayArrowDirective } from '@nexora-ui/overlay';
import { ClosePopoverDirective } from '@nexora-ui/popover';

/**
 * Popover content used inside the dialog. Uses a component instead of a template
 * so the popover works when the trigger is inside portaled content (avoids ssrId/view-context issues).
 */
@Component({
  selector: 'app-nested-popover-content',
  standalone: true,
  imports: [OverlayArrowDirective, ClosePopoverDirective],
  template: `
    <div nxrOverlayArrow class="demo-arrow"></div>
    <div class="tpl-popover tpl-popover--compact">
      <p>Popover opened from inside the dialog.</p>
      <button class="btn btn-sm btn-ghost" nxrPopoverClose>Close</button>
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
export class NestedPopoverContentComponent {}

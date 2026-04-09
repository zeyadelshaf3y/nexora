import { ChangeDetectionStrategy, Component, signal, ViewEncapsulation } from '@angular/core';
import { OverlayArrowDirective } from '@nexora-ui/overlay';
import { PopoverTriggerDirective } from '@nexora-ui/popover';
import {
  SelectComponent,
  SelectTriggerDirective,
  SelectPanelDirective,
  SelectOptionDirective,
} from '@nexora-ui/select';
import { TooltipTriggerDirective } from '@nexora-ui/tooltip';

@Component({
  selector: 'app-rtl-page',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TooltipTriggerDirective,
    PopoverTriggerDirective,
    OverlayArrowDirective,
    SelectComponent,
    SelectTriggerDirective,
    SelectPanelDirective,
    SelectOptionDirective,
  ],
  template: `
    <section class="page-section">
      <h2 class="page-section-title">RTL (Right-to-Left)</h2>
      <p class="page-section-desc">
        Nexora components respect <code>dir="rtl"</code> from the document or a parent element.
        Placements (start/end) and listbox keyboard (ArrowLeft/ArrowRight) flip automatically — no
        extra configuration.
      </p>
      <p class="page-section-desc">
        The block below is wrapped with <code>dir="rtl"</code>. Hover tooltips, open the popover and
        select to see RTL behavior.
      </p>
    </section>

    <div class="rtl-demo-block" dir="rtl">
      <h3 class="rtl-demo-title">RTL container</h3>
      <div class="rtl-demo-row">
        <button
          class="btn"
          nxrTooltip="تلميح في الوضع العربي"
          nxrTooltipPlacement="top-start"
          nxrTooltipPanelClass="demo-tooltip-pane"
        >
          Tooltip (top-start)
        </button>
        <button
          class="btn"
          [nxrPopover]="rtlPopoverTpl"
          nxrPopoverPlacement="bottom-start"
          nxrPopoverPanelClass="demo-popover-pane"
        >
          Popover (bottom-start)
        </button>
        <div class="rtl-select-wrap">
          <nxr-select [(value)]="rtlSelected" placeholder="Select…">
            <button nxrSelectTrigger class="btn btn-select">Select</button>
            <ng-template nxrSelectPanel>
              <div nxrSelectOption value="opt1">Option 1</div>
              <div nxrSelectOption value="opt2">Option 2</div>
              <div nxrSelectOption value="opt3">Option 3</div>
            </ng-template>
          </nxr-select>
        </div>
      </div>

      <ng-template #rtlPopoverTpl>
        <div nxrOverlayArrow class="demo-arrow"></div>
        <div class="rtl-popover-content">
          <p>Popover in RTL — placement and arrow follow start/end.</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [
    `
      .rtl-demo-block {
        border: 1px solid var(--nxr-border, #e5e7eb);
        border-radius: 8px;
        padding: 24px;
        background: var(--nxr-bg-elevated, #f9fafb);
      }
      .rtl-demo-title {
        margin: 0 0 16px 0;
        font-size: 1rem;
        font-weight: 600;
        color: var(--nxr-text, #111);
      }
      .rtl-demo-row {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: center;
      }
      .rtl-select-wrap {
        min-width: 140px;
      }
      .btn-select {
        width: 100%;
        justify-content: space-between;
      }
      .rtl-popover-content {
        padding: 12px;
        min-width: 200px;
      }
      .rtl-popover-content p {
        margin: 0;
        font-size: 0.875rem;
        color: var(--nxr-text, #374151);
      }
    `,
  ],
})
export class RtlPageComponent {
  readonly rtlSelected = signal<string | null>(null);
}

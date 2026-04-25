import { ChangeDetectionStrategy, Component, signal, ViewEncapsulation } from '@angular/core';
import type { Placement } from '@nexora-ui/overlay';
import {
  TOOLTIP_DEFAULTS_CONFIG,
  TOOLTIP_WARMUP_CONFIG,
  TooltipTriggerDirective,
} from '@nexora-ui/tooltip';

@Component({
  selector: 'app-tooltip-provider-defaults-demo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TooltipTriggerDirective],
  providers: [
    {
      provide: TOOLTIP_DEFAULTS_CONFIG,
      useValue: {
        openDelay: 120,
        hoverCloseDelay: 120,
        closeAnimationDurationMs: 120,
        displayArrow: false,
        instantOnHandoff: false,
        panelClass: 'demo-tooltip-pane',
      },
    },
  ],
  template: `
    <div class="btn-row">
      <button class="btn btn-sm" nxrTooltip="Uses provider defaults (no arrow)">Provider A</button>
      <button class="btn btn-sm" nxrTooltip="Also provider defaults (handoff disabled)">
        Provider B
      </button>
    </div>
  `,
})
export class TooltipProviderDefaultsDemoComponent {}

@Component({
  selector: 'app-tooltip-provider-warmup-demo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TooltipTriggerDirective],
  providers: [
    { provide: TOOLTIP_WARMUP_CONFIG, useValue: { warmupWindowMs: 700 } },
    { provide: TOOLTIP_DEFAULTS_CONFIG, useValue: { panelClass: 'demo-tooltip-pane' } },
  ],
  template: `
    <div class="btn-row">
      <button class="btn btn-sm" nxrTooltip="700ms warmup window" [nxrTooltipOpenDelay]="350">
        Window A
      </button>
      <button
        class="btn btn-sm"
        nxrTooltip="Open me quickly after A closes"
        [nxrTooltipOpenDelay]="350"
      >
        Window B
      </button>
    </div>
  `,
})
export class TooltipProviderWarmupDemoComponent {}

@Component({
  selector: 'app-tooltip-page',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TooltipTriggerDirective,
    TooltipProviderDefaultsDemoComponent,
    TooltipProviderWarmupDemoComponent,
  ],
  template: `
    <!-- Cheat sheet -->
    <section class="page-section">
      <h2 class="page-section-title">Tooltip Controls Cheat Sheet</h2>
      <p class="page-section-desc">
        Quick reference for the most important tooltip behaviors and where they are configured.
      </p>
      <div class="tooltip-cheat-sheet" role="region" aria-label="Tooltip controls reference">
        <div class="tooltip-cheat-sheet-item">
          <strong>Open delay</strong>
          <code>nxrTooltipOpenDelay</code>
          <span>Global: <code>TOOLTIP_DEFAULTS_CONFIG.openDelay</code></span>
        </div>
        <div class="tooltip-cheat-sheet-item">
          <strong>Close delay</strong>
          <code>nxrTooltipCloseDelay</code>, <code>nxrTooltipHoverCloseDelay</code>,
          <code>nxrTooltipFocusCloseDelay</code>
          <span>Global: matching fields in <code>TOOLTIP_DEFAULTS_CONFIG</code></span>
        </div>
        <div class="tooltip-cheat-sheet-item">
          <strong>Instant tooltip handoff</strong>
          <code>nxrTooltipInstantOnHandoff</code>
          <span>Global: <code>TOOLTIP_DEFAULTS_CONFIG.instantOnHandoff</code></span>
        </div>
        <div class="tooltip-cheat-sheet-item">
          <strong>Post-close warmup window</strong>
          <code>TOOLTIP_WARMUP_CONFIG.warmupWindowMs</code>
          <span>Applies to next tooltip open within the configured window</span>
        </div>
        <div class="tooltip-cheat-sheet-item">
          <strong>Arrow + style</strong>
          <code>nxrTooltipDisplayArrow</code>, <code>nxrTooltipPanelClass</code>,
          <code>nxrTooltipPanelStyle</code>, <code>nxrTooltipArrowSize</code>
          <span>Global: matching fields in <code>TOOLTIP_DEFAULTS_CONFIG</code></span>
        </div>
        <div class="tooltip-cheat-sheet-item">
          <strong>Positioning</strong>
          <code>nxrTooltipPlacement</code>, <code>nxrTooltipOffset</code>,
          <code>nxrTooltipClampToViewport</code>, <code>nxrTooltipScrollStrategy</code>,
          <code>nxrTooltipMaintainInViewport</code>, <code>nxrTooltipBoundaries</code>
          <span>Global: matching fields in <code>TOOLTIP_DEFAULTS_CONFIG</code></span>
        </div>
      </div>
    </section>

    <!-- Basic Tooltips -->
    <section class="page-section">
      <h2 class="page-section-title">Basic Tooltips</h2>
      <p class="page-section-desc">Hover or focus a button to show a tooltip.</p>
      <div class="btn-row">
        <button class="btn" nxrTooltip="Save your changes" nxrTooltipPanelClass="demo-tooltip-pane">
          Save
        </button>
        <button
          class="btn"
          nxrTooltip="Delete this item permanently"
          nxrTooltipPanelClass="demo-tooltip-pane"
          [nxrTooltipPanelStyle]="{ maxWidth: '20rem' }"
        >
          Delete
        </button>
        <button
          class="btn"
          nxrTooltip="Copy link to clipboard"
          nxrTooltipPanelClass="demo-tooltip-pane"
        >
          Copy Link
        </button>
      </div>
    </section>

    <!-- Reactive Content Update -->
    <section class="page-section">
      <h2 class="page-section-title">Reactive Content Update</h2>
      <p class="page-section-desc">
        Hover this trigger, then click it to change the bound tooltip text while the tooltip is
        still open.
      </p>
      <div class="btn-row">
        <button
          class="btn"
          [nxrTooltip]="reactiveTooltipContent()"
          nxrTooltipPanelClass="demo-tooltip-pane"
          [nxrTooltipOpenDelay]="0"
          (click)="updateReactiveTooltipContent()"
        >
          Click to update tooltip text
        </button>
      </div>
    </section>

    <!-- Handoff instant on (default) -->
    <section class="page-section">
      <h2 class="page-section-title">Instant Handoff (Default)</h2>
      <p class="page-section-desc">
        400ms open delay normally, but when moving directly between these tooltips handoff opens
        instantly (no delay, no open animation).
      </p>
      <div class="btn-row">
        <button
          class="btn btn-sm"
          nxrTooltip="Bold"
          nxrTooltipPanelClass="demo-tooltip-pane"
          [nxrTooltipOpenDelay]="400"
        >
          B
        </button>
        <button
          class="btn btn-sm"
          nxrTooltip="Italic"
          nxrTooltipPanelClass="demo-tooltip-pane"
          [nxrTooltipOpenDelay]="400"
        >
          I
        </button>
        <button
          class="btn btn-sm"
          nxrTooltip="Underline"
          nxrTooltipPanelClass="demo-tooltip-pane"
          [nxrTooltipOpenDelay]="400"
        >
          U
        </button>
        <button
          class="btn btn-sm"
          nxrTooltip="Strikethrough"
          nxrTooltipPanelClass="demo-tooltip-pane"
          [nxrTooltipOpenDelay]="400"
        >
          S
        </button>
        <button
          class="btn btn-sm"
          nxrTooltip="Insert Link"
          nxrTooltipPanelClass="demo-tooltip-pane"
          [nxrTooltipOpenDelay]="400"
        >
          Link
        </button>
      </div>
    </section>

    <!-- Instant handoff disabled -->
    <section class="page-section">
      <h2 class="page-section-title">Instant Handoff Disabled</h2>
      <p class="page-section-desc">
        These use <code>[nxrTooltipInstantOnHandoff]="false"</code>, so moving from one tooltip to
        another keeps normal delay/animation behavior.
      </p>
      <div class="btn-row">
        <button
          class="btn btn-sm"
          nxrTooltip="First (handoff disabled)"
          nxrTooltipPanelClass="demo-tooltip-pane"
          [nxrTooltipOpenDelay]="300"
          [nxrTooltipInstantOnHandoff]="false"
        >
          Disabled A
        </button>
        <button
          class="btn btn-sm"
          nxrTooltip="Second (handoff disabled)"
          nxrTooltipPanelClass="demo-tooltip-pane"
          [nxrTooltipOpenDelay]="300"
          [nxrTooltipInstantOnHandoff]="false"
        >
          Disabled B
        </button>
      </div>
    </section>

    <!-- Provider defaults -->
    <section class="page-section">
      <h2 class="page-section-title">Provider Defaults Config</h2>
      <p class="page-section-desc">
        This subsection uses <code>TOOLTIP_DEFAULTS_CONFIG</code> with <code>openDelay=120</code>,
        <code>hoverCloseDelay=120</code>, <code>closeAnimationDurationMs=120</code>,
        <code>displayArrow=false</code>, and <code>instantOnHandoff=false</code>.
      </p>
      <app-tooltip-provider-defaults-demo />
    </section>

    <!-- Warmup window provider -->
    <section class="page-section">
      <h2 class="page-section-title">Warmup Window Provider</h2>
      <p class="page-section-desc">
        This subsection provides <code>TOOLTIP_WARMUP_CONFIG</code> with
        <code>warmupWindowMs=700</code>. Close one tooltip, then hover the other quickly to see the
        warmup shortcut.
      </p>
      <app-tooltip-provider-warmup-demo />
    </section>

    <!-- All 12 Placements -->
    <section class="page-section">
      <h2 class="page-section-title">All 12 Placements</h2>
      <p class="page-section-desc">RTL-aware placement with viewport flipping and clamping.</p>
      <div class="placement-grid">
        @for (p of allPlacements; track p) {
          <button
            class="btn btn-sm"
            [nxrTooltip]="p"
            [nxrTooltipPlacement]="p"
            [nxrTooltipOpenDelay]="0"
            nxrTooltipPanelClass="demo-tooltip-pane"
          >
            {{ p }}
          </button>
        }
      </div>
    </section>

    <!-- Without Arrow -->
    <section class="page-section">
      <h2 class="page-section-title">Without Arrow</h2>
      <p class="page-section-desc">Tooltip rendered without the decorative arrow element.</p>
      <div class="btn-row">
        <button
          class="btn"
          nxrTooltip="No arrow on this tooltip"
          nxrTooltipPanelClass="demo-tooltip-pane"
          [nxrTooltipDisplayArrow]="false"
        >
          No Arrow
        </button>
      </div>
    </section>

    <!-- Content Hover -->
    <section class="page-section">
      <h2 class="page-section-title">Content Hover</h2>
      <p class="page-section-desc">
        Tooltip stays open when you move into its content area — useful for interactive tooltips.
      </p>
      <div class="btn-row">
        <button
          class="btn"
          nxrTooltip="Hover over me and then move your cursor to this tooltip — it stays open!"
          nxrTooltipPanelClass="demo-tooltip-pane demo-tooltip-pane--interactive"
          [nxrTooltipAllowContentHover]="true"
          nxrTooltipPlacement="top-end"
          [nxrTooltipOffset]="20"
          [nxrTooltipDisplayArrow]="true"
        >
          Content Hover
        </button>
      </div>
    </section>

    <!-- Custom Offsets -->
    <section class="page-section">
      <h2 class="page-section-title">Custom Offsets</h2>
      <p class="page-section-desc">Adjust the distance between the trigger and the tooltip.</p>
      <div class="btn-row">
        <button class="btn" nxrTooltip="Default offset" nxrTooltipPanelClass="demo-tooltip-pane">
          Default
        </button>
        <button
          class="btn"
          nxrTooltip="10px offset"
          nxrTooltipPanelClass="demo-tooltip-pane"
          [nxrTooltipOffset]="10"
        >
          Offset 10px
        </button>
        <button
          class="btn"
          nxrTooltip="20px offset"
          nxrTooltipPanelClass="demo-tooltip-pane"
          [nxrTooltipOffset]="20"
        >
          Offset 20px
        </button>
      </div>
    </section>

    <!-- Animated Close -->
    <section class="page-section">
      <h2 class="page-section-title">Animated Close</h2>
      <p class="page-section-desc">Close animation with a 200ms duration for a smooth exit.</p>
      <div class="btn-row">
        <button
          class="btn"
          nxrTooltip="This tooltip has a 200ms close animation"
          nxrTooltipPanelClass="demo-tooltip-pane"
          [nxrTooltipCloseAnimationDurationMs]="200"
        >
          Animated Close
        </button>
      </div>
    </section>

    <!-- Scroll strategies -->
    <section class="page-section">
      <h2 class="page-section-title">Scroll Strategies</h2>
      <p class="page-section-desc">
        Inside a scrollable area: <strong>noop</strong> — tooltip sticks to trigger, height fixed;
        <strong>reposition</strong> — tooltip repositions/flips to stay in viewport. Scroll the box
        to compare.
      </p>
      <div class="scroll-strategy-demo">
        <div class="scroll-strategy-scrollbox">
          <div class="scroll-strategy-spacer"></div>
          <div class="scroll-strategy-row">
            <button
              class="btn btn-sm"
              nxrTooltip="noop: I stick to the trigger and keep my height"
              nxrTooltipScrollStrategy="noop"
              nxrTooltipPanelClass="demo-tooltip-pane"
              [nxrTooltipOpenDelay]="0"
            >
              noop
            </button>
            <button
              class="btn btn-sm"
              nxrTooltip="reposition: I flip to stay in viewport"
              nxrTooltipScrollStrategy="reposition"
              nxrTooltipPanelClass="demo-tooltip-pane"
              [nxrTooltipOpenDelay]="0"
            >
              reposition
            </button>
          </div>
          <div class="scroll-strategy-spacer"></div>
        </div>
      </div>
    </section>

    <!-- Disabled -->
    <section class="page-section">
      <h2 class="page-section-title">Disabled Tooltip</h2>
      <p class="page-section-desc">
        Disabled trigger does not open a tooltip (useful for conditionally muted affordances).
      </p>
      <div class="btn-row">
        <button
          class="btn"
          nxrTooltip="You should never see this tooltip"
          nxrTooltipPanelClass="demo-tooltip-pane"
          [nxrTooltipDisabled]="true"
        >
          Disabled
        </button>
      </div>
    </section>
  `,
  styles: [
    `
      .scroll-strategy-demo {
        margin-top: 0.5rem;
      }
      .tooltip-cheat-sheet {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 10px;
      }
      .tooltip-cheat-sheet-item {
        border: 1px solid var(--demo-border, #d1d5db);
        border-radius: 8px;
        background: var(--demo-surface, #fff);
        padding: 10px 12px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .tooltip-cheat-sheet-item strong {
        font-size: 0.92rem;
      }
      .tooltip-cheat-sheet-item code {
        font-size: 0.78rem;
        line-height: 1.3;
      }
      .tooltip-cheat-sheet-item span {
        font-size: 0.78rem;
        color: var(--demo-muted, #6b7280);
      }
      .scroll-strategy-scrollbox {
        height: 200px;
        overflow: auto;
        border: 1px solid var(--demo-border, #ccc);
        border-radius: 6px;
        padding: 12px;
      }
      .scroll-strategy-spacer {
        height: 120px;
      }
      .scroll-strategy-row {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }
    `,
  ],
})
export class TooltipPageComponent {
  readonly reactiveTooltipContent = signal('Initial tooltip text. Click trigger to update.');

  readonly allPlacements: Placement[] = [
    'top-start',
    'top',
    'top-end',
    'start-top',
    'start',
    'start-end',
    'end-start',
    'end',
    'end-end',
    'bottom-start',
    'bottom',
    'bottom-end',
  ];

  updateReactiveTooltipContent(): void {
    this.reactiveTooltipContent.set(
      `Updated from click at ${new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })}`,
    );
  }
}

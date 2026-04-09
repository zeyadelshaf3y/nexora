import { ChangeDetectionStrategy, Component, signal, ViewEncapsulation } from '@angular/core';
import { ListboxDirective, ListboxOptionDirective } from '@nexora-ui/listbox';
import { OverlayArrowDirective, type Placement } from '@nexora-ui/overlay';
import { ClosePopoverDirective, PopoverTriggerDirective } from '@nexora-ui/popover';

import { IconComponent } from '../core/icons';

interface MenuAction {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-popover-page',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PopoverTriggerDirective,
    ClosePopoverDirective,
    OverlayArrowDirective,
    ListboxDirective,
    ListboxOptionDirective,
    IconComponent,
  ],
  template: `
    <!-- Trigger Types -->
    <section class="page-section">
      <h2 class="page-section-title">Trigger Types</h2>
      <p class="page-section-desc">Open popovers via click, focus, hover, or combined triggers.</p>
      <div class="btn-row">
        <button
          class="btn"
          [nxrPopover]="richTpl"
          nxrPopoverPanelClass="demo-popover-pane"
          [nxrPopoverPanelStyle]="{ maxWidth: '10rem' }"
          [nxrPopoverCloseAnimationDurationMs]="150"
        >
          Click
        </button>
        <button
          class="btn"
          [nxrPopover]="richTpl"
          nxrPopoverTrigger="focus"
          nxrPopoverPlacement="bottom"
          nxrPopoverPanelClass="demo-popover-pane"
          [nxrPopoverCloseAnimationDurationMs]="150"
        >
          Focus
        </button>
        <button
          class="btn"
          [nxrPopover]="richTpl"
          nxrPopoverTrigger="hover"
          nxrPopoverPlacement="bottom"
          nxrPopoverPanelClass="demo-popover-pane"
          [nxrPopoverCloseAnimationDurationMs]="150"
        >
          Hover
        </button>
        <button
          class="btn"
          [nxrPopover]="richTpl"
          [nxrPopoverTrigger]="['hover', 'focus']"
          nxrPopoverPlacement="bottom"
          nxrPopoverPanelClass="demo-popover-pane"
          [nxrPopoverCloseAnimationDurationMs]="150"
        >
          Hover + Focus
        </button>
        <button
          class="btn"
          [nxrPopover]="richTpl"
          nxrPopoverPanelClass="demo-popover-pane"
          [nxrPopoverCloseAnimationDurationMs]="150"
          [nxrPopoverHasBackdrop]="true"
          nxrPopoverBackdropClass="demo-popover-backdrop"
          [nxrPopoverBackdropStyle]="{ backdropFilter: 'blur(2px)' }"
        >
          With Backdrop
        </button>
        <button
          class="btn"
          [nxrPopover]="richTpl"
          nxrPopoverPanelClass="demo-popover-pane"
          [nxrPopoverCloseAnimationDurationMs]="150"
          [nxrPopoverDisabled]="true"
        >
          Disabled
        </button>
      </div>
    </section>

    <!-- Autocomplete Pattern -->
    <section class="page-section">
      <h2 class="page-section-title">Input with Focus Popover</h2>
      <p class="page-section-desc">
        Autocomplete-like pattern: popover opens on focus, matches anchor width.
      </p>
      <input
        class="demo-input"
        type="text"
        placeholder="Focus me for suggestions…"
        [nxrPopover]="suggestionsTpl"
        [nxrPopoverTrigger]="['focus', 'click']"
        nxrPopoverPlacement="bottom-start"
        nxrPopoverPanelClass="demo-popover-pane"
        [nxrPopoverMatchAnchorWidth]="true"
        [nxrPopoverCloseAnimationDurationMs]="120"
        [nxrPopoverOffset]="4"
        nxrPopoverRole="listbox"
      />
    </section>

    <!-- All 12 Placements -->
    <section class="page-section">
      <h2 class="page-section-title">All 12 Placements</h2>
      <p class="page-section-desc">Each button forces its preferred placement (no flip).</p>
      <div class="placement-grid">
        @for (p of allPlacements; track p) {
          <button
            class="btn btn-sm"
            [nxrPopover]="simpleTpl"
            [nxrPopoverPlacement]="p"
            [nxrPopoverPreferredPlacementOnly]="true"
            nxrPopoverPanelClass="demo-popover-pane"
            [nxrPopoverCloseAnimationDurationMs]="150"
          >
            {{ p }}
          </button>
        }
      </div>
    </section>

    <!-- Custom Sizing -->
    <section class="page-section">
      <h2 class="page-section-title">Custom Sizing</h2>
      <p class="page-section-desc">Min/max width/height constraints on the panel.</p>
      <div class="btn-row">
        <button
          class="btn"
          [nxrPopover]="longTpl"
          nxrPopoverPanelClass="demo-popover-pane"
          [nxrPopoverCloseAnimationDurationMs]="150"
          nxrPopoverMaxWidth="250px"
          nxrPopoverMaxHeight="150px"
        >
          maxW 250, maxH 150
        </button>
        <button
          class="btn"
          [nxrPopover]="simpleTpl"
          nxrPopoverPanelClass="demo-popover-pane"
          [nxrPopoverCloseAnimationDurationMs]="150"
          nxrPopoverWidth="300px"
          nxrPopoverMinHeight="120px"
        >
          fixed W 300, minH 120
        </button>
      </div>
    </section>

    <!-- Nested Popover -->
    <section class="page-section">
      <h2 class="page-section-title">Nested Popover</h2>
      <p class="page-section-desc">A popover inside another popover, triggered by hover.</p>
      <button
        class="btn"
        [nxrPopover]="nestedParentTpl"
        nxrPopoverPanelClass="demo-popover-pane"
        [nxrPopoverCloseAnimationDurationMs]="150"
      >
        Open parent popover
      </button>
    </section>

    <!-- Scroll strategies -->
    <section class="page-section">
      <h2 class="page-section-title">Scroll Strategies</h2>
      <p class="page-section-desc">
        Inside a scrollable area: <strong>noop</strong> — panel sticks to trigger, height fixed;
        <strong>reposition</strong> — panel repositions/flips to stay in viewport;
        <strong>close</strong> — panel closes when you scroll. Open each and scroll the box to
        compare.
      </p>
      <div class="scroll-strategy-demo">
        <div class="scroll-strategy-scrollbox">
          <div class="scroll-strategy-spacer"></div>
          <div class="scroll-strategy-row">
            <button
              class="btn btn-sm"
              [nxrPopover]="simpleTpl"
              nxrPopoverScrollStrategy="noop"
              nxrPopoverPanelClass="demo-popover-pane"
              [nxrPopoverCloseAnimationDurationMs]="150"
            >
              noop
            </button>
            <button
              class="btn btn-sm"
              [nxrPopover]="simpleTpl"
              nxrPopoverScrollStrategy="reposition"
              nxrPopoverPanelClass="demo-popover-pane"
              [nxrPopoverCloseAnimationDurationMs]="150"
            >
              reposition
            </button>
            <button
              class="btn btn-sm"
              [nxrPopover]="simpleTpl"
              nxrPopoverScrollStrategy="close"
              nxrPopoverPanelClass="demo-popover-pane"
              [nxrPopoverCloseAnimationDurationMs]="150"
            >
              close
            </button>
          </div>
          <div class="scroll-strategy-spacer"></div>
        </div>
      </div>
    </section>

    <!-- Mixed: Popover + Listbox (action menu) -->
    <section class="page-section">
      <h2 class="page-section-title">Popover + Listbox (Action Menu)</h2>
      <p class="page-section-desc">
        A popover containing a listbox in action mode — dropdown-like menu pattern.
      </p>
      <div class="btn-row">
        <button
          class="btn"
          [nxrPopover]="actionMenuTpl"
          nxrPopoverPlacement="bottom-start"
          nxrPopoverPanelClass="demo-popover-pane"
          [nxrPopoverCloseAnimationDurationMs]="150"
        >
          <app-icon name="menu" [size]="16" />
          Actions
        </button>
        <span class="popover-page-meta">Last action: {{ lastAction() ?? '—' }}</span>
      </div>
    </section>

    <!-- ═══ Templates ═══ -->
    <ng-template #richTpl>
      <div nxrOverlayArrow class="demo-arrow"></div>
      <div class="tpl-popover">
        <h3>Popover</h3>
        <p>Anchored panel with arrow. Repositions on scroll/resize.</p>
        <div class="btn-row">
          <button class="btn btn-sm btn-ghost" nxrPopoverClose>Close</button>
        </div>
      </div>
    </ng-template>

    <ng-template #simpleTpl>
      <div nxrOverlayArrow class="demo-arrow"></div>
      <div class="tpl-popover tpl-popover--compact">
        <p>Popover content</p>
      </div>
    </ng-template>

    <ng-template #longTpl>
      <div nxrOverlayArrow class="demo-arrow"></div>
      <div class="tpl-popover">
        <h3>Long Popover</h3>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Ut enim ad minim veniam.
        </p>
        <p>
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
          nulla pariatur.
        </p>
      </div>
    </ng-template>

    <ng-template #suggestionsTpl>
      <div nxrOverlayArrow class="demo-arrow"></div>
      <ul class="tpl-suggestions" role="listbox">
        <li class="tpl-suggestions-item" role="option" [attr.aria-selected]="false">Dashboard</li>
        <li class="tpl-suggestions-item" role="option" [attr.aria-selected]="false">Settings</li>
        <li class="tpl-suggestions-item" role="option" [attr.aria-selected]="false">Profile</li>
        <li class="tpl-suggestions-item" role="option" [attr.aria-selected]="false">
          Notifications
        </li>
        <li class="tpl-suggestions-item" role="option" [attr.aria-selected]="false">Help Center</li>
      </ul>
    </ng-template>

    <ng-template #nestedParentTpl>
      <div nxrOverlayArrow class="demo-arrow"></div>
      <div class="tpl-popover">
        <h3>Parent Popover</h3>
        <p>Hover the button below to open a nested popover.</p>
        <div class="btn-row">
          <button
            class="btn btn-sm"
            [nxrPopover]="nestedChildTpl"
            nxrPopoverTrigger="hover"
            nxrPopoverPlacement="end"
            nxrPopoverPanelClass="demo-popover-pane"
            [nxrPopoverCloseAnimationDurationMs]="150"
            [nxrPopoverOffset]="20"
          >
            Hover for nested
          </button>
          <button class="btn btn-sm btn-ghost" nxrPopoverClose>Close</button>
        </div>
      </div>
    </ng-template>

    <ng-template #nestedChildTpl>
      <div nxrOverlayArrow class="demo-arrow"></div>
      <div class="tpl-popover tpl-popover--compact">
        <p>Nested popover! Close me or the parent.</p>
      </div>
    </ng-template>

    <ng-template #actionMenuTpl>
      <div nxrOverlayArrow class="demo-arrow"></div>
      <div
        class="popover-page-action-menu"
        nxrListbox
        nxrListboxMode="action"
        nxrListboxRole="menu"
        [nxrListboxAccessors]="menuAccessors"
        (nxrListboxOptionActivated)="onMenuAction($event)"
      >
        @for (action of menuActions; track action.id) {
          <div class="popover-page-action-item" [nxrListboxOption]="action">
            <app-icon [name]="action.icon" [size]="16" />
            {{ action.label }}
          </div>
        }
      </div>
    </ng-template>
  `,
  styles: [
    `
      .popover-page-meta {
        font-size: 0.8125rem;
        color: var(--nxr-text-muted);
        display: flex;
        align-items: center;
      }
      .popover-page-action-menu {
        min-width: 180px;
        padding: 0.25rem 0;
        outline: none;
      }
      .popover-page-action-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
        font-size: 0.875rem;
        cursor: default;
        transition: background 0.1s;
      }
      .popover-page-action-item[data-active] {
        background: var(--nxr-primary-subtle);
      }
      .popover-page-action-item[aria-selected='true'] {
        font-weight: 600;
        color: var(--nxr-primary);
      }
      .scroll-strategy-demo {
        margin-top: 0.5rem;
      }
      .demo-popover-backdrop {
        background: rgba(15, 23, 42, 0.38);
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
export class PopoverPageComponent {
  readonly lastAction = signal<string | null>(null);

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

  readonly menuActions: MenuAction[] = [
    { id: 'settings', label: 'Settings', icon: 'settings' },
    { id: 'edit', label: 'Edit', icon: 'edit' },
    { id: 'delete', label: 'Delete', icon: 'trash' },
  ];

  readonly menuAccessors = {
    value: (a: MenuAction) => a.id,
    label: (a: MenuAction) => a.label,
  };

  onMenuAction(event: { option: MenuAction }): void {
    this.lastAction.set(event.option.label);
  }
}

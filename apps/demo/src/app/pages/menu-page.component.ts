import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal, ViewEncapsulation } from '@angular/core';
import {
  MenuComponent,
  MenuTriggerDirective,
  MenuPanelDirective,
  MenuItemDirective,
  MenuGroupDirective,
  MenuGroupLabelDirective,
  MenuSeparatorDirective,
  type MenuOptionActivatedEvent,
  type CloseReason,
} from '@nexora-ui/menu';
import type { ViewportBoundaries } from '@nexora-ui/overlay';

import { IconComponent } from '../core/icons';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ActionItem {
  id: string;
  label: string;
  icon?: string;
}

interface GroupedAction {
  id: string;
  label: string;
  group: string;
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const BASIC_ACTIONS: ActionItem[] = [
  { id: 'new', label: 'New file', icon: 'plus' },
  { id: 'open', label: 'Open file', icon: 'external-link' },
  { id: 'save', label: 'Save', icon: 'check' },
  { id: 'copy', label: 'Copy', icon: 'copy' },
];

const GROUPED_ACTIONS: GroupedAction[] = [
  { id: 'cut', label: 'Cut', group: 'Edit' },
  { id: 'copy-g', label: 'Copy', group: 'Edit' },
  { id: 'paste', label: 'Paste', group: 'Edit' },
  { id: 'undo', label: 'Undo', group: 'History' },
  { id: 'redo', label: 'Redo', group: 'History' },
];

function getGroups(): { label: string; actions: GroupedAction[] }[] {
  const groups = [...new Set(GROUPED_ACTIONS.map((a) => a.group))];
  return groups.map((label) => ({
    label,
    actions: GROUPED_ACTIONS.filter((a) => a.group === label),
  }));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

@Component({
  selector: 'app-menu-page',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    JsonPipe,
    MenuComponent,
    MenuTriggerDirective,
    MenuPanelDirective,
    MenuItemDirective,
    MenuGroupDirective,
    MenuGroupLabelDirective,
    MenuSeparatorDirective,
    IconComponent,
  ],
  template: `
    <div id="menu">
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- 1. Basic menu                                                       -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <section class="page-section sub-section">
        <h2 class="page-section-title">Basic Menu</h2>
        <p class="page-section-desc">
          Simple action menu. Click an item or press Enter to activate; panel closes and
          <code>optionActivated</code> fires.
        </p>
        <div class="menu-demo-row">
          <nxr-menu
            (optionActivated)="onBasicActivated($event)"
            panelClass="demo-menu-pane"
            #basicMenu="nxrMenu"
          >
            <button class="menu-trigger" nxrMenuTrigger aria-label="File actions">
              <app-icon name="menu" [size]="16" class="menu-trigger-icon" />
              <span class="menu-trigger-label">Actions</span>
              <app-icon name="chevron-down" [size]="14" class="menu-trigger-chevron" />
            </button>
            <ng-template nxrMenuPanel>
              @for (action of basicActions; track action.id) {
                <button class="menu-option" [nxrMenuItem]="action">
                  @if (action.icon) {
                    <app-icon [name]="action.icon" [size]="14" class="menu-option-icon" />
                  }
                  {{ action.label }}
                </button>
              }
            </ng-template>
          </nxr-menu>
          <span class="menu-meta">
            Last activated: {{ lastBasicActivated() ? (lastBasicActivated() | json) : '—' }}
          </span>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- 2. More button (three dots)                                         -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <section class="page-section sub-section">
        <h2 class="page-section-title">More Button (Three Dots)</h2>
        <p class="page-section-desc">
          Icon-only trigger with vertical three dots (kebab). Common for row/card actions.
        </p>
        <div class="menu-demo-row">
          <nxr-menu
            (optionActivated)="onMoreButtonActivated($event)"
            panelClass="demo-menu-pane"
            scrollStrategy="reposition"
          >
            <button
              class="menu-trigger menu-trigger--icon-only"
              nxrMenuTrigger
              aria-label="More actions"
            >
              <app-icon name="more-vertical" [size]="18" class="menu-trigger-icon" />
            </button>
            <ng-template nxrMenuPanel>
              <button class="menu-option" [nxrMenuItem]="moreEdit">
                <app-icon name="edit" [size]="14" class="menu-option-icon" />
                Edit
              </button>
              <button class="menu-option" [nxrMenuItem]="moreCopy">
                <app-icon name="copy" [size]="14" class="menu-option-icon" />
                Copy
              </button>
              <button class="menu-option" [nxrMenuItem]="moreDuplicate">
                <app-icon name="plus" [size]="14" class="menu-option-icon" />
                Duplicate
              </button>
              <div class="menu-separator" nxrMenuSeparator></div>
              <button class="menu-option" [nxrMenuItem]="moreDelete">
                <app-icon name="trash" [size]="14" class="menu-option-icon" />
                Delete
              </button>
            </ng-template>
          </nxr-menu>
          <span class="menu-meta"> Last action: {{ lastMoreButtonActivated() ?? '—' }} </span>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- 3. Without arrow                                                    -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <section class="page-section sub-section">
        <h2 class="page-section-title">Without Arrow</h2>
        <p class="page-section-desc">
          Set <code>displayArrow="false"</code> to hide the arrow (default is <code>true</code>).
        </p>
        <div class="menu-demo-row">
          <nxr-menu
            [displayArrow]="false"
            (optionActivated)="onBasicActivated($event)"
            panelClass="demo-menu-pane"
          >
            <button class="menu-trigger" nxrMenuTrigger aria-label="No arrow">
              <span class="menu-trigger-label">No arrow</span>
              <app-icon name="chevron-down" [size]="14" class="menu-trigger-chevron" />
            </button>
            <ng-template nxrMenuPanel>
              <button class="menu-option" [nxrMenuItem]="basicActions[0]">Item A</button>
              <button class="menu-option" [nxrMenuItem]="basicActions[1]">Item B</button>
            </ng-template>
          </nxr-menu>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- 4. Scroll strategies (in scrollable area)                           -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <section class="page-section sub-section">
        <h2 class="page-section-title">Scroll Strategies</h2>
        <p class="page-section-desc">
          Inside a scrollable area: <strong>noop</strong> — panel sticks to trigger;
          <strong>reposition</strong> — panel repositions to stay in viewport;
          <strong>close</strong> — panel closes on scroll. Open each and scroll the box to compare.
        </p>
        <div class="scroll-strategy-demo">
          <div class="scroll-strategy-scrollbox">
            <div class="scroll-strategy-spacer"></div>
            <div class="scroll-strategy-row">
              <nxr-menu
                (optionActivated)="onBasicActivated($event)"
                panelClass="demo-menu-pane"
                scrollStrategy="noop"
              >
                <button class="menu-trigger" nxrMenuTrigger aria-label="noop">noop</button>
                <ng-template nxrMenuPanel>
                  @for (action of basicActions; track action.id) {
                    <button class="menu-option" [nxrMenuItem]="action">{{ action.label }}</button>
                  }
                </ng-template>
              </nxr-menu>
              <nxr-menu
                (optionActivated)="onBasicActivated($event)"
                panelClass="demo-menu-pane"
                scrollStrategy="reposition"
              >
                <button class="menu-trigger" nxrMenuTrigger aria-label="reposition">
                  reposition
                </button>
                <ng-template nxrMenuPanel>
                  @for (action of basicActions; track action.id) {
                    <button class="menu-option" [nxrMenuItem]="action">{{ action.label }}</button>
                  }
                </ng-template>
              </nxr-menu>
              <nxr-menu
                (optionActivated)="onBasicActivated($event)"
                panelClass="demo-menu-pane"
                scrollStrategy="close"
              >
                <button class="menu-trigger" nxrMenuTrigger aria-label="close">close</button>
                <ng-template nxrMenuPanel>
                  @for (action of basicActions; track action.id) {
                    <button class="menu-option" [nxrMenuItem]="action">{{ action.label }}</button>
                  }
                </ng-template>
              </nxr-menu>
            </div>
            <div class="scroll-strategy-spacer"></div>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- 5. Offset                                                            -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <section class="page-section sub-section">
        <h2 class="page-section-title">Offset</h2>
        <p class="page-section-desc">
          <code>offset</code> sets the gap (px) between trigger and panel. Default is 4.
        </p>
        <div class="menu-demo-row">
          <nxr-menu
            [offset]="12"
            (optionActivated)="onBasicActivated($event)"
            panelClass="demo-menu-pane"
          >
            <button class="menu-trigger" nxrMenuTrigger aria-label="Larger gap">
              <span class="menu-trigger-label">Larger gap (12px)</span>
              <app-icon name="chevron-down" [size]="14" class="menu-trigger-chevron" />
            </button>
            <ng-template nxrMenuPanel>
              <button class="menu-option" [nxrMenuItem]="basicActions[0]">Item A</button>
              <button class="menu-option" [nxrMenuItem]="basicActions[1]">Item B</button>
            </ng-template>
          </nxr-menu>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- 6. Menu with groups and separators                                   -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <section class="page-section sub-section">
        <h2 class="page-section-title">Groups and Separators</h2>
        <p class="page-section-desc">
          Use <code>nxrMenuGroup</code>, <code>nxrMenuGroupLabel</code>, and
          <code>nxrMenuSeparator</code> for grouped actions (Edit / History).
        </p>
        <div class="menu-demo-row">
          <nxr-menu
            (optionActivated)="onGroupedActivated($event)"
            panelClass="demo-menu-pane"
            scrollStrategy="reposition"
            [maintainInViewport]="false"
            #groupedMenu="nxrMenu"
          >
            <button class="menu-trigger" nxrMenuTrigger aria-label="Edit menu">
              <span class="menu-trigger-label">Edit</span>
              <app-icon name="chevron-down" [size]="14" class="menu-trigger-chevron" />
            </button>
            <ng-template nxrMenuPanel>
              @for (g of actionGroups(); track g.label; let last = $last) {
                <div nxrMenuGroup>
                  <span class="menu-group-label" nxrMenuGroupLabel>{{ g.label }}</span>
                  @for (action of g.actions; track action.id) {
                    <button class="menu-option" [nxrMenuItem]="action">{{ action.label }}</button>
                  }
                </div>
                @if (!last) {
                  <div class="menu-separator" nxrMenuSeparator></div>
                }
              }
            </ng-template>
          </nxr-menu>
          <span class="menu-meta">
            Last activated: {{ lastGroupedActivated() ? lastGroupedActivated()!.label : '—' }}
          </span>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- 7. Disabled menu                                                    -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <section class="page-section sub-section">
        <h2 class="page-section-title">Disabled Menu</h2>
        <p class="page-section-desc">
          Set <code>[disabled]="true"</code> to prevent opening. Toggle below to try.
        </p>
        <div class="menu-demo-row">
          <nxr-menu
            [disabled]="menuDisabled()"
            (optionActivated)="onDisabledDemoActivated($event)"
            panelClass="demo-menu-pane"
          >
            <button class="menu-trigger" nxrMenuTrigger aria-label="Disabled demo">
              <span class="menu-trigger-label">Disabled demo</span>
              <app-icon name="chevron-down" [size]="14" class="menu-trigger-chevron" />
            </button>
            <ng-template nxrMenuPanel>
              <button class="menu-option" [nxrMenuItem]="disabledDemoItem">
                {{ disabledDemoItem.label }}
              </button>
            </ng-template>
          </nxr-menu>
          <label class="menu-toggle-label">
            <input
              type="checkbox"
              [checked]="menuDisabled()"
              (change)="menuDisabled.set(!menuDisabled())"
            />
            Disable menu
          </label>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- 8. Custom placement                                                 -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <section class="page-section sub-section">
        <h2 class="page-section-title">Custom Placement</h2>
        <p class="page-section-desc">
          Use <code>placement="top-end"</code> (or other placements). Menu preset still uses full
          12-position fallbacks when space is limited.
        </p>
        <div class="menu-demo-row menu-demo-row--placement">
          <nxr-menu
            placement="top-end"
            (optionActivated)="onPlacementActivated($event)"
            panelClass="demo-menu-pane"
          >
            <button class="menu-trigger" nxrMenuTrigger aria-label="Placement demo">
              <span class="menu-trigger-label">Open above (top-end)</span>
              <app-icon name="chevron-down" [size]="14" class="menu-trigger-chevron" />
            </button>
            <ng-template nxrMenuPanel>
              @for (action of basicActions; track action.id) {
                <button class="menu-option" [nxrMenuItem]="action">{{ action.label }}</button>
              }
            </ng-template>
          </nxr-menu>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- 9. Programmatic open / close                                        -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <section class="page-section sub-section">
        <h2 class="page-section-title">Programmatic Open / Close</h2>
        <p class="page-section-desc">
          Use a template ref (<code>#progMenu="nxrMenu"</code>) to call
          <code>open()</code>, <code>close()</code>, <code>toggle()</code>,
          <code>focusTrigger()</code>, <code>disable()</code>, and <code>enable()</code> (API
          disable is separate from <code>[disabled]</code>; <code>disable()</code> closes the panel
          first if it is open, same as select/combobox).
        </p>
        <div class="menu-demo-row">
          <nxr-menu
            (optionActivated)="onProgActivated($event)"
            panelClass="demo-menu-pane"
            #progMenu="nxrMenu"
          >
            <button class="menu-trigger" nxrMenuTrigger aria-label="Programmatic control">
              <span class="menu-trigger-label">
                {{ progMenu.isOpen() ? 'Open' : 'Closed' }}
              </span>
              <app-icon name="chevron-down" [size]="14" class="menu-trigger-chevron" />
            </button>
            <ng-template nxrMenuPanel>
              @for (action of basicActions; track action.id) {
                <button class="menu-option" [nxrMenuItem]="action">{{ action.label }}</button>
              }
            </ng-template>
          </nxr-menu>
          <div class="menu-button-group">
            <button class="btn btn-sm" (click)="progMenu.open()">Open</button>
            <button class="btn btn-sm" (click)="progMenu.close()">Close</button>
            <button class="btn btn-sm" (click)="progMenu.toggle()">Toggle</button>
            <button class="btn btn-sm" (click)="progMenu.focusTrigger()">Focus trigger</button>
            <button class="btn btn-sm" (click)="progMenu.disable()">Disable</button>
            <button class="btn btn-sm" (click)="progMenu.enable()">Enable</button>
          </div>
          <div class="menu-lifecycle-log">
            <span class="menu-meta">Last activated: {{ lastProgActivated() ?? '—' }}</span>
            <span class="menu-meta">Disabled (API): {{ progMenu.isDisabled() }}</span>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- 10. Lifecycle (opened / closed)                                      -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <section class="page-section sub-section">
        <h2 class="page-section-title">Lifecycle (opened / closed)</h2>
        <p class="page-section-desc">
          Subscribe to <code>opened</code> and <code>closed</code>. The closed payload is
          <code>CloseReason</code> (e.g. escape, outside click, or after item activation).
        </p>
        <div class="menu-demo-row">
          <nxr-menu
            (optionActivated)="onLifecycleActivated($event)"
            (opened)="onLifecycleOpened()"
            (closed)="onLifecycleClosed($event)"
            panelClass="demo-menu-pane"
          >
            <button class="menu-trigger" nxrMenuTrigger aria-label="Lifecycle demo">
              <span class="menu-trigger-label">Lifecycle</span>
              <app-icon name="chevron-down" [size]="14" class="menu-trigger-chevron" />
            </button>
            <ng-template nxrMenuPanel>
              @for (action of basicActions; track action.id) {
                <button class="menu-option" [nxrMenuItem]="action">{{ action.label }}</button>
              }
            </ng-template>
          </nxr-menu>
          <div class="menu-lifecycle-log">
            <span class="menu-meta">Open count: {{ lifecycleOpenCount() }}</span>
            <span class="menu-meta">Last close reason: {{ lastCloseReason() ?? '—' }}</span>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- 11. Viewport boundaries                                             -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <section class="page-section sub-section">
        <h2 class="page-section-title">Viewport boundaries</h2>
        <p class="page-section-desc">
          <code>boundaries</code> applies viewport insets (px) when the overlay computes max panel
          size—same as select/combobox. Here top/bottom insets leave virtual margin above and below
          the usable viewport.
        </p>
        <div class="menu-demo-row">
          <nxr-menu
            [boundaries]="menuBoundariesDemo"
            (optionActivated)="onBasicActivated($event)"
            panelClass="demo-menu-pane"
            scrollStrategy="reposition"
          >
            <button class="menu-trigger" nxrMenuTrigger aria-label="Boundaries demo">
              <span class="menu-trigger-label">Boundaries (top/bottom)</span>
              <app-icon name="chevron-down" [size]="14" class="menu-trigger-chevron" />
            </button>
            <ng-template nxrMenuPanel>
              @for (action of basicActions; track action.id) {
                <button class="menu-option" [nxrMenuItem]="action">{{ action.label }}</button>
              }
            </ng-template>
          </nxr-menu>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- 12. Primitive options (no object)                                     -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <section class="page-section sub-section">
        <h2 class="page-section-title">Primitive Options</h2>
        <p class="page-section-desc">
          Menu items can be primitives (e.g. strings). Pass the value to
          <code>[nxrMenuItem]</code>; <code>optionActivated</code> emits that value.
        </p>
        <div class="menu-demo-row">
          <nxr-menu (optionActivated)="onPrimitiveActivated($event)" panelClass="demo-menu-pane">
            <button class="menu-trigger" nxrMenuTrigger aria-label="Pick a color">
              <span class="menu-trigger-label">Pick a color</span>
              <app-icon name="chevron-down" [size]="14" class="menu-trigger-chevron" />
            </button>
            <ng-template nxrMenuPanel>
              @for (color of primitiveColors; track color) {
                <button class="menu-option" [nxrMenuItem]="color">
                  <span class="menu-color-dot" [style.background]="color"></span>
                  {{ color }}
                </button>
              }
            </ng-template>
          </nxr-menu>
          <span class="menu-meta"> Last activated: {{ lastPrimitiveActivated() ?? '—' }} </span>
        </div>
      </section>
    </div>
  `,
  styles: [
    `
      /* ─── Trigger ────────────────────────────────────────────────── */
      .menu-trigger {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        min-width: 160px;
        padding: 0.5rem 0.75rem;
        font-size: 0.875rem;
        font-family: inherit;
        line-height: 1.4;
        border: 1px solid var(--nxr-border);
        border-radius: var(--nxr-radius);
        background: var(--nxr-bg-elevated);
        color: var(--nxr-text);
        cursor: pointer;
        transition:
          border-color var(--nxr-duration-fast) ease,
          box-shadow var(--nxr-duration-fast) ease;
        text-align: left;
      }
      .menu-trigger:hover {
        border-color: var(--nxr-primary-subtle);
      }
      .menu-trigger:focus-visible {
        outline: 2px solid var(--nxr-primary);
        outline-offset: 2px;
      }
      .menu-trigger[aria-expanded='true'] {
        border-color: var(--nxr-primary);
        box-shadow: 0 0 0 3px var(--nxr-primary-subtle);
      }
      .menu-trigger[aria-disabled='true'] {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .menu-trigger--icon-only {
        min-width: unset;
        padding: 0.375rem;
        justify-content: center;
      }
      .menu-trigger--icon-only .menu-trigger-icon {
        margin: 0;
      }
      .menu-trigger-label {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .menu-trigger-icon,
      .menu-trigger-chevron {
        flex-shrink: 0;
        color: var(--nxr-text-muted);
      }
      .menu-trigger[aria-expanded='true'] .menu-trigger-chevron {
        transform: rotate(180deg);
      }

      /* ─── Panel ───────────────────────────────────────────────────── */
      .nxr-menu-panel-host > [role='menu'] {
        padding: 0.25rem 0;
        // min-width: 180px;
      }

      /* ─── Options ─────────────────────────────────────────────────── */
      .menu-option {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        width: 100%;
        padding: 0.5rem 0.75rem;
        font-size: 0.875rem;
        font-family: inherit;
        border: none;
        background: transparent;
        color: var(--nxr-text);
        cursor: pointer;
        text-align: left;
        transition: background 0.1s;
      }
      .menu-option:hover {
        background: var(--nxr-bg-subtle);
      }
      .menu-option[data-active] {
        background: var(--nxr-primary-subtle);
        color: var(--nxr-primary);
      }
      .menu-option-icon {
        flex-shrink: 0;
        color: var(--nxr-text-muted);
      }
      .menu-option[data-active] .menu-option-icon {
        color: var(--nxr-primary);
      }

      /* ─── Group label / Separator ─────────────────────────────────── */
      .menu-group-label {
        display: block;
        padding: 0.5rem 0.75rem 0.25rem;
        font-size: 0.6875rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--nxr-text-faint);
      }
      .menu-separator {
        height: 1px;
        margin: 0.25rem 0.75rem;
        background: var(--nxr-border-subtle);
      }

      /* ─── Demo row / meta ─────────────────────────────────────────── */
      .menu-demo-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.75rem;
      }
      .scroll-strategy-demo {
        margin-top: 0.5rem;
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
      .menu-demo-row--placement {
        min-height: 200px;
        align-items: flex-end;
      }
      .menu-meta {
        font-size: 0.8125rem;
        color: var(--nxr-text-muted);
      }
      .menu-toggle-label {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        font-size: 0.8125rem;
        color: var(--nxr-text-muted);
        cursor: pointer;
      }
      .menu-button-group {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }
      .menu-lifecycle-log {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
      .menu-color-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        flex-shrink: 0;
      }
    `,
  ],
})
export class MenuPageComponent {
  readonly basicActions = BASIC_ACTIONS;
  /** Demo insets for overlay max-size math (see menu `boundaries` input). */
  readonly menuBoundariesDemo: ViewportBoundaries = { top: 72, bottom: 72 };
  readonly actionGroups = signal(getGroups());
  readonly primitiveColors = ['Red', 'Green', 'Blue', 'Orange', 'Purple'];

  readonly lastBasicActivated = signal<ActionItem | null>(null);
  readonly lastGroupedActivated = signal<GroupedAction | null>(null);
  readonly lastProgActivated = signal<string | null>(null);
  readonly lastPrimitiveActivated = signal<string | null>(null);

  readonly menuDisabled = signal(false);
  readonly disabledDemoItem = { id: 'demo', label: 'Single option' };

  readonly moreEdit = { id: 'edit', label: 'Edit' };
  readonly moreCopy = { id: 'copy', label: 'Copy' };
  readonly moreDuplicate = { id: 'duplicate', label: 'Duplicate' };
  readonly moreDelete = { id: 'delete', label: 'Delete' };
  readonly lastMoreButtonActivated = signal<string | null>(null);

  readonly lifecycleOpenCount = signal(0);
  readonly lastCloseReason = signal<CloseReason | undefined>(undefined);

  onBasicActivated(event: MenuOptionActivatedEvent<unknown>): void {
    this.lastBasicActivated.set(event.option as ActionItem);
  }

  onMoreButtonActivated(event: MenuOptionActivatedEvent<unknown>): void {
    const opt = event.option as { id: string; label: string };
    this.lastMoreButtonActivated.set(opt.label);
  }

  onGroupedActivated(event: MenuOptionActivatedEvent<unknown>): void {
    this.lastGroupedActivated.set(event.option as GroupedAction);
  }

  onDisabledDemoActivated(event: MenuOptionActivatedEvent<unknown>): void {
    void event;
    // No-op; menu may be disabled so this might not fire when toggling
  }

  onPlacementActivated(event: MenuOptionActivatedEvent<unknown>): void {
    this.lastBasicActivated.set(event.option as ActionItem);
  }

  onProgActivated(event: MenuOptionActivatedEvent<unknown>): void {
    this.lastProgActivated.set((event.option as ActionItem).id);
  }

  onLifecycleActivated(event: MenuOptionActivatedEvent<unknown>): void {
    this.lastBasicActivated.set(event.option as ActionItem);
  }

  onLifecycleOpened(): void {
    this.lifecycleOpenCount.update((c) => c + 1);
  }

  onLifecycleClosed(reason: CloseReason | undefined): void {
    this.lastCloseReason.set(reason);
  }

  onPrimitiveActivated(event: MenuOptionActivatedEvent<unknown>): void {
    this.lastPrimitiveActivated.set(event.option as string);
  }
}

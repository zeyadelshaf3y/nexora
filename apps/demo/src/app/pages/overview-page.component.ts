import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  ViewChild,
  ViewEncapsulation,
  type TemplateRef,
} from '@angular/core';
import { FocusTrapDirective } from '@nexora-ui/interactions';
import { ListboxDirective, ListboxOptionDirective } from '@nexora-ui/listbox';
import {
  CloseDialogDirective,
  CloseDrawerDirective,
  DialogService,
  DrawerService,
  OverlayArrowDirective,
  type DrawerPlacement,
  type OverlayRef,
} from '@nexora-ui/overlay';
import { PopoverTriggerDirective } from '@nexora-ui/popover';
import { SnackbarService, type SnackbarPlacement } from '@nexora-ui/snackbar';
import { TooltipTriggerDirective } from '@nexora-ui/tooltip';

import { bindClearOverlayOnClose } from '../core/bind-clear-overlay-on-close';
import { IconComponent } from '../core/icons';
import { DemoDialogComponent } from '../demo-dialog.component';
import { NestedDrawerContentComponent } from '../nested-drawer-content.component';
import { NestedPopoverContentComponent } from '../nested-popover-content.component';

interface MenuAction {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-overview-page',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FocusTrapDirective,
    CloseDialogDirective,
    CloseDrawerDirective,
    OverlayArrowDirective,
    PopoverTriggerDirective,
    TooltipTriggerDirective,
    ListboxDirective,
    ListboxOptionDirective,
    IconComponent,
  ],
  template: `
    <div class="overview-grid">
      <!-- Card 1: Nested Overlays -->
      <div class="overview-card">
        <div class="overview-card-header">
          <app-icon name="layers" [size]="20" />
          <h3 class="overview-card-title">Nested Overlays</h3>
        </div>
        <p class="overview-card-desc">
          Open a dialog with tooltip, popover, snackbar, and drawer — all nested.
        </p>
        <div class="overview-card-actions">
          <button class="btn btn-primary btn-sm" (click)="openNestedDialog($event)">
            Open dialog
          </button>
        </div>
      </div>

      <!-- Card 2: Popover + Listbox -->
      <div class="overview-card">
        <div class="overview-card-header">
          <app-icon name="list" [size]="20" />
          <h3 class="overview-card-title">Popover + Listbox</h3>
        </div>
        <p class="overview-card-desc">
          Dropdown-like button with a popover containing a listbox for quick actions.
        </p>
        <div class="overview-card-actions">
          <button
            class="btn btn-sm"
            [nxrPopover]="quickActionsTpl"
            nxrPopoverPlacement="bottom-start"
            nxrPopoverPanelClass="demo-popover-pane"
            [nxrPopoverCloseAnimationDurationMs]="150"
          >
            <app-icon name="menu" [size]="14" />
            Quick Actions
          </button>
          <span class="overview-card-meta">{{ lastAction() ?? '—' }}</span>
        </div>
      </div>

      <!-- Card 3: Tooltip Gallery -->
      <div class="overview-card">
        <div class="overview-card-header">
          <app-icon name="message-square" [size]="20" />
          <h3 class="overview-card-title">Tooltip Gallery</h3>
        </div>
        <p class="overview-card-desc">Multiple buttons with different tooltip placements.</p>
        <div class="overview-card-actions">
          <button
            class="btn btn-sm"
            nxrTooltip="Top tooltip"
            nxrTooltipPlacement="top"
            nxrTooltipPanelClass="demo-tooltip-pane"
          >
            Top
          </button>
          <button
            class="btn btn-sm"
            nxrTooltip="Bottom tooltip"
            nxrTooltipPlacement="bottom"
            nxrTooltipPanelClass="demo-tooltip-pane"
          >
            Bottom
          </button>
          <button
            class="btn btn-sm"
            nxrTooltip="Start tooltip"
            nxrTooltipPlacement="start"
            nxrTooltipPanelClass="demo-tooltip-pane"
          >
            Start
          </button>
          <button
            class="btn btn-sm"
            nxrTooltip="End tooltip"
            nxrTooltipPlacement="end"
            nxrTooltipPanelClass="demo-tooltip-pane"
          >
            End
          </button>
        </div>
      </div>

      <!-- Card 4: Snackbar Variants -->
      <div class="overview-card">
        <div class="overview-card-header">
          <app-icon name="bell" [size]="20" />
          <h3 class="overview-card-title">Snackbar Variants</h3>
        </div>
        <p class="overview-card-desc">Fire success, error, info, or warning snackbars.</p>
        <div class="overview-card-actions">
          @for (v of snackbarVariants; track v.id) {
            <button
              class="btn btn-sm"
              [style.border-left]="'3px solid var(--nxr-' + v.id + ')'"
              (click)="openVariantSnackbar(v)"
            >
              {{ v.label }}
            </button>
          }
        </div>
      </div>

      <!-- Card 5: Drawer Navigation -->
      <div class="overview-card">
        <div class="overview-card-header">
          <app-icon name="panel-right" [size]="20" />
          <h3 class="overview-card-title">Drawer Navigation</h3>
        </div>
        <p class="overview-card-desc">Open drawers from each edge.</p>
        <div class="overview-card-actions">
          @for (p of drawerPlacements; track p) {
            <button class="btn btn-sm" (click)="openDrawer(p)">{{ p }}</button>
          }
        </div>
      </div>

      <!-- Card 6: Dialog Variants -->
      <div class="overview-card">
        <div class="overview-card-header">
          <app-icon name="box" [size]="20" />
          <h3 class="overview-card-title">Dialog Variants</h3>
        </div>
        <p class="overview-card-desc">Template dialog and component dialog side by side.</p>
        <div class="overview-card-actions">
          <button class="btn btn-sm btn-primary" (click)="openTemplateDialog($event)">
            Template
          </button>
          <button class="btn btn-sm" (click)="openComponentDialog($event)">Component</button>
        </div>
      </div>
    </div>

    <!-- ═══ Templates ═══ -->

    <!-- Nested Overlays Dialog -->
    <ng-template #nestedDialogTpl>
      <div class="tpl-dialog" nxrFocusTrap>
        <h2>Nested Overlays</h2>
        <p>This dialog demonstrates multiple overlay types working together.</p>
        <div
          style="margin-top: 1rem; padding: 1rem; background: var(--nxr-bg-subtle); border-radius: var(--nxr-radius); border: 1px solid var(--nxr-border);"
        >
          <h3 style="margin: 0 0 0.5rem; font-size: 0.9375rem; font-weight: 600;">
            Try these overlays
          </h3>
          <p style="margin: 0 0 0.75rem; font-size: 0.8125rem; color: var(--nxr-text-muted);">
            <span
              nxrTooltip="Tooltip from inside dialog"
              nxrTooltipPlacement="top"
              nxrTooltipPanelClass="demo-tooltip-pane"
              style="cursor: help; text-decoration: underline dotted; text-underline-offset: 2px;"
              >Hover for tooltip</span
            >, or try:
          </p>
          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
            <button
              class="btn btn-sm"
              [nxrPopover]="nestedPopoverContent"
              nxrPopoverPlacement="bottom"
              nxrPopoverPanelClass="demo-popover-pane"
              [nxrPopoverCloseAnimationDurationMs]="150"
            >
              Nested popover
            </button>
            <button class="btn btn-sm" (click)="fireSnackbar('bottom-end')">Fire snackbar</button>
            <button class="btn btn-sm" (click)="openNestedDrawer('end')">Open drawer</button>
          </div>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem;">
          <button class="btn btn-ghost" nxrDialogClose>Cancel</button>
          <button class="btn btn-primary" nxrDialogClose>Done</button>
        </div>
      </div>
    </ng-template>

    <!-- Template Dialog -->
    <ng-template #templateDialogTpl>
      <div class="tpl-dialog" nxrFocusTrap>
        <h2>Template Dialog</h2>
        <p>Opened from a TemplateRef with focus trapping, Escape close, and backdrop click.</p>
        <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem;">
          <button class="btn btn-ghost" nxrDialogClose>Cancel</button>
          <button class="btn btn-primary" nxrDialogClose>Done</button>
        </div>
      </div>
    </ng-template>

    <!-- Drawer -->
    <ng-template #drawerTpl>
      <div class="tpl-drawer" nxrFocusTrap>
        <h2>Drawer Panel</h2>
        <p>Slide-out panel. Close with Escape, backdrop, or the button.</p>
        <nav class="drawer-nav">
          <a class="drawer-nav-item" href="#">Dashboard</a>
          <a class="drawer-nav-item" href="#">Settings</a>
          <a class="drawer-nav-item" href="#">Profile</a>
        </nav>
        <div class="tpl-drawer-footer">
          <button class="btn btn-ghost" nxrDrawerClose>Close</button>
        </div>
      </div>
    </ng-template>

    <!-- Quick Actions Popover Listbox -->
    <ng-template #quickActionsTpl>
      <div nxrOverlayArrow class="demo-arrow"></div>
      <div
        class="overview-action-menu"
        nxrListbox
        nxrListboxMode="action"
        nxrListboxRole="menu"
        [nxrListboxAccessors]="actionAccessors"
        (nxrListboxOptionActivated)="onAction($event)"
      >
        @for (action of quickActions; track action.id) {
          <div class="overview-action-item" [nxrListboxOption]="action">
            <app-icon [name]="action.icon" [size]="16" />
            {{ action.label }}
          </div>
        }
      </div>
    </ng-template>
  `,
  styles: [
    `
      .overview-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 1.25rem;
      }
      .overview-card {
        background: var(--nxr-bg-elevated);
        border: 1px solid var(--nxr-border);
        border-radius: var(--nxr-radius-lg);
        padding: 1.25rem;
        transition:
          box-shadow var(--nxr-duration) var(--nxr-ease),
          transform var(--nxr-duration) var(--nxr-ease);
      }
      .overview-card:hover {
        box-shadow: var(--nxr-shadow-md);
        transform: translateY(-2px);
      }
      .overview-card-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
        color: var(--nxr-primary);
      }
      .overview-card-title {
        margin: 0;
        font-size: 1rem;
        font-weight: 700;
        color: var(--nxr-text);
      }
      .overview-card-desc {
        margin: 0 0 1rem;
        font-size: 0.8125rem;
        color: var(--nxr-text-muted);
        line-height: 1.5;
      }
      .overview-card-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        align-items: center;
      }
      .overview-card-meta {
        font-size: 0.75rem;
        color: var(--nxr-text-faint);
      }
      .overview-action-menu {
        min-width: 180px;
        padding: 0.25rem 0;
        outline: none;
      }
      .overview-action-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
        font-size: 0.875rem;
        cursor: default;
        transition: background 0.1s;
      }
      .overview-action-item[data-active] {
        background: var(--nxr-primary-subtle);
      }
    `,
  ],
})
export class OverviewPageComponent {
  @ViewChild('nestedDialogTpl') nestedDialogTpl!: TemplateRef<unknown>;
  @ViewChild('templateDialogTpl') templateDialogTpl!: TemplateRef<unknown>;
  @ViewChild('drawerTpl') drawerTpl!: TemplateRef<unknown>;
  readonly nestedPopoverContent = NestedPopoverContentComponent;

  private readonly dialogSvc = inject(DialogService);
  private readonly drawerSvc = inject(DrawerService);
  private readonly snackbarSvc = inject(SnackbarService);

  private nestedDialogRef: OverlayRef | null = null;
  private templateDialogRef: OverlayRef | null = null;
  private componentDialogRef: OverlayRef | null = null;
  private drawerRef: OverlayRef | null = null;
  private nestedDrawerRef: OverlayRef | null = null;

  readonly lastAction = signal<string | null>(null);

  readonly drawerPlacements: DrawerPlacement[] = ['start', 'end', 'top', 'bottom'];

  readonly snackbarVariants = [
    {
      id: 'success',
      label: 'Success',
      message: 'Changes saved successfully.',
    },
    { id: 'error', label: 'Error', message: 'Something went wrong.' },
    { id: 'info', label: 'Info', message: 'Session expires in 5 min.' },
    { id: 'warning', label: 'Warning', message: 'This cannot be undone.' },
  ] as const;

  readonly quickActions: MenuAction[] = [
    { id: 'create', label: 'Create', icon: 'plus' },
    { id: 'edit', label: 'Edit', icon: 'edit' },
    { id: 'duplicate', label: 'Duplicate', icon: 'copy' },
    { id: 'delete', label: 'Delete', icon: 'trash' },
  ];

  readonly actionAccessors = {
    value: (a: MenuAction) => a.id,
    label: (a: MenuAction) => a.label,
  };

  private triggerFromEvent(event?: MouseEvent): HTMLElement | undefined {
    return event?.currentTarget instanceof HTMLElement ? event.currentTarget : undefined;
  }

  async openNestedDialog(event?: MouseEvent): Promise<void> {
    if (this.nestedDialogRef) return;
    const trigger = this.triggerFromEvent(event);
    this.nestedDialogRef = await this.dialogSvc.open(this.nestedDialogTpl, {
      maxWidth: 'min(560px, 90vw)',
      panelClass: 'demo-dialog-pane',
      ...(trigger && { transformOriginElement: trigger }),
    });
    bindClearOverlayOnClose(
      this.nestedDialogRef,
      () => this.nestedDialogRef,
      (v) => (this.nestedDialogRef = v),
    );
  }

  async openTemplateDialog(event?: MouseEvent): Promise<void> {
    if (this.templateDialogRef) return;
    const trigger = this.triggerFromEvent(event);
    this.templateDialogRef = await this.dialogSvc.open(this.templateDialogTpl, {
      maxWidth: 'min(560px, 90vw)',
      panelClass: 'demo-dialog-pane',
      ...(trigger && { transformOriginElement: trigger }),
    });
    bindClearOverlayOnClose(
      this.templateDialogRef,
      () => this.templateDialogRef,
      (v) => (this.templateDialogRef = v),
    );
  }

  async openComponentDialog(event?: MouseEvent): Promise<void> {
    if (this.componentDialogRef) return;
    const trigger = this.triggerFromEvent(event);
    this.componentDialogRef = await this.dialogSvc.open(DemoDialogComponent, {
      maxWidth: 'min(480px, 90vw)',
      panelClass: 'demo-dialog-pane',
      ...(trigger && { transformOriginElement: trigger }),
      inputs: { title: 'Overview Dialog', theme: 'indigo', name: 'overview' },
    });
    bindClearOverlayOnClose(
      this.componentDialogRef,
      () => this.componentDialogRef,
      (v) => (this.componentDialogRef = v),
    );
  }

  async openDrawer(placement: DrawerPlacement): Promise<void> {
    if (this.drawerRef) return;
    this.drawerRef = await this.drawerSvc.open(this.drawerTpl, {
      placement,
      hasBackdrop: true,
      panelClass: 'demo-drawer-pane',
      ...(placement === 'start' || placement === 'end'
        ? { minWidth: '280px', maxWidth: 'min(400px, 80vw)' }
        : { minHeight: '200px', maxHeight: '60vh' }),
    });
    bindClearOverlayOnClose(
      this.drawerRef,
      () => this.drawerRef,
      (v) => (this.drawerRef = v),
    );
  }

  async openNestedDrawer(placement: DrawerPlacement): Promise<void> {
    if (this.nestedDrawerRef) return;
    this.nestedDrawerRef = await this.drawerSvc.open(NestedDrawerContentComponent, {
      placement,
      panelClass: 'demo-drawer-pane',
      ...(placement === 'start' || placement === 'end'
        ? { minWidth: '260px', maxWidth: 'min(360px, 80vw)' }
        : { minHeight: '180px', maxHeight: '50vh' }),
    });
    bindClearOverlayOnClose(
      this.nestedDrawerRef,
      () => this.nestedDrawerRef,
      (v) => (this.nestedDrawerRef = v),
    );
  }

  fireSnackbar(placement: SnackbarPlacement): void {
    this.snackbarSvc.notify({
      placement,
      pauseOnHover: true,
      inputs: {
        variant: 'info',
        title: 'Overview event',
        message: 'Snackbar fired from overview',
        actionLabel: 'Dismiss',
      },
    });
  }

  openVariantSnackbar(v: { id: string; message: string }): void {
    this.snackbarSvc.notify({
      groupId: v.id,
      placement: 'bottom-end',
      pauseOnHover: true,
      inputs: {
        variant: v.id,
        title: 'Variant demo',
        message: v.message,
        actionLabel: 'Dismiss',
      },
    });
  }

  onAction(event: { option: MenuAction }): void {
    this.lastAction.set(event.option.label);
  }
}

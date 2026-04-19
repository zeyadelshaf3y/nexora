import {
  ChangeDetectionStrategy,
  Component,
  inject,
  ViewChild,
  ViewEncapsulation,
  type TemplateRef,
} from '@angular/core';
import { FocusTrapDirective } from '@nexora-ui/interactions';
import { ListboxDirective, ListboxOptionDirective } from '@nexora-ui/listbox';
import {
  CloseDialogDirective,
  DialogService,
  DrawerService,
  OverlayArrowDirective,
  OverlayTriggerDirective,
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
  selector: 'app-dialog-page',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FocusTrapDirective,
    CloseDialogDirective,
    OverlayArrowDirective,
    OverlayTriggerDirective,
    PopoverTriggerDirective,
    TooltipTriggerDirective,
    ListboxDirective,
    ListboxOptionDirective,
    IconComponent,
  ],
  template: `
    <!-- Template Dialog -->
    <section class="page-section">
      <h2 class="page-section-title">Template Dialog</h2>
      <p class="page-section-desc">
        Opens from a TemplateRef with focus trap, Escape close, backdrop click, and
        scale-from-origin animation. Contains nested overlays: tooltip, popover, snackbar trigger,
        and drawer trigger.
      </p>
      <button class="btn btn-primary" (click)="openDialog($event)">Open template dialog</button>
    </section>

    <!-- Component Dialog -->
    <section class="page-section">
      <h2 class="page-section-title">Component Dialog</h2>
      <p class="page-section-desc">
        Opened via ComponentPortal with inputs passed through the service.
      </p>
      <button class="btn btn-primary" (click)="openComponentDialog($event)">
        Open component dialog
      </button>
    </section>

    <!-- Scrollable Dialog -->
    <section class="page-section">
      <h2 class="page-section-title">Scrollable Dialog</h2>
      <p class="page-section-desc">Fixed header/footer with a scrollable body. maxHeight 400px.</p>
      <button class="btn btn-primary" (click)="openScrollableDialog($event)">
        Open scrollable dialog
      </button>
    </section>

    <!-- Directive Dialog -->
    <section class="page-section">
      <h2 class="page-section-title">Directive Dialog</h2>
      <p class="page-section-desc">
        Opened via <code>[nxrOverlay]</code> directive — less boilerplate.
      </p>
      <button
        class="btn btn-primary"
        [nxrOverlay]="inlineDialogTpl"
        nxrOverlayType="dialog"
        nxrOverlayPanelClass="demo-dialog-pane"
        nxrOverlayMaxWidth="min(480px, 90vw)"
      >
        Open directive dialog
      </button>
    </section>

    <!-- Mixed Demo -->
    <section class="page-section">
      <h2 class="page-section-title">Mixed: Dialog with Everything</h2>
      <p class="page-section-desc">
        A dialog containing a popover with listbox, a tooltip, plus buttons that open a drawer and
        fire a snackbar.
      </p>
      <button class="btn btn-primary" (click)="openMixedDialog($event)">Open mixed dialog</button>
    </section>

    <!-- ═══ Templates ═══ -->

    <!-- Template Dialog -->
    <ng-template #dialogTpl>
      <div class="tpl-dialog" nxrFocusTrap>
        <h2>Template Dialog</h2>
        <p>Focus trapping, Escape to close, backdrop click. Scale-from-origin animation.</p>
        <div
          style="margin-top: 1rem; padding: 1rem; background: var(--nxr-bg-subtle); border-radius: var(--nxr-radius); border: 1px solid var(--nxr-border);"
        >
          <h3 style="margin: 0 0 0.5rem; font-size: 0.9375rem; font-weight: 600;">
            Nested overlays
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
            <button class="btn btn-sm" (click)="openSnackbar('bottom-end')">Fire snackbar</button>
            <button class="btn btn-sm" (click)="openNestedDrawer('end')">Open drawer</button>
          </div>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem;">
          <button class="btn btn-ghost" nxrDialogClose>Cancel</button>
          <button class="btn btn-primary" nxrDialogClose>Done</button>
        </div>
      </div>
    </ng-template>

    <!-- Scrollable Dialog -->
    <ng-template #scrollableDialogTpl>
      <div class="tpl-scrollable-dialog" nxrFocusTrap>
        <div class="tpl-scrollable-dialog-header">
          <h2>Scrollable Dialog</h2>
          <p>This dialog has <code>maxHeight: 400px</code> with fixed header and footer.</p>
        </div>
        <div class="tpl-scrollable-dialog-body">
          @for (i of scrollSections; track i) {
            <h3>Section {{ i }}</h3>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque habitant morbi
              tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor
              quam, feugiat vitae, ultricies eget, tempor sit amet, ante.
            </p>
          }
        </div>
        <div class="tpl-scrollable-dialog-footer">
          <button class="btn btn-ghost" nxrDialogClose>Cancel</button>
          <button class="btn btn-primary" nxrDialogClose>Done</button>
        </div>
      </div>
    </ng-template>

    <!-- Inline Directive Dialog -->
    <ng-template #inlineDialogTpl>
      <div class="tpl-dialog" nxrFocusTrap>
        <h2>Directive Dialog</h2>
        <p>Opened via <code>[nxrOverlay]</code> directive. Same behavior, less boilerplate.</p>
        <div class="tpl-dialog-actions">
          <button class="btn btn-primary" nxrDialogClose>Got it</button>
        </div>
      </div>
    </ng-template>

    <!-- Mixed Dialog -->
    <ng-template #mixedDialogTpl>
      <div class="tpl-dialog" nxrFocusTrap>
        <h2>Mixed Dialog</h2>
        <p>This dialog demonstrates multiple overlay types working together.</p>

        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 1rem 0;">
          <button
            class="btn btn-sm"
            [nxrPopover]="mixedPopoverMenuTpl"
            nxrPopoverPlacement="bottom-start"
            nxrPopoverPanelClass="demo-popover-pane"
            [nxrPopoverCloseAnimationDurationMs]="150"
          >
            <app-icon name="menu" [size]="14" />
            Popover + Listbox
          </button>

          <span
            nxrTooltip="Tooltip works inside dialog too"
            nxrTooltipPlacement="top"
            nxrTooltipPanelClass="demo-tooltip-pane"
            style="cursor: help; text-decoration: underline dotted; text-underline-offset: 2px; display: inline-flex; align-items: center; font-size: 0.875rem; color: var(--nxr-text-secondary);"
            >Hover for tooltip</span
          >

          <button class="btn btn-sm" (click)="openSnackbar('bottom-end')">
            <app-icon name="bell" [size]="14" />
            Fire snackbar
          </button>

          <button class="btn btn-sm" (click)="openNestedDrawer('end')">
            <app-icon name="panel-right" [size]="14" />
            Open drawer
          </button>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem;">
          <button class="btn btn-ghost" nxrDialogClose>Cancel</button>
          <button class="btn btn-primary" nxrDialogClose>Done</button>
        </div>
      </div>
    </ng-template>

    <!-- Popover menu for mixed dialog -->
    <ng-template #mixedPopoverMenuTpl>
      <div nxrOverlayArrow class="demo-arrow"></div>
      <div
        class="dialog-page-action-menu"
        nxrListbox
        nxrListboxMode="action"
        nxrListboxRole="menu"
        [nxrListboxAccessors]="menuAccessors"
        (nxrListboxOptionActivated)="onMenuAction($event)"
      >
        @for (action of menuActions; track action.id) {
          <div class="dialog-page-action-item" [nxrListboxOption]="action">
            <app-icon [name]="action.icon" [size]="16" />
            {{ action.label }}
          </div>
        }
      </div>
    </ng-template>
  `,
  styles: [
    `
      .dialog-page-action-menu {
        min-width: 180px;
        padding: 0.25rem 0;
        outline: none;
      }
      .dialog-page-action-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
        font-size: 0.875rem;
        cursor: default;
        transition: background 0.1s;
      }
      .dialog-page-action-item[data-active] {
        background: var(--nxr-primary-subtle);
      }
    `,
  ],
})
export class DialogPageComponent {
  @ViewChild('dialogTpl') dialogTpl!: TemplateRef<unknown>;
  @ViewChild('scrollableDialogTpl') scrollableDialogTpl!: TemplateRef<unknown>;
  @ViewChild('mixedDialogTpl') mixedDialogTpl!: TemplateRef<unknown>;
  readonly nestedPopoverContent = NestedPopoverContentComponent;

  private readonly dialogSvc = inject(DialogService);
  private readonly drawerSvc = inject(DrawerService);
  private readonly snackbarSvc = inject(SnackbarService);

  private dialogRef: OverlayRef | null = null;
  private componentDialogRef: OverlayRef | null = null;
  private scrollableDialogRef: OverlayRef | null = null;
  private mixedDialogRef: OverlayRef | null = null;
  private nestedDrawerRef: OverlayRef | null = null;

  readonly scrollSections = [1, 2, 3, 4, 5, 6, 7];

  readonly menuActions: MenuAction[] = [
    { id: 'settings', label: 'Settings', icon: 'settings' },
    { id: 'edit', label: 'Edit', icon: 'edit' },
    { id: 'duplicate', label: 'Duplicate', icon: 'copy' },
    { id: 'delete', label: 'Delete', icon: 'trash' },
  ];

  readonly menuAccessors = {
    value: (a: MenuAction) => a.id,
    label: (a: MenuAction) => a.label,
  };

  private triggerFromEvent(event?: MouseEvent): HTMLElement | undefined {
    return event?.currentTarget instanceof HTMLElement ? event.currentTarget : undefined;
  }

  async openDialog(event?: MouseEvent): Promise<void> {
    if (this.dialogRef) return;
    const trigger = this.triggerFromEvent(event);
    this.dialogRef = await this.dialogSvc.open(this.dialogTpl, {
      maxWidth: 'min(560px, 90vw)',
      panelClass: 'demo-dialog-pane',
      ...(trigger && { transformOriginElement: trigger }),
    });
    bindClearOverlayOnClose(
      this.dialogRef,
      () => this.dialogRef,
      (v) => (this.dialogRef = v),
    );
  }

  async openComponentDialog(event?: MouseEvent): Promise<void> {
    if (this.componentDialogRef) return;
    const trigger = this.triggerFromEvent(event);
    this.componentDialogRef = await this.dialogSvc.open(DemoDialogComponent, {
      maxWidth: 'min(480px, 90vw)',
      panelClass: 'demo-dialog-pane',
      ...(trigger && { transformOriginElement: trigger }),
      inputs: { title: 'Confirm Action', theme: 'indigo', name: 'dialog-page' },
    });
    bindClearOverlayOnClose(
      this.componentDialogRef,
      () => this.componentDialogRef,
      (v) => (this.componentDialogRef = v),
    );
  }

  async openScrollableDialog(event?: MouseEvent): Promise<void> {
    if (this.scrollableDialogRef) return;
    const trigger = this.triggerFromEvent(event);
    this.scrollableDialogRef = await this.dialogSvc.open(this.scrollableDialogTpl, {
      maxWidth: 'min(480px, 90vw)',
      maxHeight: '400px',
      panelClass: 'demo-dialog-pane',
      panelStyle: { overflow: 'hidden' },
      ...(trigger && { transformOriginElement: trigger }),
    });
    bindClearOverlayOnClose(
      this.scrollableDialogRef,
      () => this.scrollableDialogRef,
      (v) => (this.scrollableDialogRef = v),
    );
  }

  async openMixedDialog(event?: MouseEvent): Promise<void> {
    if (this.mixedDialogRef) return;
    const trigger = this.triggerFromEvent(event);
    this.mixedDialogRef = await this.dialogSvc.open(this.mixedDialogTpl, {
      maxWidth: 'min(560px, 90vw)',
      panelClass: 'demo-dialog-pane',
      ...(trigger && { transformOriginElement: trigger }),
    });
    bindClearOverlayOnClose(
      this.mixedDialogRef,
      () => this.mixedDialogRef,
      (v) => (this.mixedDialogRef = v),
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

  openSnackbar(placement: SnackbarPlacement): void {
    this.snackbarSvc.notify({
      variant: 'info',
      title: 'Dialog event',
      message: `Snackbar fired from dialog`,
      actionLabel: 'Dismiss',
      placement,
      pauseOnHover: true,
    });
  }

  onMenuAction(event: { option: MenuAction }): void {
    void event;
    this.openSnackbar('bottom-end');
  }
}

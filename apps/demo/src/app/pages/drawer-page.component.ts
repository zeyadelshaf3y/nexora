import {
  ChangeDetectionStrategy,
  Component,
  inject,
  ViewChild,
  ViewEncapsulation,
  type TemplateRef,
} from '@angular/core';
import { FocusTrapDirective } from '@nexora-ui/interactions';
import {
  CloseDialogDirective,
  CloseDrawerDirective,
  DialogService,
  DrawerService,
  type DrawerPlacement,
  type OverlayRef,
} from '@nexora-ui/overlay';

import { bindClearOverlayOnClose } from '../core/bind-clear-overlay-on-close';
import { IconComponent } from '../core/icons';

@Component({
  selector: 'app-drawer-page',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FocusTrapDirective, CloseDrawerDirective, CloseDialogDirective, IconComponent],
  template: `
    <!-- All 4 Placements -->
    <section class="page-section">
      <h2 class="page-section-title">Drawer Placements</h2>
      <p class="page-section-desc">
        Slide-out panels from all four edges. Close with Escape, backdrop, or the close button.
      </p>
      <div class="btn-row">
        @for (p of drawerPlacements; track p) {
          <button class="btn" (click)="openDrawer(p)">
            <app-icon [name]="getPlacementIcon(p)" [size]="16" />
            {{ p }}
          </button>
        }
      </div>
    </section>

    <!-- Mixed: Drawer with Nested Dialog -->
    <section class="page-section">
      <h2 class="page-section-title">Mixed: Drawer with Nested Dialog</h2>
      <p class="page-section-desc">
        Open a drawer, then trigger a dialog from within it. Both overlay layers coexist.
      </p>
      <button class="btn btn-primary" (click)="openDrawerWithDialog()">
        <app-icon name="panel-right" [size]="16" />
        Open drawer with nested dialog
      </button>
    </section>

    <!-- ═══ Templates ═══ -->

    <!-- Drawer -->
    <ng-template #drawerTpl>
      <div class="tpl-drawer" nxrFocusTrap>
        <h2>Drawer Panel</h2>
        <p>Slide-out panel. Close with Escape, backdrop, or the button.</p>
        <nav class="drawer-nav">
          <a class="drawer-nav-item" href="#">
            <app-icon name="grid" [size]="16" />
            Dashboard
          </a>
          <a class="drawer-nav-item" href="#">
            <app-icon name="settings" [size]="16" />
            Settings
          </a>
          <a class="drawer-nav-item" href="#">
            <app-icon name="user" [size]="16" />
            Profile
          </a>
          <a class="drawer-nav-item" href="#">
            <app-icon name="bell" [size]="16" />
            Notifications
          </a>
          <a class="drawer-nav-item" href="#">
            <app-icon name="sparkles" [size]="16" />
            Help
          </a>
        </nav>
        <div class="tpl-drawer-footer">
          <button class="btn btn-ghost" nxrDrawerClose>Close</button>
        </div>
      </div>
    </ng-template>

    <!-- Drawer with nested dialog button -->
    <ng-template #drawerWithDialogTpl>
      <div class="tpl-drawer" nxrFocusTrap>
        <h2>Drawer + Dialog</h2>
        <p>This drawer contains a button that opens a dialog on top.</p>
        <nav class="drawer-nav">
          <a class="drawer-nav-item" href="#">
            <app-icon name="grid" [size]="16" />
            Dashboard
          </a>
          <a class="drawer-nav-item" href="#">
            <app-icon name="settings" [size]="16" />
            Settings
          </a>
        </nav>
        <div style="padding: 1rem; margin-top: auto;">
          <button class="btn btn-primary" style="width: 100%;" (click)="openNestedDialog($event)">
            <app-icon name="sparkles" [size]="16" />
            Open nested dialog
          </button>
        </div>
        <div class="tpl-drawer-footer">
          <button class="btn btn-ghost" nxrDrawerClose>Close drawer</button>
        </div>
      </div>
    </ng-template>

    <!-- Nested dialog from drawer -->
    <ng-template #nestedDialogTpl>
      <div class="tpl-dialog" nxrFocusTrap>
        <h2>Nested Dialog</h2>
        <p>
          This dialog was opened from inside the drawer. Both layers coexist — closing this dialog
          returns focus to the drawer.
        </p>
        <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem;">
          <button class="btn btn-ghost" nxrDialogClose>Cancel</button>
          <button class="btn btn-primary" nxrDialogClose>Confirm</button>
        </div>
      </div>
    </ng-template>
  `,
  styles: [
    `
      .drawer-nav-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
    `,
  ],
})
export class DrawerPageComponent {
  @ViewChild('drawerTpl') drawerTpl!: TemplateRef<unknown>;
  @ViewChild('drawerWithDialogTpl') drawerWithDialogTpl!: TemplateRef<unknown>;
  @ViewChild('nestedDialogTpl') nestedDialogTpl!: TemplateRef<unknown>;

  private readonly drawerSvc = inject(DrawerService);
  private readonly dialogSvc = inject(DialogService);

  private drawerRef: OverlayRef | null = null;
  private drawerWithDialogRef: OverlayRef | null = null;
  private nestedDialogRef: OverlayRef | null = null;

  readonly drawerPlacements: DrawerPlacement[] = ['start', 'end', 'top', 'bottom'];

  getPlacementIcon(p: DrawerPlacement): string {
    switch (p) {
      case 'start':
        return 'chevron-left';
      case 'end':
        return 'chevron-right';
      case 'top':
        return 'layers';
      case 'bottom':
        return 'layers';
    }
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

  async openDrawerWithDialog(): Promise<void> {
    if (this.drawerWithDialogRef) return;
    this.drawerWithDialogRef = await this.drawerSvc.open(this.drawerWithDialogTpl, {
      placement: 'end',
      hasBackdrop: true,
      panelClass: 'demo-drawer-pane',
      minWidth: '280px',
      maxWidth: 'min(400px, 80vw)',
    });
    bindClearOverlayOnClose(
      this.drawerWithDialogRef,
      () => this.drawerWithDialogRef,
      (v) => (this.drawerWithDialogRef = v),
    );
  }

  async openNestedDialog(event?: MouseEvent): Promise<void> {
    if (this.nestedDialogRef) return;
    const trigger = event?.currentTarget instanceof HTMLElement ? event.currentTarget : undefined;
    this.nestedDialogRef = await this.dialogSvc.open(this.nestedDialogTpl, {
      maxWidth: 'min(480px, 90vw)',
      panelClass: 'demo-dialog-pane',
      ...(trigger && { transformOriginElement: trigger }),
    });
    bindClearOverlayOnClose(
      this.nestedDialogRef,
      () => this.nestedDialogRef,
      (v) => (this.nestedDialogRef = v),
    );
  }
}

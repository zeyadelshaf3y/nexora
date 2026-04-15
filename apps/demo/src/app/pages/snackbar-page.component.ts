import {
  ChangeDetectionStrategy,
  Component,
  inject,
  ViewChild,
  ViewEncapsulation,
  type TemplateRef,
} from '@angular/core';
import {
  CloseSnackbarDirective,
  SnackbarService,
  type SnackbarPlacement,
} from '@nexora-ui/snackbar';

import { IconComponent } from '../core/icons';

@Component({
  selector: 'app-snackbar-page',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CloseSnackbarDirective, IconComponent],
  template: `
    <!-- Placements -->
    <section class="page-section">
      <h2 class="page-section-title">Snackbar Placements</h2>
      <p class="page-section-desc">
        Toast notifications at 6 viewport positions. Auto-close in 5s.
      </p>
      <div class="btn-row">
        @for (p of snackbarPlacements; track p) {
          <button class="btn btn-sm" (click)="openSnackbar(p)">{{ p }}</button>
        }
      </div>
    </section>

    <!-- Variants -->
    <section class="page-section">
      <h2 class="page-section-title">Variants &amp; Grouping</h2>
      <p class="page-section-desc">
        Colored left border indicates status. <code>groupId</code> replaces same-group snackbars.
      </p>
      <div class="snackbar-page-variants">
        @for (v of variants; track v.id) {
          <button
            class="btn btn-sm"
            [style.border-left]="'3px solid var(--nxr-' + v.id + ')'"
            (click)="openVariant(v)"
          >
            <app-icon [name]="v.icon" [size]="16" />
            {{ v.label }}
          </button>
        }
      </div>
    </section>

    <!-- Stacking -->
    <section class="page-section">
      <h2 class="page-section-title">Stacking</h2>
      <p class="page-section-desc">Open 3 snackbars without groupId — they stack vertically.</p>
      <button class="btn" (click)="openStack()">Open 3 stacked</button>
    </section>

    <!-- ═══ Templates ═══ -->
    <ng-template #snackbarTpl let-message="message">
      <div class="tpl-snackbar">
        <span class="tpl-snackbar-msg">{{ message }}</span>
        <button class="tpl-snackbar-action" nxrSnackbarClose>Dismiss</button>
        <button class="tpl-snackbar-action tpl-snackbar-action--accent" [nxrSnackbarClose]="'undo'">
          Undo
        </button>
      </div>
    </ng-template>
  `,
  styles: [
    `
      .snackbar-page-variants {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }
      .snackbar-page-variants .btn {
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }
    `,
  ],
})
export class SnackbarPageComponent {
  @ViewChild('snackbarTpl') snackbarTpl!: TemplateRef<unknown>;

  private readonly snackbarSvc = inject(SnackbarService);

  readonly snackbarPlacements: SnackbarPlacement[] = [
    'top-start',
    'top',
    'top-end',
    'bottom-start',
    'bottom',
    'bottom-end',
  ];

  readonly variants = [
    {
      id: 'success',
      label: 'Success',
      message: 'Changes saved successfully.',
      cls: 'snackbar-success',
      icon: 'check',
    },
    {
      id: 'error',
      label: 'Error',
      message: 'Something went wrong.',
      cls: 'snackbar-error',
      icon: 'x',
    },
    {
      id: 'info',
      label: 'Info',
      message: 'Session expires in 5 min.',
      cls: 'snackbar-info',
      icon: 'bell',
    },
    {
      id: 'warning',
      label: 'Warning',
      message: 'This cannot be undone.',
      cls: 'snackbar-warning',
      icon: 'zap',
    },
  ] as const;

  openSnackbar(placement: SnackbarPlacement): void {
    this.snackbarSvc.open(this.snackbarTpl, {
      placement,
      duration: 5000,
      panelClass: 'demo-snackbar-pane',
      closeAnimationDurationMs: 200,
      data: { message: `Snackbar at ${placement}` },
    });
  }

  openVariant(v: { id: string; label: string; message: string; cls: string }): void {
    this.snackbarSvc.open(this.snackbarTpl, {
      placement: 'bottom-end',
      duration: 5000,
      groupId: v.id,
      panelClass: ['demo-snackbar-pane', v.cls],
      closeAnimationDurationMs: 200,
      data: { message: v.message },
    });
  }

  openStack(): void {
    [1, 2, 3].forEach((i) => {
      this.snackbarSvc.open(this.snackbarTpl, {
        placement: 'bottom-end',
        duration: 6000,
        panelClass: 'demo-snackbar-pane',
        closeAnimationDurationMs: 200,
        data: { message: `Notification ${i} of 3` },
      });
    });
  }
}

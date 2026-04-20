import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { SNACKBAR_REF, SnackbarService, type SnackbarPlacement } from '@nexora-ui/snackbar';

import { IconComponent } from '../core/icons';

@Component({
  selector: 'app-custom-snackbar',
  standalone: true,
  template: `
    <div class="notify-snackbar notify-snackbar--custom" [attr.data-variant]="variant || 'info'">
      <strong class="notify-snackbar-title">{{ title }}</strong>
      <span class="notify-snackbar-message">{{ message }}</span>
      <div class="notify-snackbar-actions">
        <button class="notify-snackbar-action" type="button" (click)="triggerAction()">
          {{ actionLabel || 'Action' }}
        </button>
        <button class="notify-snackbar-dismiss" type="button" (click)="dismiss()">x</button>
      </div>
    </div>
  `,
})
class DemoCustomSnackbarComponent {
  @Input() variant = 'info';
  @Input() title = 'Custom Snackbar';
  @Input() message = '';
  @Input() actionLabel = 'Action';

  @Output() readonly action = new EventEmitter<{ acknowledged: true }>();

  private readonly ref = inject(SNACKBAR_REF);

  triggerAction(): void {
    this.action.emit({ acknowledged: true });
    this.ref.close('custom-action');
  }

  dismiss(): void {
    this.ref.close('dismiss');
  }
}

@Component({
  selector: 'app-snackbar-page',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <!-- Placements -->
    <section class="page-section">
      <h2 class="page-section-title">Snackbar Placements</h2>
      <p class="page-section-desc">
        Uses <code>notify(...)</code> with app-level defaults provider and placement overrides.
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
        Pass component <code>inputs</code> directly through <code>notify</code> and style by
        variant.
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
      <p class="page-section-desc">
        Demo defaults cap visible snackbars at 3 per placement. Open 5 and watch oldest queue/hide.
      </p>
      <button class="btn" (click)="openStack()">Open 5 stacked (max visible 3)</button>
    </section>

    <!-- Custom component inputs/outputs -->
    <section class="page-section">
      <h2 class="page-section-title">Custom Component (typed inputs/outputs)</h2>
      <p class="page-section-desc">
        Demonstrates <code>open(Component, options)</code> with typed
        <code>inputs</code>/<code>outputs</code>.
      </p>
      <button class="btn btn-sm" (click)="openCustomComponent()">Open custom snackbar</button>
    </section>
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
      icon: 'check',
    },
    {
      id: 'error',
      label: 'Error',
      message: 'Something went wrong.',
      icon: 'x',
    },
    {
      id: 'info',
      label: 'Info',
      message: 'Session expires in 5 min.',
      icon: 'bell',
    },
    {
      id: 'warning',
      label: 'Warning',
      message: 'This cannot be undone.',
      icon: 'zap',
    },
  ] as const;

  openSnackbar(placement: SnackbarPlacement): void {
    this.snackbarSvc.notify({
      placement,
      pauseOnHover: true,
      inputs: {
        title: 'Placement demo',
        message: `Snackbar at ${placement}`,
        actionLabel: 'Dismiss',
        variant: 'info',
      },
    });
  }

  openVariant(v: { id: string; label: string; message: string }): void {
    this.snackbarSvc.notify<DemoCustomSnackbarComponent>({
      placement: 'bottom-end',
      groupId: v.id,
      pauseOnHover: true,
      inputs: {
        variant: v.id,
        title: v.label,
        message: v.message,
        actionLabel: 'Dismiss',
      },
    });
  }

  openStack(): void {
    [1, 2, 3, 4, 5].forEach((i) => {
      this.snackbarSvc.notify({
        placement: 'bottom-end',
        duration: 6000,
        inputs: {
          title: `Notification ${i}`,
          message: `Stacked item ${i} of 5`,
          actionLabel: 'Dismiss',
          variant: 'info',
        },
      });
    });
  }

  openCustomComponent(): void {
    this.snackbarSvc.open(DemoCustomSnackbarComponent, {
      placement: 'top-end',
      duration: 8000,
      panelClass: ['demo-snackbar-pane', 'snackbar-info'],
      showProgress: true,
      closeAnimationDurationMs: 200,
      pauseOnHover: true,
      inputs: {
        variant: 'info',
        title: 'Custom I/O snackbar',
        message: 'This one uses typed component inputs and outputs.',
        actionLabel: 'Confirm',
      },
      outputs: {
        action: () =>
          this.snackbarSvc.notify({
            duration: 2500,
            inputs: {
              variant: 'success',
              title: 'Output fired',
              message: 'Custom snackbar output handler executed.',
              actionLabel: 'Nice',
            },
          }),
      },
    });
  }
}

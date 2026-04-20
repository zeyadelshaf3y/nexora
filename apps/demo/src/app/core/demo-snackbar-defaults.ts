import { Component, EventEmitter, inject, Input, Output, type Provider } from '@angular/core';
import { provideSnackbarDefaults, SNACKBAR_REF } from '@nexora-ui/snackbar';

@Component({
  selector: 'app-demo-default-snackbar',
  standalone: true,
  template: `
    <div class="notify-snackbar" [attr.data-variant]="variant || 'info'">
      @if (title) {
        <strong class="notify-snackbar-title">{{ title }}</strong>
      }
      @if (message) {
        <span class="notify-snackbar-message">{{ message }}</span>
      }
      @if (actionLabel) {
        <button class="notify-snackbar-action" type="button" (click)="onActionClick()">
          {{ actionLabel }}
        </button>
      }
      <button class="notify-snackbar-dismiss" type="button" (click)="dismiss()">x</button>
    </div>
  `,
})
export class DemoDefaultSnackbarComponent {
  @Input() variant = 'info';
  @Input() title = '';
  @Input() message = '';
  @Input() actionLabel = '';

  @Output() readonly actionClick = new EventEmitter<void>();

  private readonly ref = inject(SNACKBAR_REF);

  onActionClick(): void {
    this.actionClick.emit();
    this.ref.close('action');
  }

  dismiss(): void {
    this.ref.close('dismiss');
  }
}

export function provideDemoSnackbarDefaults(): Provider {
  return provideSnackbarDefaults({
    component: DemoDefaultSnackbarComponent,
    defaultOpenOptions: {
      duration: 5000,
      placement: 'bottom-end',
      panelClass: 'demo-snackbar-pane',
      closeAnimationDurationMs: 200,
      showProgress: true,
      pauseOnHover: false,
      maxVisibleSnackbars: 3,
      maxWidth: '100vw',
    },
    maxVisibleSnackbars: 3,
  });
}

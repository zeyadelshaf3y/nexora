import { ChangeDetectionStrategy, Component, computed, input, type Signal } from '@angular/core';
import { CloseDialogDirective } from '@nexora-ui/overlay';

@Component({
  selector: 'app-reactive-context-dialog',
  standalone: true,
  imports: [CloseDialogDirective],
  template: `
    <div class="demo-dialog-content">
      <h2>Reactive Context Dialog</h2>
      <p>
        This dialog reads a parent signal passed through
        <code>DialogService.open(..., {{ '{' }} inputs {{ '}' }})</code>.
      </p>

      <div class="reactive-status" [class.reactive-status--active]="isSubmitting()">
        <span class="reactive-status-label">Submitting</span>
        <strong>{{ isSubmitting() ? 'true' : 'false' }}</strong>
      </div>

      <p class="reactive-note">
        The parent flips the signal every 1.2s while this dialog stays open.
      </p>

      <div class="demo-dialog-actions">
        <button class="btn btn-primary" nxrDialogClose>Close</button>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .demo-dialog-content {
        padding: 1.5rem 2rem;
      }

      .demo-dialog-content h2 {
        margin: 0 0 0.5rem;
        font-size: 1.25rem;
        font-weight: 600;
      }

      .demo-dialog-content p {
        margin: 0 0 1rem;
        color: #64748b;
        line-height: 1.5;
      }

      .demo-dialog-content code {
        background: #f1f5f9;
        padding: 0.125rem 0.375rem;
        border-radius: 4px;
        font-size: 0.8125rem;
      }

      .reactive-status {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
        background: #f8fafc;
        margin-bottom: 0.75rem;
      }

      .reactive-status--active {
        background: #eef2ff;
        border-color: #a5b4fc;
      }

      .reactive-status-label {
        font-size: 0.875rem;
        color: #334155;
      }

      .reactive-note {
        font-size: 0.8125rem;
        color: #64748b;
      }

      .demo-dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
      }

      .btn {
        padding: 0.5rem 1rem;
        border-radius: 6px;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        border: none;
      }

      .btn-primary {
        background: #6366f1;
        color: white;
      }

      .btn-primary:hover {
        background: #4f46e5;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReactiveContextDialogComponent {
  readonly submitting = input<Signal<boolean>>();

  protected readonly isSubmitting = computed(() => this.submitting()?.() ?? false);
}

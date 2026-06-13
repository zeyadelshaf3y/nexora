import { Component, DestroyRef, inject, input, signal } from '@angular/core';
import { CloseDialogDirective, OVERLAY_REF } from '@nexora-ui/overlay';

@Component({
  selector: 'app-demo-dialog',
  standalone: true,
  imports: [CloseDialogDirective],
  template: `
    <div class="demo-dialog-content">
      <h2>{{ title() || 'Component Dialog' }}</h2>
      <p>This dialog was opened with <code>ComponentPortal</code>.</p>
      <p>
        It controls its own overlay by injecting
        <code>OVERLAY_REF</code> — resizing the pane and guarding close from the inside.
      </p>

      <div class="demo-dialog-meta">
        <span class="meta-label">Theme</span>
        <span class="meta-value">{{ theme() }}</span>
        <span class="meta-value">{{ name() }}</span>
      </div>

      <div class="demo-dialog-self-controls">
        <button class="btn btn-ghost" type="button" (click)="toggleSize()">
          {{ expanded() ? 'Shrink dialog' : 'Expand dialog' }}
        </button>
        <label class="demo-dialog-guard">
          <input type="checkbox" [checked]="hasUnsavedChanges()" (change)="toggleUnsaved()" />
          Block close (unsaved changes)
        </label>
      </div>

      <div class="demo-dialog-actions">
        <button class="btn btn-ghost" nxrDialogClose>Cancel</button>
        <button class="btn btn-primary" nxrDialogClose>Confirm</button>
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
      .demo-dialog-meta {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        background: #f8fafc;
        border-radius: 8px;
        margin-bottom: 1.5rem;
      }
      .meta-label {
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #94a3b8;
      }
      .meta-value {
        font-size: 0.875rem;
        color: #334155;
        font-weight: 500;
      }
      .demo-dialog-self-controls {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
      }
      .demo-dialog-guard {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        font-size: 0.8125rem;
        color: #475569;
        cursor: pointer;
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
        transition: background 0.15s ease;
      }
      .btn-ghost {
        background: transparent;
        color: #64748b;
      }
      .btn-ghost:hover {
        background: #f1f5f9;
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
})
export class DemoDialogComponent {
  readonly title = input<string>('Component Dialog');
  readonly theme = input<string>('default');
  readonly name = input<string>('');

  private readonly overlay = inject(OVERLAY_REF);

  protected readonly expanded = signal(false);
  protected readonly hasUnsavedChanges = signal(false);

  constructor() {
    const removeGuard = this.overlay.addCloseGuard(() => {
      if (!this.hasUnsavedChanges()) return true;
      return confirm('You have unsaved changes. Close anyway?');
    });
    inject(DestroyRef).onDestroy(removeGuard);
  }

  protected toggleSize(): void {
    this.expanded.update((value) => !value);
    this.overlay.updateSize(
      this.expanded() ? { height: '70vh', maxHeight: '90vh' } : { height: 'auto' },
    );
  }

  protected toggleUnsaved(): void {
    this.hasUnsavedChanges.update((value) => !value);
  }
}

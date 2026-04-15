import { Component, input } from '@angular/core';
import { CloseDialogDirective } from '@nexora-ui/overlay';

@Component({
  selector: 'app-demo-dialog',
  standalone: true,
  imports: [CloseDialogDirective],
  template: `
    <div class="demo-dialog-content">
      <h2>{{ title() || 'Component Dialog' }}</h2>
      <p>This dialog was opened with <code>ComponentPortal</code>.</p>
      <p>It receives inputs and emits outputs through the overlay service.</p>

      <div class="demo-dialog-meta">
        <span class="meta-label">Theme</span>
        <span class="meta-value">{{ theme() }}</span>
        <span class="meta-value">{{ name() }}</span>
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
}

import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, ViewEncapsulation } from '@angular/core';
import type { TemplateRef } from '@angular/core';

import {
  BUILTIN_VIRTUAL_PANEL_SHELL_LAYOUT_STYLES,
  NXR_LISTBOX_CDK_OVERLAY_FLEX_COLUMN_CLASS,
} from '../layout/overlay-flex-layout';

/**
 * Header / scroll body / footer chrome for built-in virtual combobox and select.
 * Host nodes use the shared overlay flex-column utility so `fillAvailableHeight` resolves under `max-height`.
 */
@Component({
  selector: 'nxr-builtin-virtual-panel-shell',
  standalone: true,
  imports: [NgTemplateOutlet],
  host: { class: NXR_LISTBOX_CDK_OVERLAY_FLEX_COLUMN_CLASS },
  template: `
    <div class="${NXR_LISTBOX_CDK_OVERLAY_FLEX_COLUMN_CLASS} nxr-builtin-virtual-shell">
      @if (headerTemplate(); as h) {
        <div class="nxr-builtin-virtual-header">
          <ng-container *ngTemplateOutlet="h" />
        </div>
      }
      <div class="${NXR_LISTBOX_CDK_OVERLAY_FLEX_COLUMN_CLASS} nxr-builtin-virtual-body">
        <ng-content />
      </div>
      @if (footerTemplate(); as f) {
        <div class="nxr-builtin-virtual-footer">
          <ng-container *ngTemplateOutlet="f" />
        </div>
      }
    </div>
  `,
  styles: [BUILTIN_VIRTUAL_PANEL_SHELL_LAYOUT_STYLES],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuiltinVirtualPanelShellComponent {
  readonly headerTemplate = input<TemplateRef<void> | null>(null);
  readonly footerTemplate = input<TemplateRef<void> | null>(null);
}

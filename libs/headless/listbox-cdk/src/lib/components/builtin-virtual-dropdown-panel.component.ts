import { ChangeDetectionStrategy, Component, input, ViewEncapsulation } from '@angular/core';
import type { TemplateRef } from '@angular/core';

import { NXR_LISTBOX_CDK_OVERLAY_FLEX_COLUMN_CLASS } from '../layout/overlay-flex-layout';

import { BuiltinVirtualPanelShellComponent } from './builtin-virtual-panel-shell.component';
import { ListboxCdkVirtualPanelComponent } from './listbox-cdk-virtual-panel.component';

/** Opinionated shell + virtual panel wiring for `virtualScroll` + `virtualItems` on combobox/select. */
@Component({
  selector: 'nxr-builtin-virtual-dropdown-panel',
  standalone: true,
  imports: [BuiltinVirtualPanelShellComponent, ListboxCdkVirtualPanelComponent],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: NXR_LISTBOX_CDK_OVERLAY_FLEX_COLUMN_CLASS },
  template: `
    <nxr-builtin-virtual-panel-shell
      [headerTemplate]="headerTemplate()"
      [footerTemplate]="footerTemplate()"
    >
      <nxr-listbox-cdk-virtual-panel
        [fillAvailableHeight]="true"
        [items]="items()"
        [itemSize]="itemSize()"
        [initialSelectedIndex]="initialSelectedIndex()"
        [labelFor]="labelFor()"
        [trackByKey]="trackByKey()"
        [emptyMessage]="emptyMessage()"
        [viewportMaxHeight]="viewportMaxHeight()"
        [optionTemplate]="optionTemplate()"
      />
    </nxr-builtin-virtual-panel-shell>
  `,
})
export class BuiltinVirtualDropdownPanelComponent<T = unknown> {
  readonly headerTemplate = input<TemplateRef<void> | null>(null);
  readonly footerTemplate = input<TemplateRef<void> | null>(null);
  readonly items = input.required<readonly T[]>();
  readonly itemSize = input(40);
  readonly initialSelectedIndex = input(-1);
  readonly labelFor = input<(item: T) => string>((item) => String(item));
  readonly trackByKey = input<(item: T) => unknown>((item) => item);
  readonly emptyMessage = input('No results');
  readonly viewportMaxHeight = input('200px');
  readonly optionTemplate = input<TemplateRef<{ $implicit: T }> | null>(null);
}

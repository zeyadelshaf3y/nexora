import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import type { TemplateRef } from '@angular/core';
import { OverlayTriggerDirective } from '@nexora-ui/overlay';

@Component({
  selector: 'app-demo-dialog-section',
  standalone: true,
  imports: [OverlayTriggerDirective],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './demo-dialog-section.component.html',
})
export class DemoDialogSectionComponent {
  readonly inlineDialogTpl = input.required<TemplateRef<unknown>>();
  readonly openDialog = output<MouseEvent | undefined>();
  readonly openComponentDialog = output<MouseEvent | undefined>();
  readonly openScrollableDialog = output<MouseEvent | undefined>();
  readonly openDialogCenterOnly = output<undefined>();
  readonly openContentScopedDialog = output<undefined>();
}

import { Component, input } from '@angular/core';
import type { TemplateRef } from '@angular/core';
import type { Placement } from '@nexora-ui/overlay';
import { PopoverTriggerDirective } from '@nexora-ui/popover';

@Component({
  selector: 'app-demo-popover-section',
  standalone: true,
  imports: [PopoverTriggerDirective],
  templateUrl: './demo-popover-section.component.html',
})
export class DemoPopoverSectionComponent {
  readonly popoverRichTpl = input.required<TemplateRef<unknown>>();
  readonly popoverSimpleTpl = input.required<TemplateRef<unknown>>();
  readonly popoverLongTpl = input.required<TemplateRef<unknown>>();
  readonly popoverSuggestionsTpl = input.required<TemplateRef<unknown>>();
  readonly allPlacements = input.required<Placement[]>();
}

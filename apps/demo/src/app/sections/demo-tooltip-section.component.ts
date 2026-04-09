import { Component, input } from '@angular/core';
import type { Placement } from '@nexora-ui/overlay';
import { TooltipTriggerDirective } from '@nexora-ui/tooltip';

@Component({
  selector: 'app-demo-tooltip-section',
  standalone: true,
  imports: [TooltipTriggerDirective],
  templateUrl: './demo-tooltip-section.component.html',
})
export class DemoTooltipSectionComponent {
  readonly allPlacements = input.required<Placement[]>();
}

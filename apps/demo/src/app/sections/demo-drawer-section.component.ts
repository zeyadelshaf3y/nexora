import { Component, input, output } from '@angular/core';
import type { DrawerPlacement } from '@nexora-ui/overlay';

@Component({
  selector: 'app-demo-drawer-section',
  standalone: true,
  templateUrl: './demo-drawer-section.component.html',
})
export class DemoDrawerSectionComponent {
  readonly drawerPlacements = input.required<DrawerPlacement[]>();
  readonly openDrawer = output<DrawerPlacement>();
}

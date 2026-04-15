import { Component, input, output } from '@angular/core';
import type { SnackbarPlacement } from '@nexora-ui/snackbar';

export type SnackbarVariant = {
  id: string;
  label: string;
  message: string;
  cls: string;
};

@Component({
  selector: 'app-demo-snackbar-section',
  standalone: true,
  templateUrl: './demo-snackbar-section.component.html',
})
export class DemoSnackbarSectionComponent {
  readonly snackbarPlacements = input.required<SnackbarPlacement[]>();
  readonly snackbarVariants = input.required<readonly SnackbarVariant[]>();
  readonly openSnackbar = output<SnackbarPlacement>();
  readonly openSnackbarInHost = output();
  readonly openSnackbarVariant = output<SnackbarVariant>();
  readonly openSnackbarStack = output();
}

import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ARROW_HOST_STYLES, OverlayArrowDirective } from '@nexora-ui/overlay';

/**
 * Internal host component rendered inside the tooltip overlay pane.
 * Displays the tooltip text and an optional arrow element.
 *
 * Style the tooltip body via the pane's `panelClass` or by targeting
 * `.nxr-tooltip-body` and `.nxr-tooltip-arrow` in your CSS.
 *
 * Arrow positioning is handled via CSS variables set by the overlay engine:
 * `--nxr-arrow-x`, `--nxr-arrow-y`, `--nxr-arrow-rotate`, `--nxr-arrow-side`, `--nxr-arrow-visible`.
 *
 * @internal
 */
@Component({
  selector: 'nxr-tooltip-content-host',
  standalone: true,
  imports: [OverlayArrowDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (showArrow()) {
      <span class="nxr-tooltip-arrow nxr-overlay-arrow-host" nxrOverlayArrow></span>
    }
    <span class="nxr-tooltip-body">{{ text() }}</span>
  `,
  styles: [
    ARROW_HOST_STYLES,
    `
      :host {
        display: block;
        position: relative;
      }
      .nxr-tooltip-body {
        display: block;
      }
      .nxr-tooltip-arrow {
        background: var(--nxr-arrow-bg, currentColor);
      }
    `,
  ],
})
export class TooltipContentHostComponent {
  readonly text = input<string>('');
  readonly showArrow = input<boolean>(true);
}

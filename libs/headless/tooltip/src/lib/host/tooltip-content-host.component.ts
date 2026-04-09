import { ChangeDetectionStrategy, Component, inject, InjectionToken } from '@angular/core';
import { ARROW_HOST_STYLES, OverlayArrowDirective } from '@nexora-ui/overlay';

/** Injected tooltip text string. */
export const TOOLTIP_TEXT = new InjectionToken<string>('TOOLTIP_TEXT');

/** Whether to render the built-in arrow element. */
export const TOOLTIP_SHOW_ARROW = new InjectionToken<boolean>('TOOLTIP_SHOW_ARROW');

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
    @if (showArrow) {
      <span class="nxr-tooltip-arrow nxr-overlay-arrow-host" nxrOverlayArrow></span>
    }
    <span class="nxr-tooltip-body">{{ text }}</span>
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
  readonly text = inject(TOOLTIP_TEXT);
  readonly showArrow = inject(TOOLTIP_SHOW_ARROW);
}

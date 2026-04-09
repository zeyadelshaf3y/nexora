import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  InjectionToken,
  type TemplateRef,
} from '@angular/core';
import { ARROW_HOST_STYLES, OverlayArrowDirective } from '@nexora-ui/overlay';

/** Injected string content when popover/tooltip content is a plain string. */
export const POPOVER_CONTENT_STRING = new InjectionToken<string | null>('POPOVER_CONTENT_STRING');

/** Injected template when popover/tooltip content is a TemplateRef. */
export const POPOVER_CONTENT_TEMPLATE = new InjectionToken<TemplateRef<unknown> | null>(
  'POPOVER_CONTENT_TEMPLATE',
);

/** Whether to render the built-in arrow element. */
export const POPOVER_SHOW_ARROW = new InjectionToken<boolean>('POPOVER_SHOW_ARROW');

/**
 * Host component used when content is a string or when tooltip mode uses a template.
 * Renders an optional arrow and either string text or a template outlet.
 *
 * Arrow dimensions are controlled via CSS variables so consumers can override them:
 * - `--nxr-arrow-width` (default: `12px`)
 * - `--nxr-arrow-height` (default: `6px`)
 * - `--nxr-arrow-bg` (default: `#fff`)
 *
 * @internal
 */
@Component({
  selector: 'nxr-popover-content-host',
  standalone: true,
  imports: [NgTemplateOutlet, OverlayArrowDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (showArrow) {
      <span class="nxr-popover-content-host-arrow nxr-overlay-arrow-host" nxrOverlayArrow></span>
    }

    <div class="nxr-popover-content-host-body">
      @if (stringContent !== null) {
        <span class="nxr-popover-string-content">{{ stringContent }}</span>
      }

      @if (templateContent !== null) {
        <ng-container *ngTemplateOutlet="templateContent"></ng-container>
      }
    </div>
  `,
  styles: [
    ARROW_HOST_STYLES,
    `
      :host {
        display: block;
        position: relative;
      }
      .nxr-popover-content-host-body {
        display: block;
      }
      .nxr-popover-string-content {
        display: block;
      }
      .nxr-popover-content-host-arrow {
        background: var(--nxr-arrow-bg, #fff);
      }
    `,
  ],
})
export class PopoverContentHostComponent {
  readonly stringContent = inject(POPOVER_CONTENT_STRING);
  readonly templateContent = inject(POPOVER_CONTENT_TEMPLATE);
  readonly showArrow = inject(POPOVER_SHOW_ARROW);
}

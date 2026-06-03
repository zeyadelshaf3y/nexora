/**
 * Internal host: renders the consumer's `nxrMentionPanel` template with state + `select` / `close`.
 *
 * - **Focus:** capture-phase `mousedown` + non-passive `touchstart` call `preventDefault` on options
 *   so the contenteditable does not blur before `select()` (desktop + mobile).
 * - Put filter `<input>` / `<textarea>` in the panel if needed; those targets skip `preventDefault`.
 *
 * When `headerTemplate` or `footerTemplate` are present the host switches to a flex-column layout:
 * header (fixed) → panel template in a scrollable wrapper → footer (fixed).
 * The `__panel` wrapper becomes the scroll container; the consumer's template should not add its
 * own `overflow: auto` when using chrome.
 */

import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  InjectionToken,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import type { TemplateRef } from '@angular/core';

import type { MentionPanelState } from '../types/mention-types';
import {
  handlePanelMouseDownForFocusRetention,
  handlePanelTouchStartForFocusRetention,
} from '../utils/mention-panel-dom';

import type { MentionController } from './mention-controller.types';

export const NXR_MENTION_CONTROLLER = new InjectionToken<MentionController<unknown>>(
  'NXR_MENTION_CONTROLLER',
);
export const NXR_MENTION_PANEL_TEMPLATE = new InjectionToken<
  TemplateRef<MentionPanelContext<unknown>>
>('NXR_MENTION_PANEL_TEMPLATE');
export const NXR_MENTION_PANEL_HEADER_TEMPLATE = new InjectionToken<TemplateRef<unknown> | null>(
  'NXR_MENTION_PANEL_HEADER_TEMPLATE',
);
export const NXR_MENTION_PANEL_FOOTER_TEMPLATE = new InjectionToken<TemplateRef<unknown> | null>(
  'NXR_MENTION_PANEL_FOOTER_TEMPLATE',
);

export interface MentionPanelContext<T = unknown> {
  readonly state: MentionPanelState<T>;
  readonly select: (item: T) => void;
  readonly close: () => void;
}

const TOUCH_OPTIONS: AddEventListenerOptions = { capture: true, passive: false };

@Component({
  selector: 'nxr-mention-panel-host',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [NgTemplateOutlet],
  host: {
    class: 'nxr-mention-panel-host',
    '[class.nxr-mention-panel-host--with-chrome]': 'hasChromeLayout',
    '(mousedown.capture)': 'onPanelMouseDownCapture($event)',
  },
  template: `
    @if (headerTemplate) {
      <div class="nxr-mention-panel-host__header">
        <ng-container [ngTemplateOutlet]="headerTemplate" />
      </div>
    }
    @if (panelTemplate && controller) {
      @if (hasChromeLayout) {
        <div class="nxr-mention-panel-host__panel">
          <ng-container *ngTemplateOutlet="panelTemplate; context: context()" />
        </div>
      } @else {
        <ng-container *ngTemplateOutlet="panelTemplate; context: context()" />
      }
    }
    @if (footerTemplate) {
      <div class="nxr-mention-panel-host__footer">
        <ng-container [ngTemplateOutlet]="footerTemplate" />
      </div>
    }
  `,
  styles: [
    `
      .nxr-mention-panel-host {
        display: block;
      }

      /*
       * When header or footer are present, switch to flex-column so the panel template
       * scrolls independently while header/footer remain fixed.
       */
      .nxr-mention-panel-host--with-chrome {
        display: flex;
        flex-direction: column;
        max-height: inherit;
        overflow: hidden;
      }

      /* __panel div is only rendered when hasChromeLayout is true; it acts as the flex scroll container */
      .nxr-mention-panel-host__panel {
        flex: 1 1 auto;
        min-height: 0;
        overflow: auto;
      }

      .nxr-mention-panel-host__header,
      .nxr-mention-panel-host__footer {
        flex: none;
      }
    `,
  ],
})
export class MentionPanelHostComponent<T = unknown> {
  readonly destroyRef = inject(DestroyRef);
  readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly controller = inject(NXR_MENTION_CONTROLLER) as MentionController<T>;
  protected readonly panelTemplate = inject(NXR_MENTION_PANEL_TEMPLATE) as TemplateRef<
    MentionPanelContext<T>
  >;
  protected readonly headerTemplate = inject(NXR_MENTION_PANEL_HEADER_TEMPLATE, {
    optional: true,
  });
  protected readonly footerTemplate = inject(NXR_MENTION_PANEL_FOOTER_TEMPLATE, {
    optional: true,
  });

  readonly hasChromeLayout = !!this.headerTemplate || !!this.footerTemplate;

  protected readonly context = signal<MentionPanelContext<T>>({
    state: {} as MentionPanelState<T>,
    select: () => {},
    close: () => {},
  });

  private buildContext(state: MentionPanelState<T>): MentionPanelContext<T> {
    return {
      state,
      select: (item: T) => this.controller.select(item),
      close: () => this.controller.close(),
    };
  }

  constructor() {
    const onPanelTouchStart = (event: TouchEvent): void => {
      handlePanelTouchStartForFocusRetention(event);
    };

    const nativeHostElement = this.hostElement.nativeElement;

    const unsubscribeTouchStart = (): void =>
      nativeHostElement.removeEventListener('touchstart', onPanelTouchStart, TOUCH_OPTIONS);

    nativeHostElement.addEventListener('touchstart', onPanelTouchStart, TOUCH_OPTIONS);

    this.destroyRef.onDestroy(unsubscribeTouchStart);

    effect(() => {
      const state = this.controller.panelState();
      this.context.set(this.buildContext(state));
    });
  }

  onPanelMouseDownCapture(event: Event): void {
    handlePanelMouseDownForFocusRetention(event);
  }
}

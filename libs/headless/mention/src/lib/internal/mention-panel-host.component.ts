/**
 * Internal host: renders the consumer's `nxrMentionPanel` template with state + `select` / `close`.
 *
 * - **Focus:** capture-phase `mousedown` + non-passive `touchstart` call `preventDefault` on options
 *   so the contenteditable does not blur before `select()` (desktop + mobile).
 * - Put filter `<input>` / `<textarea>` in the panel if needed; those targets skip `preventDefault`.
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
  imports: [NgTemplateOutlet],
  host: {
    '(mousedown.capture)': 'onPanelMouseDownCapture($event)',
  },
  template: `
    @if (panelTemplate && controller) {
      <ng-container *ngTemplateOutlet="panelTemplate; context: context()" />
    }
  `,
})
export class MentionPanelHostComponent<T = unknown> {
  readonly destroyRef = inject(DestroyRef);
  readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly controller = inject(NXR_MENTION_CONTROLLER) as MentionController<T>;
  protected readonly panelTemplate = inject(NXR_MENTION_PANEL_TEMPLATE) as TemplateRef<
    MentionPanelContext<T>
  >;

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

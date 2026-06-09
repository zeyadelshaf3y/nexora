import { Directive, inject, input } from '@angular/core';

import type { MentionController } from '../internal/mention-controller.types';
import { NXR_MENTION_CONTROLLER } from '../internal/mention-panel-tokens';

/**
 * Marks a mention suggestion row and wires pointer highlight when
 * `[nxrMentionPointerHighlight]="'hover'"` (default).
 *
 * ```html
 * <div [nxrMentionOption]="$index" (mousedown)="select(item)">…</div>
 * ```
 */
@Directive({
  selector: '[nxrMentionOption]',
  standalone: true,
  host: {
    '(mouseenter)': 'onMouseEnter()',
    '(mousedown)': 'onMouseDown()',
  },
})
export class MentionOptionDirective {
  private readonly controller = inject(NXR_MENTION_CONTROLLER, {
    optional: true,
  }) as MentionController<unknown> | null;

  /** Zero-based index of this option in `state.items`. */
  readonly nxrMentionOption = input.required<number>();

  onMouseEnter(): void {
    if (!this.controller?.usesHoverPointerHighlight()) return;

    this.controller.setActiveIndex(this.nxrMentionOption());
  }

  onMouseDown(): void {
    if (this.controller?.usesHoverPointerHighlight()) return;

    this.controller?.setActiveIndex(this.nxrMentionOption());
  }
}

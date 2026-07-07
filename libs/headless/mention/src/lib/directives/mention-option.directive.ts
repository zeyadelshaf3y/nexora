import { Directive, inject, input } from '@angular/core';

import type { MentionController } from '../internal/mention-controller.types';
import { NXR_MENTION_CONTROLLER } from '../internal/mention-panel-tokens';

/** Squared px movement allowed between touch start/end to count as a tap (not scroll). */
const TOUCH_TAP_MOVE_THRESHOLD_SQ = 10 * 10;

/**
 * Marks a mention suggestion row and wires pointer highlight when
 * `[nxrMentionPointerHighlight]="'hover'"` (default).
 *
 * On touch screens, `nxr-mention-panel-host` calls `preventDefault()` on `touchstart` so the
 * editor keeps focus — that suppresses the compatibility `mousedown` / `click` sequence.
 * This directive selects on `pointerup` for touch pointers so `(mousedown)="select(item)"` is not
 * required for mobile (desktop mouse still uses your `mousedown` handler).
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
    '(pointerdown)': 'onPointerDown($event)',
    '(pointerup)': 'onPointerUp($event)',
    '(pointercancel)': 'onPointerCancel()',
  },
})
export class MentionOptionDirective {
  private readonly controller = inject(NXR_MENTION_CONTROLLER, {
    optional: true,
  }) as MentionController<unknown> | null;

  /** Zero-based index of this option in `state.items`. */
  readonly nxrMentionOption = input.required<number>();

  private touchTapStart: { readonly x: number; readonly y: number } | null = null;

  onMouseEnter(): void {
    if (!this.controller?.usesHoverPointerHighlight()) return;

    this.controller.setActiveIndex(this.nxrMentionOption());
  }

  onMouseDown(): void {
    if (this.controller?.usesHoverPointerHighlight()) return;

    this.controller?.setActiveIndex(this.nxrMentionOption());
  }

  onPointerDown(event: PointerEvent): void {
    if (event.pointerType !== 'touch') return;

    this.touchTapStart = { x: event.clientX, y: event.clientY };

    if (this.controller && !this.controller.usesHoverPointerHighlight()) {
      this.controller.setActiveIndex(this.nxrMentionOption());
    }
  }

  onPointerUp(event: PointerEvent): void {
    if (event.pointerType !== 'touch' || !this.touchTapStart) return;

    const start = this.touchTapStart;
    this.touchTapStart = null;

    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;

    if (dx * dx + dy * dy > TOUCH_TAP_MOVE_THRESHOLD_SQ) return;

    this.selectOption();
  }

  onPointerCancel(): void {
    this.touchTapStart = null;
  }

  private selectOption(): void {
    if (!this.controller) return;

    const index = this.nxrMentionOption();
    const item = this.controller.panelState().items[index];

    if (item !== undefined) {
      this.controller.select(item);
    }
  }
}

import { Directive, ElementRef, effect, inject, input } from '@angular/core';

/**
 * Scrolls the host element into view whenever the bound expression becomes `true`.
 *
 * Place this on each option element and bind it to the active-index check so that
 * keyboard navigation keeps the highlighted row visible inside a scrollable panel:
 *
 * ```html
 * <div
 *   class="mention-option"
 *   [nxrMentionScrollIntoView]="state.activeIndex === $index"
 *   (mousedown)="select(item)"
 * >…</div>
 * ```
 */
@Directive({ selector: '[nxrMentionScrollIntoView]' })
export class MentionScrollIntoViewDirective {
  private readonly el = inject(ElementRef<HTMLElement>);

  readonly nxrMentionScrollIntoView = input<boolean>(false);

  constructor() {
    effect(() => {
      if (this.nxrMentionScrollIntoView()) {
        this.el.nativeElement.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }
    });
  }
}

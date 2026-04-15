import {
  type AfterViewInit,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
  Renderer2,
} from '@angular/core';
import { FOCUSABLE_SELECTOR, getActiveElement, safeFocus } from '@nexora-ui/core';

/**
 * Traps keyboard focus within the host element. When the user presses Tab (or Shift+Tab),
 * focus wraps between the first and last focusable elements inside the host.
 *
 * Use on modal containers (dialogs, drawers) to meet WCAG 2.4.3 focus order requirements.
 *
 * @example
 * ```html
 * <div nxrFocusTrap>
 *   <button>First</button>
 *   <input />
 *   <button>Last</button>
 * </div>
 * ```
 */
@Directive({
  selector: '[nxrFocusTrap]',
  standalone: true,
  exportAs: 'nxrFocusTrap',
})
export class FocusTrapDirective implements AfterViewInit {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly destroyRef = inject(DestroyRef);

  /** Whether the focus trap is active. Set to `false` to temporarily disable trapping. */
  readonly enabled = input<boolean>(true, { alias: 'nxrFocusTrapEnabled' });

  ngAfterViewInit(): void {
    const off = this.renderer.listen(this.host.nativeElement, 'keydown', (e: KeyboardEvent) =>
      this.handleKeydown(e),
    );

    this.destroyRef.onDestroy(off);
  }

  private handleKeydown(e: KeyboardEvent): void {
    if (e.key !== 'Tab' || !this.enabled()) return;

    const boundaries = this.getTrapBoundaries(this.host.nativeElement);
    if (!boundaries) return;
    const { first, last } = boundaries;
    const active = getActiveElement();

    if (!active) return;

    if (e.shiftKey) {
      if (active === first) {
        e.preventDefault();
        safeFocus(last);
      }
    } else {
      if (active === last) {
        e.preventDefault();
        safeFocus(first);
      }
    }
  }

  private getTrapBoundaries(root: HTMLElement): { first: HTMLElement; last: HTMLElement } | null {
    const nodes = root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    let first: HTMLElement | null = null;
    let last: HTMLElement | null = null;

    nodes.forEach((el) => {
      if (!this.isVisibleAndEnabled(el)) return;

      if (first === null) first = el;
      last = el;
    });

    if (first === null || last === null) return null;

    return { first, last };
  }

  private isVisibleAndEnabled(el: HTMLElement): boolean {
    if (el.tabIndex < 0) return false;
    if (el.matches(':disabled')) return false;
    if (el.closest('[inert]')) return false;
    if (el.closest('[aria-hidden="true"]')) return false;

    const style = getComputedStyle(el);

    return style.display !== 'none' && style.visibility !== 'hidden';
  }
}

import { FOCUSABLE_SELECTOR, getActiveElement, safeFocus } from '@nexora-ui/core';

import type { OverlayRef } from '../ref/overlay-ref';

import type { FocusStrategy } from './focus-strategy';

/**
 * Default focus strategy: focus first focusable in pane on open, restore previous activeElement on close.
 */
export class DefaultFocusStrategy implements FocusStrategy {
  private previousActiveElement: Element | null = null;

  focusOnOpen(ref: OverlayRef): void {
    this.previousActiveElement = getActiveElement();
    const pane = ref.getPaneElement();

    if (pane) {
      const first = pane.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);

      safeFocus(first ?? null);
    }
  }

  restoreOnClose(): void {
    safeFocus(this.previousActiveElement);

    this.previousActiveElement = null;
  }
}

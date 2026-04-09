import { getGlobal, listen } from '@nexora-ui/core';

import { CLOSE_REASON_SCROLL } from '../ref/close-reason';
import type { OverlayRef } from '../ref/overlay-ref';

import type { ScrollStrategy } from './scroll-strategy';

/**
 * Scroll strategy that closes the overlay when the user scrolls.
 * Listens to window scroll (and optionally a specific element).
 */
export class CloseOnScrollStrategy implements ScrollStrategy {
  private _cleanup: (() => void) | null = null;
  private _ref: OverlayRef | null = null;

  attach(ref: OverlayRef): void {
    this._ref = ref;
    const win = getGlobal();
    this._cleanup = listen(
      win ?? null,
      'scroll',
      () => this._ref?.close(CLOSE_REASON_SCROLL),
      true,
    );
  }

  detach(): void {
    if (this._cleanup) {
      this._cleanup();
      this._cleanup = null;
    }

    this._ref = null;
  }
}

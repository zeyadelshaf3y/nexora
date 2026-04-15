import type { OverlayRef } from '../ref/overlay-ref';

export interface ScrollStrategy {
  /** Called when the overlay attaches. Ref is provided for strategies that need it (e.g. close-on-scroll). */
  attach(ref?: OverlayRef): void;
  detach(): void;
}

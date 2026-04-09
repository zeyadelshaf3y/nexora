import type { OverlayRef } from '../ref/overlay-ref';

export interface FocusStrategy {
  focusOnOpen(ref?: OverlayRef): void;
  restoreOnClose(ref?: OverlayRef): void;
}

import type { FocusStrategy } from './focus-strategy';

/**
 * Focus strategy that does nothing: no focus on open, no restore on close.
 * Use for overlays that should not steal or trap focus (e.g. tooltips).
 */
export class NoopFocusStrategy implements FocusStrategy {
  focusOnOpen(): void {}
  restoreOnClose(): void {}
}

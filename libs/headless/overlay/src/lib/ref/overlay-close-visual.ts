import { transitionOverlayToClosingState } from './overlay-enter-animation';
import { waitForCloseAnimation } from './overlay-pane-styling';

/**
 * Close animation: run `beforeClosingClasses` (e.g. transform-origin), flip to closing classes,
 * then wait for CSS transitions / timeout.
 */
export function runOverlayCloseVisualTransition(
  pane: HTMLElement,
  backdrop: HTMLElement | null,
  durationMs: number,
  beforeClosingClasses: () => void,
): Promise<void> {
  beforeClosingClasses();
  transitionOverlayToClosingState(pane, backdrop);

  return waitForCloseAnimation(pane, backdrop, durationMs);
}

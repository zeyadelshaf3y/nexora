import type { OverlayRef } from '@nexora-ui/overlay';

/** Zero-duration close + strip enter animation on the pane so the next tooltip can hand off instantly. */
export function prepareTooltipPaneForHandoffClose(
  overlayRef: Pick<OverlayRef, 'setCloseAnimationDurationMs' | 'getPaneElement'>,
): void {
  overlayRef.setCloseAnimationDurationMs(0);
  const pane = overlayRef.getPaneElement();
  if (pane) {
    pane.style.transition = 'none';
    pane.style.animation = 'none';
  }
}

export function clearTooltipPaneInstantAnimationStyles(pane: HTMLElement | null | undefined): void {
  if (!pane) return;
  pane.style.removeProperty('transition');
  pane.style.removeProperty('animation');
}

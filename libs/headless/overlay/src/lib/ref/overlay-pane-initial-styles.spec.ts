import { applyInitialOverlayPaneAndBackdropStyles } from './overlay-pane-initial-styles';
import { PANE_CLASS, PANE_ENTERING_CLASS } from './overlay-pane-styling';

describe('applyInitialOverlayPaneAndBackdropStyles', () => {
  it('adds base pane classes and optional backdrop', () => {
    const pane = document.createElement('div');
    const backdrop = document.createElement('div');
    applyInitialOverlayPaneAndBackdropStyles(pane, backdrop, {
      hasBackdrop: true,
      positionStrategy: {} as never,
      scrollStrategy: {} as never,
      focusStrategy: {} as never,
    });

    expect(pane.classList.contains(PANE_CLASS)).toBe(true);
    expect(pane.classList.contains(PANE_ENTERING_CLASS)).toBe(true);
    expect(backdrop.classList.length).toBeGreaterThan(0);
  });
});

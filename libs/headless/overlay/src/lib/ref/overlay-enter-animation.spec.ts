import {
  transitionOverlayToClosingState,
  transitionOverlayToOpenState,
} from './overlay-enter-animation';
import {
  BACKDROP_CLASS,
  BACKDROP_CLOSING_CLASS,
  BACKDROP_ENTERING_CLASS,
  BACKDROP_OPEN_CLASS,
  PANE_CLASS,
  PANE_CLOSING_CLASS,
  PANE_ENTERING_CLASS,
  PANE_OPEN_CLASS,
} from './overlay-pane-styling';

function freshPaneAndBackdrop(): { pane: HTMLElement; backdrop: HTMLElement } {
  const pane = document.createElement('div');
  const backdrop = document.createElement('div');
  pane.classList.add(PANE_CLASS, PANE_ENTERING_CLASS);
  backdrop.classList.add(BACKDROP_CLASS, BACKDROP_ENTERING_CLASS);

  return { pane, backdrop };
}

describe('transitionOverlayToOpenState', () => {
  it('removes entering and adds open classes', () => {
    const { pane, backdrop } = freshPaneAndBackdrop();
    transitionOverlayToOpenState(pane, backdrop);

    expect(pane.classList.contains(PANE_ENTERING_CLASS)).toBe(false);
    expect(pane.classList.contains(PANE_OPEN_CLASS)).toBe(true);
    expect(backdrop.classList.contains(BACKDROP_ENTERING_CLASS)).toBe(false);
    expect(backdrop.classList.contains(BACKDROP_OPEN_CLASS)).toBe(true);
  });

  it('handles null backdrop', () => {
    const { pane } = freshPaneAndBackdrop();
    transitionOverlayToOpenState(pane, null);
    expect(pane.classList.contains(PANE_OPEN_CLASS)).toBe(true);
  });
});

describe('transitionOverlayToClosingState', () => {
  it('removes open and adds closing classes', () => {
    const { pane, backdrop } = freshPaneAndBackdrop();
    transitionOverlayToOpenState(pane, backdrop);
    transitionOverlayToClosingState(pane, backdrop);

    expect(pane.classList.contains(PANE_OPEN_CLASS)).toBe(false);
    expect(pane.classList.contains(PANE_CLOSING_CLASS)).toBe(true);
    expect(backdrop.classList.contains(BACKDROP_OPEN_CLASS)).toBe(false);
    expect(backdrop.classList.contains(BACKDROP_CLOSING_CLASS)).toBe(true);
  });
});

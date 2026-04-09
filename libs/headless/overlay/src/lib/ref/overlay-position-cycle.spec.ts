import { GlobalCenterStrategy } from '../position/global-center-strategy';
import { NoopScrollStrategy } from '../scroll/noop-scroll-strategy';
import { RepositionScrollStrategy } from '../scroll/reposition-scroll-strategy';

import {
  applyPaneMaxHeightAfterPosition,
  OVERLAY_POSITION_VIEWPORT_EDGE_PADDING,
  resetPaneMaxHeightBeforePositionMeasure,
  runOverlayPositionCycle,
  shouldFollowAnchorOffViewport,
} from './overlay-position-cycle';

describe('shouldFollowAnchorOffViewport', () => {
  const vp = new DOMRect(0, 0, 800, 600);
  const inside = new DOMRect(10, 10, 50, 50);

  it('is true for noop scroll strategy', () => {
    expect(
      shouldFollowAnchorOffViewport(
        {
          scrollStrategy: new NoopScrollStrategy(),
          maintainInViewport: true,
          anchor: document.createElement('div'),
        },
        vp,
        inside,
      ),
    ).toBe(true);
  });

  it('is false for reposition when maintainInViewport is not false', () => {
    expect(
      shouldFollowAnchorOffViewport(
        {
          scrollStrategy: new RepositionScrollStrategy(),
          maintainInViewport: true,
          anchor: document.createElement('div'),
        },
        vp,
        inside,
      ),
    ).toBe(false);
  });

  it('is false when anchor is unset', () => {
    expect(
      shouldFollowAnchorOffViewport(
        {
          scrollStrategy: new RepositionScrollStrategy(),
          maintainInViewport: false,
          anchor: undefined,
        },
        vp,
        new DOMRect(-9000, 0, 1, 1),
      ),
    ).toBe(false);
  });
});

describe('resetPaneMaxHeightBeforePositionMeasure', () => {
  it('no-op without anchor', () => {
    const pane = document.createElement('div');
    resetPaneMaxHeightBeforePositionMeasure(pane, false, () => new DOMRect(0, 0, 100, 200), '50vh');
    expect(pane.style.maxHeight).toBe('');
  });

  it('sets max-height from viewport height', () => {
    const pane = document.createElement('div');
    resetPaneMaxHeightBeforePositionMeasure(pane, true, () => new DOMRect(0, 0, 400, 300), '90vh');
    expect(pane.style.maxHeight).toBe('min(90vh, 300px)');
  });
});

describe('applyPaneMaxHeightAfterPosition', () => {
  it('uses viewport height when following off-screen', () => {
    const pane = document.createElement('div');
    const vp = new DOMRect(0, 0, 800, 600);
    applyPaneMaxHeightAfterPosition(
      pane,
      true,
      '80vh',
      50,
      vp,
      true,
      OVERLAY_POSITION_VIEWPORT_EDGE_PADDING,
    );
    expect(pane.style.maxHeight).toBe('min(80vh, 600px)');
  });

  it('clamps to space below pane top', () => {
    const pane = document.createElement('div');
    const vp = new DOMRect(0, 0, 800, 600);
    applyPaneMaxHeightAfterPosition(
      pane,
      true,
      undefined,
      400,
      vp,
      false,
      OVERLAY_POSITION_VIEWPORT_EDGE_PADDING,
    );
    expect(pane.style.maxHeight).toBe('200px');
  });
});

describe('runOverlayPositionCycle', () => {
  it('returns placement from strategy and applies pane position', () => {
    const pane = document.createElement('div');
    document.body.appendChild(pane);
    Object.defineProperty(pane, 'offsetWidth', { value: 100 });
    Object.defineProperty(pane, 'offsetHeight', { value: 40 });

    const strategy = new GlobalCenterStrategy();
    const placement = runOverlayPositionCycle(
      pane,
      {
        positionStrategy: strategy,
        scrollStrategy: new NoopScrollStrategy(),
        anchor: undefined,
      },
      {
        getViewportRect: () => new DOMRect(0, 0, 800, 600),
        getAnchorElement: () => undefined,
        currentPlacement: undefined,
      },
    );

    expect(placement).toBe('bottom');
    expect(pane.style.left).toMatch(/\d/);

    document.body.removeChild(pane);
  });
});

import { NoopFocusStrategy } from '../focus/noop-focus-strategy';
import { AnchoredStrategy } from '../position/anchored-strategy';
import { NoopScrollStrategy } from '../scroll/noop-scroll-strategy';
import { RepositionScrollStrategy } from '../scroll/reposition-scroll-strategy';

import { createAnchoredOverlayConfig } from './create-anchored-overlay-config';

describe('createAnchoredOverlayConfig', () => {
  const anchor = document.createElement('div');

  it('returns config with AnchoredStrategy and anchor', () => {
    const config = createAnchoredOverlayConfig({
      anchor,
      placement: 'bottom-start',
      offset: 8,
      clampToViewport: true,
      hasBackdrop: false,
      closePolicy: {},
      scrollStrategy: new NoopScrollStrategy(),
      focusStrategy: new NoopFocusStrategy(),
      closeAnimationDurationMs: 300,
    });

    expect(config.anchor).toBe(anchor);
    expect(config.transformOriginElement).toBe(anchor);
    expect(config.positionStrategy).toBeInstanceOf(AnchoredStrategy);
    expect(config.hasBackdrop).toBe(false);
    expect(config.closeAnimationDurationMs).toBe(300);
  });

  it('passes placement and options to AnchoredStrategy', () => {
    const config = createAnchoredOverlayConfig({
      anchor,
      placement: 'top-end',
      offset: 12,
      clampToViewport: false,
      preferredPlacementOnly: true,
      hasBackdrop: false,
      closePolicy: {},
      scrollStrategy: new NoopScrollStrategy(),
      focusStrategy: new NoopFocusStrategy(),
      closeAnimationDurationMs: 0,
    });

    expect(config.positionStrategy).toBeInstanceOf(AnchoredStrategy);
    expect(config.anchor).toBe(anchor);
  });

  it('includes optional panelClass and arrowSize when provided', () => {
    const config = createAnchoredOverlayConfig({
      anchor,
      placement: 'bottom',
      offset: 8,
      clampToViewport: true,
      hasBackdrop: false,
      closePolicy: {},
      scrollStrategy: new NoopScrollStrategy(),
      focusStrategy: new NoopFocusStrategy(),
      closeAnimationDurationMs: 150,
      panelClass: 'my-panel',
      arrowSize: { width: 10, height: 5 },
    });

    expect(config.panelClass).toBe('my-panel');
    expect(config.arrowSize).toEqual({ width: 10, height: 5 });
  });

  it('with NoopScrollStrategy first apply uses best-fit so panel opens in view', () => {
    const viewportRect = new DOMRect(0, 0, 400, 600);
    const anchorBelowViewport = new DOMRect(100, 700, 50, 30);

    const config = createAnchoredOverlayConfig({
      anchor,
      placement: 'bottom-start',
      offset: 8,
      clampToViewport: true,
      hasBackdrop: false,
      closePolicy: {},
      scrollStrategy: new NoopScrollStrategy(),
      focusStrategy: new NoopFocusStrategy(),
      closeAnimationDurationMs: 0,
    });

    const result = config.positionStrategy.apply({
      overlaySize: { width: 100, height: 80 },
      viewportRect,
      anchorRect: anchorBelowViewport,
      dir: 'ltr',
    });

    // First apply: best-fit placement so panel is in view (e.g. top-end when anchor is below viewport).
    expect(result.placement).not.toBe('bottom-start');
    expect(result.y).toBeGreaterThanOrEqual(0);
    expect(result.y + 80).toBeLessThanOrEqual(600);
    expect(result.x).toBeGreaterThanOrEqual(0);
    expect(result.x + 100).toBeLessThanOrEqual(400);
  });

  it('with NoopScrollStrategy second apply sticks to trigger (no clamp)', () => {
    const viewportRect = new DOMRect(0, 0, 400, 600);
    const anchorBelowViewport = new DOMRect(100, 700, 50, 30);
    const ctx = {
      overlaySize: { width: 100, height: 80 },
      viewportRect,
      anchorRect: anchorBelowViewport,
      dir: 'ltr' as const,
    };

    const config = createAnchoredOverlayConfig({
      anchor,
      placement: 'bottom-start',
      offset: 8,
      clampToViewport: true,
      hasBackdrop: false,
      closePolicy: {},
      scrollStrategy: new NoopScrollStrategy(),
      focusStrategy: new NoopFocusStrategy(),
      closeAnimationDurationMs: 0,
    });

    const first = config.positionStrategy.apply(ctx);
    const second = config.positionStrategy.apply(ctx);

    // Second apply: same placement as first, position sticks to trigger (unclamped).
    expect(second.placement).toBe(first.placement);
    // First apply picks a placement that fits (e.g. top-end) → second apply uses it: y = anchor.top - height - offset, x = anchor.right - width for top-end.
    expect(second.y).toBe(700 - 80 - 8);
    expect(second.x).toBe(100 + 50 - 100); // top-end: anchor right - overlay width
  });

  it('with NoopScrollStrategy when overlay size changes re-fits and clamps so panel repositions into viewport', () => {
    const viewportRect = new DOMRect(0, 0, 400, 600);
    const anchorBelowViewport = new DOMRect(100, 700, 50, 30);

    const config = createAnchoredOverlayConfig({
      anchor,
      placement: 'bottom-start',
      offset: 8,
      clampToViewport: true,
      hasBackdrop: false,
      closePolicy: {},
      scrollStrategy: new NoopScrollStrategy(),
      focusStrategy: new NoopFocusStrategy(),
      closeAnimationDurationMs: 0,
    });

    const strategy = config.positionStrategy;
    strategy.apply({
      overlaySize: { width: 100, height: 80 },
      viewportRect,
      anchorRect: anchorBelowViewport,
      dir: 'ltr',
    });
    strategy.apply({
      overlaySize: { width: 100, height: 80 },
      viewportRect,
      anchorRect: anchorBelowViewport,
      dir: 'ltr',
    });
    const afterResize = strategy.apply({
      overlaySize: { width: 100, height: 300 },
      viewportRect,
      anchorRect: anchorBelowViewport,
      dir: 'ltr',
    });

    expect(afterResize.placement).toBeDefined();
    expect(afterResize.y).toBeGreaterThanOrEqual(0);
    expect(afterResize.y + 300).toBeLessThanOrEqual(600);
    expect(afterResize.x).toBeGreaterThanOrEqual(0);
    expect(afterResize.x + 100).toBeLessThanOrEqual(400);
  });

  it('with RepositionScrollStrategy and maintainInViewport true clamps to viewport', () => {
    const viewportRect = new DOMRect(0, 0, 400, 600);
    const anchorBelowViewport = new DOMRect(100, 700, 50, 30);

    const config = createAnchoredOverlayConfig({
      anchor,
      placement: 'bottom-start',
      offset: 8,
      clampToViewport: true,
      hasBackdrop: false,
      closePolicy: {},
      scrollStrategy: new RepositionScrollStrategy(),
      maintainInViewport: true,
      focusStrategy: new NoopFocusStrategy(),
      closeAnimationDurationMs: 0,
    });

    const result = config.positionStrategy.apply({
      overlaySize: { width: 100, height: 80 },
      viewportRect,
      anchorRect: anchorBelowViewport,
      dir: 'ltr',
    });

    expect(result.y).toBeLessThanOrEqual(600 - 80);
    expect(result.y).toBeGreaterThanOrEqual(0);
    expect(result.x).toBeGreaterThanOrEqual(0);
    expect(result.x + 100).toBeLessThanOrEqual(400);
  });

  it('with RepositionScrollStrategy and maintainInViewport false follows trigger off-screen', () => {
    const viewportRect = new DOMRect(0, 0, 400, 600);
    const anchorBelowViewport = new DOMRect(100, 700, 50, 30);

    const config = createAnchoredOverlayConfig({
      anchor,
      placement: 'bottom-start',
      offset: 8,
      clampToViewport: true,
      hasBackdrop: false,
      closePolicy: {},
      scrollStrategy: new RepositionScrollStrategy(),
      maintainInViewport: false,
      focusStrategy: new NoopFocusStrategy(),
      closeAnimationDurationMs: 0,
    });

    const result = config.positionStrategy.apply({
      overlaySize: { width: 100, height: 80 },
      viewportRect,
      anchorRect: anchorBelowViewport,
      dir: 'ltr',
    });

    expect(result.placement).toBe('bottom-start');
    expect(result.y).toBe(700 + 30 + 8);
    expect(result.x).toBe(100);
  });
});

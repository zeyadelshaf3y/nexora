import { AnchoredStrategy } from './anchored-strategy';

const viewportRect = new DOMRect(0, 0, 800, 600);
const overlaySize = { width: 200, height: 100 };

describe('AnchoredStrategy', () => {
  describe('apply', () => {
    it('returns bottom-start centered when no anchor', () => {
      const strategy = new AnchoredStrategy({ placement: 'bottom-start', clampToViewport: true });
      const result = strategy.apply({
        overlaySize,
        viewportRect,
        anchorRect: undefined,
        dir: 'ltr',
      });
      expect(result.placement).toBe('bottom-start');
      expect(result.x).toBeGreaterThanOrEqual(0);
      expect(result.y).toBeGreaterThanOrEqual(0);
      expect(result.x + overlaySize.width).toBeLessThanOrEqual(viewportRect.width);
      expect(result.y + overlaySize.height).toBeLessThanOrEqual(viewportRect.height);
    });

    it('uses preferred placement when preferredPlacementOnly is true', () => {
      const anchorRect = new DOMRect(100, 200, 80, 30);
      const strategy = new AnchoredStrategy({
        placement: 'top-end',
        offset: 8,
        preferredPlacementOnly: true,
        clampToViewport: true,
      });
      const result = strategy.apply({
        overlaySize,
        viewportRect,
        anchorRect,
        dir: 'ltr',
      });
      expect(result.placement).toBe('top-end');
      expect(result.panePlacement).toBe('top-end');
      expect(result.transformOrigin).toBe('right bottom');
    });

    it('returns RTL-aware transformOrigin for start placement', () => {
      const anchorRect = new DOMRect(400, 300, 80, 30);
      const strategyLtr = new AnchoredStrategy({
        placement: 'start',
        offset: 8,
        preferredPlacementOnly: true,
        clampToViewport: false,
      });
      const strategyRtl = new AnchoredStrategy({
        placement: 'start',
        offset: 8,
        preferredPlacementOnly: true,
        clampToViewport: false,
      });
      const resultLtr = strategyLtr.apply({
        overlaySize,
        viewportRect,
        anchorRect,
        dir: 'ltr',
      });
      const resultRtl = strategyRtl.apply({
        overlaySize,
        viewportRect,
        anchorRect,
        dir: 'rtl',
      });
      expect(resultLtr.transformOrigin).toBe('right center');
      expect(resultRtl.transformOrigin).toBe('left center');
    });

    it('includes arrowOffset and arrowSide for bottom placement', () => {
      const anchorRect = new DOMRect(100, 50, 80, 30);
      const strategy = new AnchoredStrategy({
        placement: 'bottom',
        offset: 8,
        preferredPlacementOnly: true,
        clampToViewport: false,
      });
      const result = strategy.apply({
        overlaySize,
        viewportRect,
        anchorRect,
        dir: 'ltr',
      });
      expect(result.arrowSide).toBe('top');
      expect(result.arrowOffset).toBeDefined();
      expect(result.arrowOffset?.x).toBeGreaterThanOrEqual(0);
      expect(result.arrowOffset?.y).toBe(0);
    });

    it('clamps position to viewport when clampToViewport is true', () => {
      const anchorRect = new DOMRect(0, 0, 50, 50);
      const strategy = new AnchoredStrategy({
        placement: 'top-start',
        offset: 8,
        preferredPlacementOnly: true,
        clampToViewport: true,
      });
      const result = strategy.apply({
        overlaySize,
        viewportRect,
        anchorRect,
        dir: 'ltr',
      });
      expect(result.x).toBeGreaterThanOrEqual(0);
      expect(result.y).toBeGreaterThanOrEqual(0);
      expect(result.x + overlaySize.width).toBeLessThanOrEqual(viewportRect.width);
      expect(result.y + overlaySize.height).toBeLessThanOrEqual(viewportRect.height);
    });

    it('vertical: keeps [bottom*] when anchor off top; keeps [top*] when anchor off bottom; else repositions', () => {
      const anchorAboveViewport = new DOMRect(100, -50, 80, 30);
      const anchorBelowViewport = new DOMRect(100, 620, 80, 30);

      const strategyBottom = new AnchoredStrategy({
        placement: 'bottom-start',
        offset: 8,
        preferredPlacementOnly: false,
        clampToViewport: true,
      });
      const resultAbove = strategyBottom.apply({
        overlaySize,
        viewportRect,
        anchorRect: anchorAboveViewport,
        dir: 'ltr',
      });
      expect(resultAbove.placement).toBe('bottom-start');

      const resultBelow = strategyBottom.apply({
        overlaySize,
        viewportRect,
        anchorRect: anchorBelowViewport,
        dir: 'ltr',
      });
      expect(['top-start', 'top', 'top-end']).toContain(resultBelow.placement);

      const strategyTop = new AnchoredStrategy({
        placement: 'top-start',
        offset: 8,
        preferredPlacementOnly: false,
        clampToViewport: true,
      });
      const resultTopWhenAnchorBelow = strategyTop.apply({
        overlaySize,
        viewportRect,
        anchorRect: anchorBelowViewport,
        dir: 'ltr',
      });
      expect(resultTopWhenAnchorBelow.placement).toBe('top-start');
    });

    it('repositions to end side (end-start, end, end-end) when anchor is off start and placement was start', () => {
      const strategy = new AnchoredStrategy({
        placement: 'bottom-start',
        offset: 8,
        preferredPlacementOnly: false,
        clampToViewport: true,
      });
      const anchorLeftOfViewport = new DOMRect(-100, 200, 80, 30);
      const result = strategy.apply({
        overlaySize,
        viewportRect,
        anchorRect: anchorLeftOfViewport,
        dir: 'ltr',
      });
      expect(['end-start', 'end', 'end-end']).toContain(result.placement);
    });

    it('keeps [start*] when anchor is off end and placement was start (no reposition)', () => {
      const strategy = new AnchoredStrategy({
        placement: 'start-top',
        offset: 8,
        preferredPlacementOnly: false,
        clampToViewport: true,
      });
      const anchorRightOfViewport = new DOMRect(850, 200, 80, 30);
      const result = strategy.apply({
        overlaySize,
        viewportRect,
        anchorRect: anchorRightOfViewport,
        dir: 'ltr',
      });
      expect(result.placement).toBe('start-top');
    });

    it('repositions to start side (start-top, start, start-end) when anchor is off end and placement was end', () => {
      const strategy = new AnchoredStrategy({
        placement: 'bottom-end',
        offset: 8,
        preferredPlacementOnly: false,
        clampToViewport: true,
      });
      const anchorRightOfViewport = new DOMRect(850, 200, 80, 30);
      const result = strategy.apply({
        overlaySize,
        viewportRect,
        anchorRect: anchorRightOfViewport,
        dir: 'ltr',
      });
      expect(['start-top', 'start', 'start-end']).toContain(result.placement);
    });

    describe('stickWhenAnchorFullyOutOfViewport', () => {
      it('does not clamp position when anchor is fully out of viewport (panel follows trigger)', () => {
        const strategy = new AnchoredStrategy({
          placement: 'bottom-start',
          offset: 8,
          preferredPlacementOnly: false,
          clampToViewport: true,
          stickWhenAnchorFullyOutOfViewport: true,
        });
        const anchorBelowViewport = new DOMRect(100, 700, 50, 30);
        const result = strategy.apply({
          overlaySize,
          viewportRect,
          anchorRect: anchorBelowViewport,
          dir: 'ltr',
        });
        expect(result.placement).toBe('bottom-start');
        expect(result.y).toBe(700 + 30 + 8);
        expect(result.x).toBe(100);
      });

      it('preserves current placement when anchor goes fully out (avoids panel jumping back to preferred)', () => {
        const strategy = new AnchoredStrategy({
          placement: 'bottom-start',
          offset: 8,
          preferredPlacementOnly: false,
          clampToViewport: true,
          stickWhenAnchorFullyOutOfViewport: true,
        });
        const anchorAboveViewport = new DOMRect(100, -50, 50, 30);
        const result = strategy.apply({
          overlaySize,
          viewportRect,
          anchorRect: anchorAboveViewport,
          dir: 'ltr',
          currentPlacement: 'top-start',
        });
        expect(result.placement).toBe('top-start');
        expect(result.y).toBe(anchorAboveViewport.top - overlaySize.height - 8);
      });
    });

    describe('noop mode (preferredPlacementOnly, no clamp, no stick)', () => {
      it('first apply uses best-fit so panel opens in view; second apply sticks to that placement', () => {
        const strategy = new AnchoredStrategy({
          placement: 'bottom-start',
          offset: 8,
          preferredPlacementOnly: true,
          clampToViewport: false,
        });
        const anchorBelowViewport = new DOMRect(100, 700, 50, 30);
        const ctx = {
          overlaySize,
          viewportRect,
          anchorRect: anchorBelowViewport,
          dir: 'ltr' as const,
        };
        const first = strategy.apply(ctx);
        const second = strategy.apply(ctx);
        expect(first.placement).not.toBe('bottom-start');
        expect(first.y).toBeGreaterThanOrEqual(0);
        expect(first.y + overlaySize.height).toBeLessThanOrEqual(viewportRect.height);
        expect(second.placement).toBe(first.placement);
        expect(second.y).toBe(700 - overlaySize.height - 8);
      });

      it('detach() resets state so next apply gets best-fit again', () => {
        const strategy = new AnchoredStrategy({
          placement: 'bottom-start',
          offset: 8,
          preferredPlacementOnly: true,
          clampToViewport: false,
        });
        const anchorBelowViewport = new DOMRect(100, 700, 50, 30);
        const ctx = {
          overlaySize,
          viewportRect,
          anchorRect: anchorBelowViewport,
          dir: 'ltr' as const,
        };
        strategy.apply(ctx);
        strategy.detach();
        const afterDetach = strategy.apply(ctx);
        expect(afterDetach.placement).not.toBe('bottom-start');
        expect(afterDetach.y).toBeGreaterThanOrEqual(0);
      });
    });
  });
});

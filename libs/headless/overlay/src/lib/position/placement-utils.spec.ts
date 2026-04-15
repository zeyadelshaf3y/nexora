import {
  getTransformOriginKeyword,
  getTriggerOriginPoint,
  isAnchorFullyInsideViewport,
  isAnchorFullyOutOfViewport,
} from './placement-utils';
import type { Placement } from './position-result';

describe('placement-utils', () => {
  const triggerRect = new DOMRect(100, 50, 80, 30);

  describe('getTriggerOriginPoint', () => {
    it('returns top-start as left+top in LTR', () => {
      const p = getTriggerOriginPoint(triggerRect, 'top-start', 'ltr');
      expect(p.x).toBe(100);
      expect(p.y).toBe(50);
    });

    it('returns top-start as right+top in RTL', () => {
      const p = getTriggerOriginPoint(triggerRect, 'top-start', 'rtl');
      expect(p.x).toBe(180);
      expect(p.y).toBe(50);
    });

    it('returns top as center X and top Y', () => {
      const p = getTriggerOriginPoint(triggerRect, 'top', 'ltr');
      expect(p.x).toBe(140);
      expect(p.y).toBe(50);
    });

    it('returns bottom-end as right+bottom in LTR', () => {
      const p = getTriggerOriginPoint(triggerRect, 'bottom-end', 'ltr');
      expect(p.x).toBe(180);
      expect(p.y).toBe(80);
    });

    it('returns start as left edge in LTR', () => {
      const p = getTriggerOriginPoint(triggerRect, 'start', 'ltr');
      expect(p.x).toBe(100);
      expect(p.y).toBe(65);
    });

    it('returns end as right edge in RTL', () => {
      const p = getTriggerOriginPoint(triggerRect, 'end', 'rtl');
      expect(p.x).toBe(100);
      expect(p.y).toBe(65);
    });
  });

  describe('getTransformOriginKeyword', () => {
    it('returns left bottom for top-start in LTR', () => {
      expect(getTransformOriginKeyword('top-start', 'ltr')).toBe('left bottom');
    });

    it('returns right bottom for top-start in RTL', () => {
      expect(getTransformOriginKeyword('top-start', 'rtl')).toBe('right bottom');
    });

    it('returns center bottom for top', () => {
      expect(getTransformOriginKeyword('top', 'ltr')).toBe('center bottom');
      expect(getTransformOriginKeyword('top', 'rtl')).toBe('center bottom');
    });

    it('returns right top for bottom-end in LTR', () => {
      expect(getTransformOriginKeyword('bottom-end', 'ltr')).toBe('right top');
    });

    it('returns left top for bottom-end in RTL', () => {
      expect(getTransformOriginKeyword('bottom-end', 'rtl')).toBe('left top');
    });

    it('returns right center for start in LTR', () => {
      expect(getTransformOriginKeyword('start', 'ltr')).toBe('right center');
    });

    it('returns left center for start in RTL', () => {
      expect(getTransformOriginKeyword('start', 'rtl')).toBe('left center');
    });

    it('covers all 12 placements with RTL flip where expected', () => {
      const placements: Placement[] = [
        'top-start',
        'top',
        'top-end',
        'bottom-start',
        'bottom',
        'bottom-end',
        'start-top',
        'start',
        'start-end',
        'end-start',
        'end',
        'end-end',
      ];

      for (const placement of placements) {
        const ltr = getTransformOriginKeyword(placement, 'ltr');
        const rtl = getTransformOriginKeyword(placement, 'rtl');
        expect(ltr).toBeTruthy();
        expect(rtl).toBeTruthy();
        if (placement.includes('start') || placement.includes('end')) {
          expect(ltr).not.toBe(rtl);
        }
      }
    });
  });

  describe('isAnchorFullyInsideViewport', () => {
    const viewport = new DOMRect(0, 0, 400, 600);
    const padding = 10;

    it('returns true when anchor is fully inside padded viewport', () => {
      const anchor = new DOMRect(20, 20, 50, 30);
      expect(isAnchorFullyInsideViewport(anchor, viewport, padding)).toBe(true);
    });

    it('returns false when anchor touches or crosses left edge', () => {
      const anchor = new DOMRect(5, 20, 50, 30);
      expect(isAnchorFullyInsideViewport(anchor, viewport, padding)).toBe(false);
    });

    it('returns false when anchor is outside viewport', () => {
      const anchor = new DOMRect(500, 200, 50, 30);
      expect(isAnchorFullyInsideViewport(anchor, viewport, padding)).toBe(false);
    });
  });

  describe('isAnchorFullyOutOfViewport', () => {
    const viewport = new DOMRect(0, 0, 400, 600);
    const padding = 0;

    it('returns false when anchor overlaps viewport', () => {
      const anchor = new DOMRect(100, 200, 50, 30);
      expect(isAnchorFullyOutOfViewport(anchor, viewport, padding)).toBe(false);
    });

    it('returns true when anchor is fully above viewport', () => {
      const anchor = new DOMRect(100, -50, 50, 30);
      expect(isAnchorFullyOutOfViewport(anchor, viewport, padding)).toBe(true);
    });

    it('returns true when anchor is fully below viewport', () => {
      const anchor = new DOMRect(100, 620, 50, 30);
      expect(isAnchorFullyOutOfViewport(anchor, viewport, padding)).toBe(true);
    });

    it('returns true when anchor is fully to the left of viewport', () => {
      const anchor = new DOMRect(-100, 200, 50, 30);
      expect(isAnchorFullyOutOfViewport(anchor, viewport, padding)).toBe(true);
    });

    it('returns true when anchor is fully to the right of viewport', () => {
      const anchor = new DOMRect(450, 200, 50, 30);
      expect(isAnchorFullyOutOfViewport(anchor, viewport, padding)).toBe(true);
    });

    it('respects padding', () => {
      const anchor = new DOMRect(0, 0, 10, 10);
      expect(isAnchorFullyOutOfViewport(anchor, viewport, 0)).toBe(false);
      expect(isAnchorFullyOutOfViewport(anchor, viewport, 20)).toBe(true);
    });
  });
});

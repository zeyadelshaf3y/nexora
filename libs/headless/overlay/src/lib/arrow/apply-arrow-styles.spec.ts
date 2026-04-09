import {
  applyArrowStyles,
  clearArrowStyles,
  DEFAULT_ARROW_HEIGHT,
  DEFAULT_ARROW_WIDTH,
  isAnchorInViewport,
} from './apply-arrow-styles';

function pxToNum(value: string): number {
  return parseFloat(value.replace('px', ''));
}

describe('apply-arrow-styles', () => {
  describe('DEFAULT_ARROW_WIDTH / DEFAULT_ARROW_HEIGHT', () => {
    it('exports default dimensions 12×6', () => {
      expect(DEFAULT_ARROW_WIDTH).toBe(12);
      expect(DEFAULT_ARROW_HEIGHT).toBe(6);
    });
  });

  describe('applyArrowStyles', () => {
    let pane: HTMLElement;

    beforeEach(() => {
      pane = document.createElement('div');
    });

    it('sets --nxr-arrow-x and --nxr-arrow-y with top side offset', () => {
      applyArrowStyles({
        pane,
        arrowOffset: { x: 50, y: 0 },
        arrowSide: 'top',
        arrowSize: { width: 12, height: 6 },
        anchorInViewport: true,
      });
      expect(pane.style.getPropertyValue('--nxr-arrow-x')).toBe('44px');
      expect(pane.style.getPropertyValue('--nxr-arrow-y')).toBe('-5px');
      expect(pane.style.getPropertyValue('--nxr-arrow-visible')).toBe('visible');
      expect(pane.style.getPropertyValue('--nxr-arrow-side')).toBe('top');
      expect(pane.style.getPropertyValue('--nxr-arrow-rotate')).toBe('0deg');
      expect(pane.style.getPropertyValue('--nxr-arrow-width')).toBe('12px');
      expect(pane.style.getPropertyValue('--nxr-arrow-height')).toBe('6px');
      expect(pane.style.overflow).toBe('visible');
    });

    it('sets bottom side offset', () => {
      applyArrowStyles({
        pane,
        arrowOffset: { x: 50, y: 100 },
        arrowSide: 'bottom',
        arrowSize: { width: 12, height: 6 },
        anchorInViewport: true,
      });
      expect(pane.style.getPropertyValue('--nxr-arrow-x')).toBe('44px');
      expect(pane.style.getPropertyValue('--nxr-arrow-y')).toBe('99px');
      expect(pane.style.getPropertyValue('--nxr-arrow-rotate')).toBe('180deg');
    });

    it('sets start side offsets', () => {
      applyArrowStyles({
        pane,
        arrowOffset: { x: 0, y: 20 },
        arrowSide: 'start',
        arrowSize: { width: 12, height: 6 },
        anchorInViewport: true,
      });
      expect(pane.style.getPropertyValue('--nxr-arrow-x')).toBe('-8px');
      expect(pane.style.getPropertyValue('--nxr-arrow-y')).toBe('17px');
      expect(pane.style.getPropertyValue('--nxr-arrow-rotate')).toBe('-90deg');
    });

    it('sets end side offsets', () => {
      applyArrowStyles({
        pane,
        arrowOffset: { x: 200, y: 20 },
        arrowSide: 'end',
        arrowSize: { width: 12, height: 6 },
        anchorInViewport: true,
      });
      expect(pane.style.getPropertyValue('--nxr-arrow-x')).toBe('196px');
      expect(pane.style.getPropertyValue('--nxr-arrow-y')).toBe('17px');
      expect(pane.style.getPropertyValue('--nxr-arrow-rotate')).toBe('90deg');
    });

    it('sets --nxr-arrow-visible to hidden when anchor is out of viewport', () => {
      applyArrowStyles({
        pane,
        arrowOffset: { x: 50, y: 0 },
        arrowSide: 'top',
        arrowSize: { width: 12, height: 6 },
        anchorInViewport: false,
      });
      expect(pane.style.getPropertyValue('--nxr-arrow-visible')).toBe('hidden');
    });

    describe('clamping to panel bounds', () => {
      let widePane: HTMLElement;

      beforeEach(() => {
        widePane = document.createElement('div');
        Object.defineProperty(widePane, 'offsetWidth', { value: 100, configurable: true });
        Object.defineProperty(widePane, 'offsetHeight', { value: 60, configurable: true });
      });

      it('clamps arrow X so it does not exceed panel left edge (top side)', () => {
        applyArrowStyles({
          pane: widePane,
          arrowOffset: { x: 0, y: 0 },
          arrowSide: 'top',
          arrowSize: { width: 12, height: 6 },
          anchorInViewport: true,
        });
        // arrowOffset.x clamped from 0 → 6 (halfW), then offsetArrowPosition: 6 - 6 = 0
        expect(pxToNum(widePane.style.getPropertyValue('--nxr-arrow-x'))).toBeGreaterThanOrEqual(0);
      });

      it('clamps arrow X so it does not exceed panel right edge (top side)', () => {
        applyArrowStyles({
          pane: widePane,
          arrowOffset: { x: 200, y: 0 },
          arrowSide: 'top',
          arrowSize: { width: 12, height: 6 },
          anchorInViewport: true,
        });
        // arrowOffset.x clamped from 200 → 94 (100 - 6), then offsetArrowPosition: 94 - 6 = 88
        const x = pxToNum(widePane.style.getPropertyValue('--nxr-arrow-x'));
        expect(x + 12).toBeLessThanOrEqual(100); // arrow right edge within panel
      });

      it('clamps arrow Y so it does not exceed panel top edge (start side)', () => {
        applyArrowStyles({
          pane: widePane,
          arrowOffset: { x: 0, y: 0 },
          arrowSide: 'start',
          arrowSize: { width: 12, height: 6 },
          anchorInViewport: true,
        });
        const y = pxToNum(widePane.style.getPropertyValue('--nxr-arrow-y'));
        expect(y).toBeGreaterThanOrEqual(-3); // visual center within panel
      });

      it('clamps arrow Y so it does not exceed panel bottom edge (end side)', () => {
        applyArrowStyles({
          pane: widePane,
          arrowOffset: { x: 100, y: 200 },
          arrowSide: 'end',
          arrowSize: { width: 12, height: 6 },
          anchorInViewport: true,
        });
        const y = pxToNum(widePane.style.getPropertyValue('--nxr-arrow-y'));
        expect(y + 6).toBeLessThanOrEqual(60); // arrow bottom edge within panel
      });

      it('skips clamping when panel is smaller than arrow', () => {
        const tinyPane = document.createElement('div');
        Object.defineProperty(tinyPane, 'offsetWidth', { value: 8, configurable: true });
        Object.defineProperty(tinyPane, 'offsetHeight', { value: 4, configurable: true });

        applyArrowStyles({
          pane: tinyPane,
          arrowOffset: { x: 50, y: 0 },
          arrowSide: 'top',
          arrowSize: { width: 12, height: 6 },
          anchorInViewport: true,
        });
        // No clamping when paneWidth (8) <= pad*2, so raw offset passes through
        expect(pxToNum(tinyPane.style.getPropertyValue('--nxr-arrow-x'))).toBe(44); // 50 - 6
      });
    });

    describe('border-radius edge padding', () => {
      let roundedPane: HTMLElement;
      let getComputedStyleSpy: ReturnType<typeof vi.spyOn>;

      beforeEach(() => {
        roundedPane = document.createElement('div');
        Object.defineProperty(roundedPane, 'offsetWidth', { value: 100, configurable: true });
        Object.defineProperty(roundedPane, 'offsetHeight', { value: 60, configurable: true });
        getComputedStyleSpy = vi.spyOn(window, 'getComputedStyle').mockReturnValue({
          borderTopLeftRadius: '10px',
          borderTopRightRadius: '10px',
          borderBottomLeftRadius: '10px',
          borderBottomRightRadius: '10px',
        } as CSSStyleDeclaration);
      });

      afterEach(() => {
        getComputedStyleSpy.mockRestore();
      });

      it('pushes arrow inward by border-radius from left edge (top side)', () => {
        applyArrowStyles({
          pane: roundedPane,
          arrowOffset: { x: 0, y: 0 },
          arrowSide: 'top',
          arrowSize: { width: 12, height: 6 },
          anchorInViewport: true,
        });
        // edgePadding = 10, pad = 6 + 10 = 16
        // x clamped from 0 → 16, then offsetArrowPosition: 16 - 6 = 10
        const x = pxToNum(roundedPane.style.getPropertyValue('--nxr-arrow-x'));
        expect(x).toBe(10);
      });

      it('pushes arrow inward by border-radius from right edge (top side)', () => {
        applyArrowStyles({
          pane: roundedPane,
          arrowOffset: { x: 200, y: 0 },
          arrowSide: 'top',
          arrowSize: { width: 12, height: 6 },
          anchorInViewport: true,
        });
        // x clamped from 200 → 84 (100 - 16), then offsetArrowPosition: 84 - 6 = 78
        const x = pxToNum(roundedPane.style.getPropertyValue('--nxr-arrow-x'));
        expect(x).toBe(78);
        expect(x + 12).toBeLessThanOrEqual(100 - 10);
      });

      it('pushes arrow inward by border-radius on Y axis (start side)', () => {
        applyArrowStyles({
          pane: roundedPane,
          arrowOffset: { x: 0, y: 0 },
          arrowSide: 'start',
          arrowSize: { width: 12, height: 6 },
          anchorInViewport: true,
        });
        // edgePadding = 10, pad = 6 + 10 = 16
        // y clamped from 0 → 16, then offsetArrowPosition(start): y - ah/2 = 16 - 3 = 13
        const y = pxToNum(roundedPane.style.getPropertyValue('--nxr-arrow-y'));
        expect(y).toBe(13);
      });

      it('uses largest corner radius as padding', () => {
        getComputedStyleSpy.mockReturnValue({
          borderTopLeftRadius: '4px',
          borderTopRightRadius: '16px',
          borderBottomLeftRadius: '8px',
          borderBottomRightRadius: '2px',
        } as CSSStyleDeclaration);

        applyArrowStyles({
          pane: roundedPane,
          arrowOffset: { x: 0, y: 0 },
          arrowSide: 'top',
          arrowSize: { width: 12, height: 6 },
          anchorInViewport: true,
        });
        // max radius = 16, pad = 6 + 16 = 22
        // x clamped from 0 → 22, then offsetArrowPosition: 22 - 6 = 16
        const x = pxToNum(roundedPane.style.getPropertyValue('--nxr-arrow-x'));
        expect(x).toBe(16);
      });

      it('falls back to 0 padding when border-radius is not set', () => {
        getComputedStyleSpy.mockReturnValue({
          borderTopLeftRadius: '',
          borderTopRightRadius: '',
          borderBottomLeftRadius: '',
          borderBottomRightRadius: '',
        } as CSSStyleDeclaration);

        applyArrowStyles({
          pane: roundedPane,
          arrowOffset: { x: 0, y: 0 },
          arrowSide: 'top',
          arrowSize: { width: 12, height: 6 },
          anchorInViewport: true,
        });
        // edgePadding = 0, pad = 6
        // x clamped from 0 → 6, then offsetArrowPosition: 6 - 6 = 0
        const x = pxToNum(roundedPane.style.getPropertyValue('--nxr-arrow-x'));
        expect(x).toBe(0);
      });
    });
  });

  describe('clearArrowStyles', () => {
    it('removes all arrow CSS variables and overflow', () => {
      const pane = document.createElement('div');
      pane.style.setProperty('--nxr-arrow-x', '10px');
      pane.style.setProperty('--nxr-arrow-y', '20px');
      pane.style.setProperty('--nxr-arrow-side', 'top');
      pane.style.setProperty('--nxr-arrow-rotate', '0deg');
      pane.style.setProperty('--nxr-arrow-visible', 'visible');
      pane.style.setProperty('--nxr-arrow-width', '12px');
      pane.style.setProperty('--nxr-arrow-height', '6px');
      pane.style.overflow = 'visible';

      clearArrowStyles(pane);

      expect(pane.style.getPropertyValue('--nxr-arrow-x')).toBe('');
      expect(pane.style.getPropertyValue('--nxr-arrow-y')).toBe('');
      expect(pane.style.getPropertyValue('--nxr-arrow-side')).toBe('');
      expect(pane.style.getPropertyValue('--nxr-arrow-rotate')).toBe('');
      expect(pane.style.getPropertyValue('--nxr-arrow-visible')).toBe('');
      expect(pane.style.getPropertyValue('--nxr-arrow-width')).toBe('');
      expect(pane.style.getPropertyValue('--nxr-arrow-height')).toBe('');
      expect(pane.style.overflow).toBe('');
    });
  });

  describe('isAnchorInViewport', () => {
    const viewport = new DOMRect(0, 0, 1000, 800);

    it('returns true when anchorRect is undefined', () => {
      expect(isAnchorInViewport(undefined, viewport)).toBe(true);
    });

    it('returns true when anchor overlaps viewport', () => {
      expect(isAnchorInViewport(new DOMRect(100, 100, 50, 30), viewport)).toBe(true);
      expect(isAnchorInViewport(new DOMRect(0, 0, 10, 10), viewport)).toBe(true);
      expect(isAnchorInViewport(new DOMRect(990, 790, 20, 20), viewport)).toBe(true);
    });

    it('returns false when anchor is completely left of viewport', () => {
      expect(isAnchorInViewport(new DOMRect(-100, 100, 50, 50), viewport)).toBe(false);
    });

    it('returns false when anchor is completely right of viewport', () => {
      expect(isAnchorInViewport(new DOMRect(1001, 100, 50, 50), viewport)).toBe(false);
    });

    it('returns false when anchor is completely above viewport', () => {
      expect(isAnchorInViewport(new DOMRect(100, -50, 50, 30), viewport)).toBe(false);
    });

    it('returns false when anchor is completely below viewport', () => {
      expect(isAnchorInViewport(new DOMRect(100, 801, 50, 50), viewport)).toBe(false);
    });
  });
});

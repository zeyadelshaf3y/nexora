import { computeGapRect, gapEquals } from './hover-gap';

describe('hover-gap', () => {
  describe('gapEquals', () => {
    it('returns true for both null', () => {
      expect(gapEquals(null, null)).toBe(true);
    });

    it('returns false when one is null', () => {
      expect(gapEquals({ left: 0, top: 0, width: 10, height: 10 }, null)).toBe(false);
      expect(gapEquals(null, { left: 0, top: 0, width: 10, height: 10 })).toBe(false);
    });

    it('returns true when rects are equal', () => {
      const a = { left: 5, top: 10, width: 20, height: 15 };
      expect(gapEquals(a, { ...a })).toBe(true);
    });

    it('returns false when rects differ', () => {
      const a = { left: 5, top: 10, width: 20, height: 15 };
      expect(gapEquals(a, { ...a, left: 6 })).toBe(false);
      expect(gapEquals(a, { ...a, width: 21 })).toBe(false);
    });
  });

  describe('computeGapRect', () => {
    it('returns null when anchor and pane overlap', () => {
      const anchor = document.createElement('div');
      const pane = document.createElement('div');
      Object.defineProperty(anchor, 'getBoundingClientRect', {
        value: () => new DOMRect(0, 0, 50, 30),
        configurable: true,
      });
      Object.defineProperty(pane, 'getBoundingClientRect', {
        value: () => new DOMRect(10, 10, 50, 30),
        configurable: true,
      });
      Object.defineProperty(pane, 'offsetWidth', { value: 50, configurable: true });
      Object.defineProperty(pane, 'offsetHeight', { value: 30, configurable: true });
      expect(computeGapRect({ anchor, pane })).toBeNull();
    });

    it('returns gap rect when pane is below anchor (fixed position)', () => {
      const anchor = document.createElement('div');
      const pane = document.createElement('div');
      document.body.appendChild(anchor);
      document.body.appendChild(pane);
      const anchorRect = new DOMRect(100, 50, 80, 20);
      Object.defineProperty(anchor, 'getBoundingClientRect', {
        value: () => anchorRect,
        configurable: true,
      });
      Object.defineProperty(pane, 'offsetWidth', { value: 80, configurable: true });
      Object.defineProperty(pane, 'offsetHeight', { value: 40, configurable: true });

      const win = {
        getComputedStyle: () =>
          ({
            position: 'fixed',
            left: '100px',
            top: '72px',
            getPropertyValue: (p: string) => (p === 'left' ? '100px' : p === 'top' ? '72px' : ''),
          }) as CSSStyleDeclaration,
      };

      Object.defineProperty(pane, 'ownerDocument', {
        value: { defaultView: win },
        configurable: true,
      });
      const gap = computeGapRect({ anchor, pane });
      expect(gap).not.toBeNull();
      expect(gap?.left).toBe(100);
      expect(gap?.width).toBe(80);
      expect(gap?.top).toBe(70);
      expect(gap?.height).toBe(2);
      document.body.removeChild(anchor);
      document.body.removeChild(pane);
    });
  });
});

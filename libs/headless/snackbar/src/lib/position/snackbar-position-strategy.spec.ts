import { DEFAULT_SNACKBAR_STACK_GAP, SnackbarPositionStrategy } from './snackbar-position-strategy';

const viewportRect = new DOMRect(0, 0, 400, 300);
const overlaySize = { width: 200, height: 48 };
const defaultPadding = 16;
const defaultGap = DEFAULT_SNACKBAR_STACK_GAP;

describe('SnackbarPositionStrategy', () => {
  it('positions bottom-end with zero offset', () => {
    const strategy = new SnackbarPositionStrategy('bottom-end', () => 0);
    const result = strategy.apply({
      overlaySize,
      viewportRect,
    });
    expect(result.x).toBe(viewportRect.right - overlaySize.width - defaultPadding);
    expect(result.y).toBe(viewportRect.bottom - overlaySize.height - defaultPadding);
    expect(result.panePlacement).toBe('snackbar-bottom-end');
  });

  it('positions bottom-end with stacked offset', () => {
    const precedingHeight = 48;
    const offset = precedingHeight + defaultGap;
    const strategy = new SnackbarPositionStrategy('bottom-end', () => offset);
    const result = strategy.apply({
      overlaySize,
      viewportRect,
    });
    expect(result.y).toBe(viewportRect.bottom - overlaySize.height - defaultPadding - offset);
  });

  it('supports variable-height stacking', () => {
    const heights = [40, 60];
    const offset = heights.reduce((sum, h) => sum + h + defaultGap, 0);
    const strategy = new SnackbarPositionStrategy('bottom-end', () => offset);
    const result = strategy.apply({ overlaySize, viewportRect });
    expect(result.y).toBe(viewportRect.bottom - overlaySize.height - defaultPadding - offset);
  });

  it('uses getStackOffset at apply time', () => {
    let offset = 0;
    const strategy = new SnackbarPositionStrategy('bottom', () => offset);
    const r0 = strategy.apply({ overlaySize, viewportRect });
    offset = overlaySize.height + defaultGap;
    const r1 = strategy.apply({ overlaySize, viewportRect });
    expect(r1.y).toBeLessThan(r0.y);
  });

  it('respects custom padding', () => {
    const strategy = new SnackbarPositionStrategy('top-start', () => 0, {
      padding: 24,
    });

    const result = strategy.apply({ overlaySize, viewportRect });
    expect(result.x).toBe(viewportRect.left + 24);
    expect(result.y).toBe(viewportRect.top + 24);
  });

  it('flips start/end in RTL', () => {
    const strategyStart = new SnackbarPositionStrategy('bottom-start', () => 0);
    const strategyEnd = new SnackbarPositionStrategy('bottom-end', () => 0);
    const rLtrStart = strategyStart.apply({ overlaySize, viewportRect, dir: 'ltr' });
    const rRtlStart = strategyStart.apply({ overlaySize, viewportRect, dir: 'rtl' });
    const rLtrEnd = strategyEnd.apply({ overlaySize, viewportRect, dir: 'ltr' });
    const rRtlEnd = strategyEnd.apply({ overlaySize, viewportRect, dir: 'rtl' });
    expect(rRtlStart.x).toBe(rLtrEnd.x);
    expect(rRtlEnd.x).toBe(rLtrStart.x);
  });
});

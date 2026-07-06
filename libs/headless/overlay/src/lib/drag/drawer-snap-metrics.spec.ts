import { describe, expect, it } from 'vitest';

import { parseCssLengthToPx, resolveDrawerSnapMetrics } from './drawer-snap-metrics';

describe('parseCssLengthToPx', () => {
  const viewport = { width: 400, height: 800 };

  it('parses px, vh, vw, and percent', () => {
    expect(parseCssLengthToPx('200px', viewport, 'y')).toBe(200);
    expect(parseCssLengthToPx('50vh', viewport, 'y')).toBe(400);
    expect(parseCssLengthToPx('50vw', viewport, 'x')).toBe(200);
    expect(parseCssLengthToPx('25%', viewport, 'y')).toBe(200);
  });
});

describe('resolveDrawerSnapMetrics', () => {
  it('resolves bottom drawer height snap', () => {
    const pane = document.createElement('div');
    pane.setAttribute('data-placement', 'drawer-bottom');
    Object.defineProperty(document.documentElement, 'clientHeight', {
      value: 800,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, 'clientWidth', {
      value: 400,
      configurable: true,
    });

    const metrics = resolveDrawerSnapMetrics({
      snap: { initialSize: '200px', expandedSize: '60vh' },
      pane,
      axis: 'y',
    });

    expect(metrics).toEqual({
      axis: 'y',
      axisDimension: 'height',
      initialPx: 200,
      expandedPx: 480,
    });
  });

  it('resolves start drawer width snap', () => {
    const pane = document.createElement('div');
    pane.setAttribute('data-placement', 'drawer-start');

    const metrics = resolveDrawerSnapMetrics({
      snap: { initialSize: '280px' },
      pane,
      axis: 'x',
    });

    expect(metrics?.axisDimension).toBe('width');
    expect(metrics?.initialPx).toBe(280);
    expect(metrics?.expandedPx).toBeGreaterThanOrEqual(280);
  });

  it('returns null for invalid initial size', () => {
    const pane = document.createElement('div');
    pane.setAttribute('data-placement', 'drawer-bottom');

    expect(
      resolveDrawerSnapMetrics({
        snap: { initialSize: 'invalid' },
        pane,
        axis: 'y',
      }),
    ).toBeNull();
  });
});

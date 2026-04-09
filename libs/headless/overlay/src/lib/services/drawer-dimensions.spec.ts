import { describe, expect, it } from 'vitest';

import { resolveDrawerPanelDimensions } from './drawer-dimensions';

describe('resolveDrawerPanelDimensions', () => {
  it('start/end default height to 100vh', () => {
    expect(resolveDrawerPanelDimensions('start')).toMatchObject({ height: '100vh' });
    expect(resolveDrawerPanelDimensions('end', {})).toMatchObject({ height: '100vh' });
  });

  it('top/bottom default width to 100vw', () => {
    expect(resolveDrawerPanelDimensions('top')).toMatchObject({ width: '100vw' });
    expect(resolveDrawerPanelDimensions('bottom')).toMatchObject({ width: '100vw' });
  });

  it('respects explicit width/height overrides', () => {
    expect(resolveDrawerPanelDimensions('start', { width: '320px', height: '50%' })).toMatchObject({
      width: '320px',
      height: '50%',
    });
    expect(resolveDrawerPanelDimensions('top', { height: '200px' })).toMatchObject({
      width: '100vw',
      height: '200px',
    });
  });
});

import { NoopScrollStrategy } from '../scroll/noop-scroll-strategy';

import { createDropdownAnchoredConfig } from './create-dropdown-anchored-config';
import type { OverlayRef } from './overlay-ref';

describe('createDropdownAnchoredConfig', () => {
  const anchor = document.createElement('div');

  it('returns config with vertical fallbacks and no backdrop', () => {
    const config = createDropdownAnchoredConfig({
      anchor,
      scrollStrategy: new NoopScrollStrategy(),
      closeAnimationDurationMs: 150,
    });

    expect(config.anchor).toBe(anchor);
    expect(config.hasBackdrop).toBe(false);
    expect(config.closeAnimationDurationMs).toBe(150);
    expect(config.positionStrategy).toBeDefined();
    expect(config.closePolicy).toEqual({ escape: 'top', outside: 'top' });
  });

  it('uses default placement and offset when omitted', () => {
    const config = createDropdownAnchoredConfig({
      anchor,
      scrollStrategy: new NoopScrollStrategy(),
      closeAnimationDurationMs: 100,
    });

    expect(config.positionStrategy).toBeDefined();
  });

  it('passes placement, offset, panelClass, maxHeight, width when provided', () => {
    const config = createDropdownAnchoredConfig({
      anchor,
      placement: 'top',
      offset: 8,
      scrollStrategy: new NoopScrollStrategy(),
      closeAnimationDurationMs: 200,
      panelClass: ['dropdown-pane', 'custom'],
      maxHeight: '20rem',
      width: '300px',
    });

    expect(config.panelClass).toEqual(['dropdown-pane', 'custom']);
    expect(config.maxHeight).toBe('20rem');
    expect(config.width).toBe('300px');
  });

  it('passes parentRef when provided', () => {
    const parentRef = {} as OverlayRef;
    const config = createDropdownAnchoredConfig({
      anchor,
      scrollStrategy: new NoopScrollStrategy(),
      closeAnimationDurationMs: 0,
      parentRef,
    });

    expect(config.parentRef).toBe(parentRef);
  });
});

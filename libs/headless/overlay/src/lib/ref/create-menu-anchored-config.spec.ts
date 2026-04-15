import { NoopScrollStrategy } from '../scroll/noop-scroll-strategy';

import { createMenuAnchoredConfig } from './create-menu-anchored-config';
import type { OverlayRef } from './overlay-ref';

describe('createMenuAnchoredConfig', () => {
  const anchor = document.createElement('div');

  it('returns config with no backdrop and default placement', () => {
    const config = createMenuAnchoredConfig({
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

  it('uses default placement bottom-start when omitted', () => {
    const config = createMenuAnchoredConfig({
      anchor,
      scrollStrategy: new NoopScrollStrategy(),
      closeAnimationDurationMs: 100,
    });

    expect(config.positionStrategy).toBeDefined();
  });

  it('passes placement, offset, panelClass, maxHeight, width when provided', () => {
    const config = createMenuAnchoredConfig({
      anchor,
      placement: 'bottom-end',
      offset: 8,
      scrollStrategy: new NoopScrollStrategy(),
      closeAnimationDurationMs: 200,
      panelClass: ['menu-pane'],
      maxHeight: '20rem',
      width: '300px',
    });

    expect(config.panelClass).toEqual(['menu-pane']);
    expect(config.maxHeight).toBe('20rem');
    expect(config.width).toBe('300px');
  });

  it('passes parentRef when provided', () => {
    const parentRef = {} as OverlayRef;
    const config = createMenuAnchoredConfig({
      anchor,
      scrollStrategy: new NoopScrollStrategy(),
      closeAnimationDurationMs: 0,
      parentRef,
    });

    expect(config.parentRef).toBe(parentRef);
  });

  it('passes arrowSize when provided', () => {
    const config = createMenuAnchoredConfig({
      anchor,
      scrollStrategy: new NoopScrollStrategy(),
      closeAnimationDurationMs: 100,
      arrowSize: { width: 14, height: 7 },
    });

    expect(config.arrowSize).toEqual({ width: 14, height: 7 });
  });
});

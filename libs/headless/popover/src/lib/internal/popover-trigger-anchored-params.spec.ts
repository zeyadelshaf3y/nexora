import { describe, expect, it } from 'vitest';

import {
  buildPopoverAnchoredOverlayParams,
  resolvePopoverPanelWidth,
} from './popover-trigger-anchored-params';

describe('resolvePopoverPanelWidth', () => {
  it('matches anchor offset width when matchAnchorWidth is true', () => {
    const el = document.createElement('div');
    Object.defineProperty(el, 'offsetWidth', { value: 240 });

    expect(resolvePopoverPanelWidth(el, { matchAnchorWidth: true, width: '100px' })).toBe('240px');
  });

  it('uses explicit width when matchAnchorWidth is false', () => {
    const el = document.createElement('div');

    expect(resolvePopoverPanelWidth(el, { matchAnchorWidth: false, width: '120px' })).toBe('120px');
  });
});

describe('buildPopoverAnchoredOverlayParams', () => {
  it('merges defaults for close policy and scroll strategy', () => {
    const anchor = document.createElement('button');
    const params = buildPopoverAnchoredOverlayParams(anchor, {
      placement: 'bottom-start',
      offset: 8,
      clampToViewport: true,
      preferredPlacementOnly: false,
      hasBackdrop: false,
      closePolicy: undefined,
      closeOnScroll: false,
      scrollStrategy: 'noop',
      maintainInViewport: true,
      boundaries: undefined,
      closeAnimationDurationMs: 0,
      panelClass: undefined,
      panelStyle: undefined,
      backdropClass: undefined,
      backdropStyle: undefined,
      arrowSize: undefined,
      beforeOpen: undefined,
      beforeClose: undefined,
      matchAnchorWidth: false,
      width: undefined,
      height: undefined,
      minWidth: undefined,
      maxWidth: undefined,
      minHeight: undefined,
      maxHeight: undefined,
    });

    expect(params.anchor).toBe(anchor);
    expect(params.placement).toBe('bottom-start');
    expect(params.focusStrategy).toBeDefined();
    expect(params.scrollStrategy).toBeDefined();
  });

  it('forwards pane and backdrop style hooks', () => {
    const anchor = document.createElement('button');
    const params = buildPopoverAnchoredOverlayParams(anchor, {
      placement: 'bottom-start',
      offset: 8,
      clampToViewport: true,
      preferredPlacementOnly: false,
      hasBackdrop: true,
      closePolicy: undefined,
      closeOnScroll: false,
      scrollStrategy: 'noop',
      maintainInViewport: true,
      boundaries: undefined,
      closeAnimationDurationMs: 0,
      panelClass: ['my-pane'],
      panelStyle: { maxWidth: '20rem' },
      backdropClass: ['my-backdrop'],
      backdropStyle: { backdropFilter: 'blur(2px)' },
      arrowSize: undefined,
      beforeOpen: undefined,
      beforeClose: undefined,
      matchAnchorWidth: false,
      width: undefined,
      height: undefined,
      minWidth: undefined,
      maxWidth: undefined,
      minHeight: undefined,
      maxHeight: undefined,
    });

    expect(params.panelClass).toEqual(['my-pane']);
    expect(params.panelStyle).toEqual({ maxWidth: '20rem' });
    expect(params.backdropClass).toEqual(['my-backdrop']);
    expect(params.backdropStyle).toEqual({ backdropFilter: 'blur(2px)' });
  });
});

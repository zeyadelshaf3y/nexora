import { describe, expect, it, vi } from 'vitest';

import { OverlayAnchorPopupRegistry } from './overlay-anchor-popup-registry';

describe('OverlayAnchorPopupRegistry', () => {
  it('tracks open count and isPopupOpen', () => {
    const registry = new OverlayAnchorPopupRegistry();
    const anchor = document.createElement('button');

    expect(registry.isPopupOpen(anchor)).toBe(false);

    registry.markOpen(anchor);
    expect(registry.isPopupOpen(anchor)).toBe(true);

    registry.markClosed(anchor);
    expect(registry.isPopupOpen(anchor)).toBe(false);
  });

  it('supports multiple popups on the same anchor', () => {
    const registry = new OverlayAnchorPopupRegistry();
    const anchor = document.createElement('button');

    registry.markOpen(anchor);
    registry.markOpen(anchor);
    expect(registry.isPopupOpen(anchor)).toBe(true);

    registry.markClosed(anchor);
    expect(registry.isPopupOpen(anchor)).toBe(true);

    registry.markClosed(anchor);
    expect(registry.isPopupOpen(anchor)).toBe(false);
  });

  it('markClosed clamps at zero and is idempotent', () => {
    const registry = new OverlayAnchorPopupRegistry();
    const anchor = document.createElement('button');

    registry.markClosed(anchor);
    registry.markClosed(anchor);
    expect(registry.isPopupOpen(anchor)).toBe(false);
  });

  it('invokes registered tooltip close listeners on markOpen', () => {
    const registry = new OverlayAnchorPopupRegistry();
    const anchor = document.createElement('button');
    const closeNow = vi.fn();

    registry.registerTooltip(anchor, closeNow);
    registry.markOpen(anchor);

    expect(closeNow).toHaveBeenCalledTimes(1);
  });

  it('unregister stops tooltip close notifications', () => {
    const registry = new OverlayAnchorPopupRegistry();
    const anchor = document.createElement('button');
    const closeNow = vi.fn();

    const unregister = registry.registerTooltip(anchor, closeNow);
    unregister();
    registry.markOpen(anchor);

    expect(closeNow).not.toHaveBeenCalled();
  });
});

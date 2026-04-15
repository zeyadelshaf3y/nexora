import { PopoverExternalAnchorState } from './popover-external-anchor-state';

describe('PopoverExternalAnchorState', () => {
  it('returns no-op when anchor and trigger key are unchanged', () => {
    const state = new PopoverExternalAnchorState();
    const anchor = document.createElement('button');
    const attach = vi.fn(() => () => {});

    state.handleChange({
      anchor,
      triggerKey: 'hover',
      isOverlayOpen: false,
      closeOverlay: vi.fn(),
      attachListeners: attach,
      hoverEnabled: true,
      disabled: false,
      isAnchorHovered: () => false,
    });

    const result = state.handleChange({
      anchor,
      triggerKey: 'hover',
      isOverlayOpen: false,
      closeOverlay: vi.fn(),
      attachListeners: attach,
      hoverEnabled: true,
      disabled: false,
      isAnchorHovered: () => true,
    });

    expect(result.openHoveredAnchorNow).toBe(false);
    expect(attach).toHaveBeenCalledTimes(1);
  });

  it('queues hover reopen transition for hovered replacement while open', () => {
    const state = new PopoverExternalAnchorState();
    const first = document.createElement('button');
    const second = document.createElement('button');
    const closeOverlay = vi.fn();

    state.handleChange({
      anchor: first,
      triggerKey: 'hover',
      isOverlayOpen: false,
      closeOverlay,
      attachListeners: () => () => {},
      hoverEnabled: true,
      disabled: false,
      isAnchorHovered: () => true,
    });

    const change = state.handleChange({
      anchor: second,
      triggerKey: 'hover',
      isOverlayOpen: true,
      closeOverlay,
      attachListeners: () => () => {},
      hoverEnabled: true,
      disabled: false,
      isAnchorHovered: () => true,
    });

    expect(change.openHoveredAnchorNow).toBe(false);
    expect(closeOverlay).toHaveBeenCalledTimes(1);

    const transition = state.consumeClosedTransition(second, true, () => true);
    expect(transition).toEqual({ suppressClosedEmit: true, reopenHoveredAnchor: true });
  });

  it('syncs and clears ARIA attributes', () => {
    const state = new PopoverExternalAnchorState();
    const anchor = document.createElement('button');
    state.syncAria(anchor, true, 'pane-1');
    expect(anchor.getAttribute('aria-haspopup')).toBe('true');
    expect(anchor.getAttribute('aria-expanded')).toBe('true');
    expect(anchor.getAttribute('aria-controls')).toBe('pane-1');

    state.handleChange({
      anchor,
      triggerKey: 'hover',
      isOverlayOpen: false,
      closeOverlay: vi.fn(),
      attachListeners: () => () => {},
      hoverEnabled: true,
      disabled: false,
      isAnchorHovered: () => false,
    });
    state.destroy();

    expect(anchor.hasAttribute('aria-haspopup')).toBe(false);
    expect(anchor.hasAttribute('aria-expanded')).toBe(false);
    expect(anchor.hasAttribute('aria-controls')).toBe(false);
  });
});

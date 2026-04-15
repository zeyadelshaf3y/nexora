import { vi } from 'vitest';

import { handleAnchoredHoverLeave } from './anchored-hover-leave';
import { createTriggerDelay } from './trigger-delay';

describe('handleAnchoredHoverLeave', () => {
  it('returns immediately when isHoverTrigger is false', () => {
    const close = vi.fn();
    const openDelay = createTriggerDelay();
    handleAnchoredHoverLeave(new MouseEvent('mouseleave'), {
      openDelay,
      isHoverTrigger: () => false,
      openedBy: 'hover',
      overlayRef: null,
      getTriggerElement: () => document.createElement('button'),
      getPane: () => null,
      allowContentHover: false,
      isNestedOverlay: false,
      getCloseDelay: () => 0,
      hoverBridge: null,
      close,
    });
    expect(close).not.toHaveBeenCalled();
  });

  it('cancels openDelay', () => {
    const openDelay = createTriggerDelay();
    const cancelSpy = vi.spyOn(openDelay, 'cancel');
    handleAnchoredHoverLeave(new MouseEvent('mouseleave'), {
      openDelay,
      isHoverTrigger: () => true,
      openedBy: 'focus',
      overlayRef: null,
      getTriggerElement: () => document.createElement('button'),
      getPane: () => null,
      allowContentHover: false,
      isNestedOverlay: false,
      getCloseDelay: () => 0,
      hoverBridge: null,
      close: () => {},
    });
    expect(cancelSpy).toHaveBeenCalled();
  });

  it('returns without closing when openedBy is not hover', () => {
    const close = vi.fn();
    const openDelay = createTriggerDelay();
    handleAnchoredHoverLeave(new MouseEvent('mouseleave'), {
      openDelay,
      isHoverTrigger: () => true,
      openedBy: 'focus',
      overlayRef: null,
      getTriggerElement: () => document.createElement('button'),
      getPane: () => null,
      allowContentHover: false,
      isNestedOverlay: false,
      getCloseDelay: () => 0,
      hoverBridge: null,
      close,
    });
    expect(close).not.toHaveBeenCalled();
  });

  it('returns without closing when overlayRef is null', () => {
    const close = vi.fn();
    const openDelay = createTriggerDelay();
    handleAnchoredHoverLeave(new MouseEvent('mouseleave'), {
      openDelay,
      isHoverTrigger: () => true,
      openedBy: 'hover',
      overlayRef: null,
      getTriggerElement: () => document.createElement('button'),
      getPane: () => null,
      allowContentHover: false,
      isNestedOverlay: false,
      getCloseDelay: () => 0,
      hoverBridge: null,
      close,
    });
    expect(close).not.toHaveBeenCalled();
  });

  it('calls onOpeningLeave when opening is true and returns without closing', () => {
    const close = vi.fn();
    const onOpeningLeave = vi.fn();
    const openDelay = createTriggerDelay();
    const mockRef = { getPaneElement: () => document.createElement('div') };
    handleAnchoredHoverLeave(new MouseEvent('mouseleave'), {
      openDelay,
      isHoverTrigger: () => true,
      openedBy: 'hover',
      overlayRef: mockRef as never,
      getTriggerElement: () => document.createElement('button'),
      getPane: () => document.createElement('div'),
      allowContentHover: false,
      isNestedOverlay: false,
      getCloseDelay: () => 0,
      hoverBridge: null,
      close,
      opening: true,
      onOpeningLeave,
    });
    expect(onOpeningLeave).toHaveBeenCalledTimes(1);
    expect(close).not.toHaveBeenCalled();
  });

  it('calls close when no hoverBridge and openedBy is hover', () => {
    const close = vi.fn();
    const openDelay = createTriggerDelay();
    const pane = document.createElement('div');
    const mockRef = { getPaneElement: () => pane };
    handleAnchoredHoverLeave(new MouseEvent('mouseleave'), {
      openDelay,
      isHoverTrigger: () => true,
      openedBy: 'hover',
      overlayRef: mockRef as never,
      getTriggerElement: () => document.createElement('button'),
      getPane: () => pane,
      allowContentHover: false,
      isNestedOverlay: false,
      getCloseDelay: () => 0,
      hoverBridge: null,
      close,
    });
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('calls hoverBridge.scheduleClose(delay) when hoverBridge exists and delay > 0', () => {
    const close = vi.fn();
    const scheduleClose = vi.fn();
    const openDelay = createTriggerDelay();
    const pane = document.createElement('div');
    const mockRef = { getPaneElement: () => pane };
    const hoverBridge = { scheduleClose, cancelClose: () => {} } as never;
    handleAnchoredHoverLeave(new MouseEvent('mouseleave'), {
      openDelay,
      isHoverTrigger: () => true,
      openedBy: 'hover',
      overlayRef: mockRef as never,
      getTriggerElement: () => document.createElement('button'),
      getPane: () => pane,
      allowContentHover: false,
      isNestedOverlay: false,
      getCloseDelay: () => 50,
      hoverBridge,
      close,
    });
    expect(scheduleClose).toHaveBeenCalledWith(50);
    expect(close).not.toHaveBeenCalled();
  });

  it('calls close when hoverBridge exists but getCloseDelay returns 0', () => {
    const close = vi.fn();
    const scheduleClose = vi.fn();
    const openDelay = createTriggerDelay();
    const pane = document.createElement('div');
    const mockRef = { getPaneElement: () => pane };
    const hoverBridge = { scheduleClose, cancelClose: () => {} } as never;
    handleAnchoredHoverLeave(new MouseEvent('mouseleave'), {
      openDelay,
      isHoverTrigger: () => true,
      openedBy: 'hover',
      overlayRef: mockRef as never,
      getTriggerElement: () => document.createElement('button'),
      getPane: () => pane,
      allowContentHover: false,
      isNestedOverlay: false,
      getCloseDelay: () => 0,
      hoverBridge,
      close,
    });
    expect(scheduleClose).not.toHaveBeenCalled();
    expect(close).toHaveBeenCalledTimes(1);
  });
});

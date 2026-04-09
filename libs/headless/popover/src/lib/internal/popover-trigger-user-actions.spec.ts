import { CLOSE_REASON_PROGRAMMATIC } from '@nexora-ui/overlay';
import { describe, expect, it, vi } from 'vitest';

import type { PopoverFocusCloseCoordinator } from './popover-focus-close-coordinator';
import {
  popoverHandleBlur,
  popoverHandleClick,
  popoverHandleFocus,
  popoverHandleMouseEnter,
  type PopoverTriggerHost,
} from './popover-trigger-user-actions';

function baseHost(overrides: Partial<PopoverTriggerHost> = {}): PopoverTriggerHost {
  const openDelay = {
    cancel: vi.fn(),
    schedule: vi.fn((_ms: number, fn: () => void) => {
      fn();
    }),
  };
  const focusClose = {
    cancel: vi.fn(),
  } as unknown as PopoverFocusCloseCoordinator;

  return {
    triggerIncludes: () => true,
    nxrPopoverDisabled: () => false,
    nxrPopoverOpenDelay: () => 0,
    nxrPopoverAllowContentHover: () => true,
    getOverlayRef: () => null,
    open: vi.fn(),
    close: vi.fn(),
    getOpenedBy: () => null,
    openDelay,
    focusClose,
    scheduleFocusCloseCheck: vi.fn(),
    getHoverCloseDelay: () => 100,
    getAnchorElement: () => document.createElement('div'),
    getIsNestedOverlay: () => false,
    getHoverBridge: () => null,
    ...overrides,
  };
}

describe('popoverHandleClick', () => {
  it('closes overlay with programmatic reason when open and click trigger', () => {
    const close = vi.fn();
    const host = baseHost({
      triggerIncludes: (t) => t === 'click',
      getOverlayRef: () => ({ close }) as never,
    });

    popoverHandleClick(host);

    expect(close).toHaveBeenCalledWith(CLOSE_REASON_PROGRAMMATIC);
    expect(host.open).not.toHaveBeenCalled();
  });

  it('opens with click when closed', () => {
    const open = vi.fn();
    const host = baseHost({
      triggerIncludes: (t) => t === 'click',
      open,
    });

    popoverHandleClick(host);

    expect(open).toHaveBeenCalledWith('click');
  });

  it('no-ops when disabled', () => {
    const open = vi.fn();
    const host = baseHost({
      nxrPopoverDisabled: () => true,
      open,
    });

    popoverHandleClick(host);

    expect(open).not.toHaveBeenCalled();
  });
});

describe('popoverHandleFocus', () => {
  it('opens immediately when delay is 0', () => {
    const open = vi.fn();
    const host = baseHost({
      triggerIncludes: (t) => t === 'focus',
      nxrPopoverOpenDelay: () => 0,
      open,
    });

    popoverHandleFocus(host);

    expect(open).toHaveBeenCalledWith('focus');
  });

  it('schedules open when delay is positive', () => {
    const open = vi.fn();
    const schedule = vi.fn();
    const host = baseHost({
      triggerIncludes: (t) => t === 'focus',
      nxrPopoverOpenDelay: () => 50,
      open,
      openDelay: { cancel: vi.fn(), schedule },
    });

    popoverHandleFocus(host);

    expect(schedule).toHaveBeenCalled();
    expect(open).not.toHaveBeenCalled();
  });
});

describe('popoverHandleBlur', () => {
  it('schedules focus close when opened by focus and overlay exists', () => {
    const scheduleFocusCloseCheck = vi.fn();
    const host = baseHost({
      triggerIncludes: (t) => t === 'focus',
      getOpenedBy: () => 'focus',
      getOverlayRef: () => ({}) as never,
      scheduleFocusCloseCheck,
    });

    popoverHandleBlur(host);

    expect(scheduleFocusCloseCheck).toHaveBeenCalled();
  });

  it('no-ops when not opened by focus', () => {
    const scheduleFocusCloseCheck = vi.fn();
    const host = baseHost({
      getOpenedBy: () => 'click',
      getOverlayRef: () => ({}) as never,
      scheduleFocusCloseCheck,
    });

    popoverHandleBlur(host);

    expect(scheduleFocusCloseCheck).not.toHaveBeenCalled();
  });
});

describe('popoverHandleMouseEnter', () => {
  it('opens hover when no overlay', () => {
    const open = vi.fn();
    const host = baseHost({
      triggerIncludes: (t) => t === 'hover',
      open,
    });

    popoverHandleMouseEnter(host);

    expect(open).toHaveBeenCalledWith('hover');
  });

  it('cancels hover bridge close when bridge exists', () => {
    const cancelClose = vi.fn();
    const host = baseHost({
      triggerIncludes: (t) => t === 'hover',
      getHoverBridge: () => ({ cancelClose }) as never,
    });

    popoverHandleMouseEnter(host);

    expect(cancelClose).toHaveBeenCalled();
  });
});

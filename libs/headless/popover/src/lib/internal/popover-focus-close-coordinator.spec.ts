import { vi } from 'vitest';

import { PopoverFocusCloseCoordinator } from './popover-focus-close-coordinator';

describe('PopoverFocusCloseCoordinator', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function createParams(
    overrides?: Partial<Parameters<PopoverFocusCloseCoordinator['schedule']>[0]>,
  ) {
    const anchor = document.createElement('button');
    const pane = document.createElement('div');
    const close = vi.fn();

    return {
      anchor,
      pane,
      close,
      params: {
        delayMs: 20,
        getActiveElement: () => null,
        getAnchorElement: () => anchor,
        getPaneElement: () => pane,
        isInsideOverlayPaneOrBridge: () => false,
        close,
        ...overrides,
      },
    };
  }

  it('closes when focus is outside and no pointer intent keeps it open', () => {
    const coordinator = new PopoverFocusCloseCoordinator();
    const { params, close } = createParams();
    coordinator.schedule(params);
    vi.advanceTimersByTime(25);
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('does not close when active element remains in anchor', () => {
    const coordinator = new PopoverFocusCloseCoordinator();
    const { anchor, params, close } = createParams({ getActiveElement: () => anchor });
    coordinator.schedule(params);
    vi.advanceTimersByTime(25);
    expect(close).not.toHaveBeenCalled();
  });

  it('does not close when pointer down was inside pane/bridge', () => {
    const coordinator = new PopoverFocusCloseCoordinator();
    const { pane, params, close } = createParams();
    const child = document.createElement('span');
    pane.appendChild(child);
    coordinator.onPointerDown(child);
    coordinator.schedule(params);
    vi.advanceTimersByTime(25);
    expect(close).not.toHaveBeenCalled();
  });
});

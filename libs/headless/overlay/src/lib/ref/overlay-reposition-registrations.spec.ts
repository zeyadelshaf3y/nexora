import { vi } from 'vitest';

import { NoopScrollStrategy } from '../scroll/noop-scroll-strategy';

import type { OverlayConfig } from './overlay-config';
import { createOverlayRepositionRegistrations } from './overlay-reposition-registrations';

class TestResizeObserver implements ResizeObserver {
  static instances: TestResizeObserver[] = [];

  readonly observe = vi.fn();
  readonly unobserve = vi.fn();
  readonly disconnect = vi.fn();

  constructor(private readonly callback: ResizeObserverCallback) {
    TestResizeObserver.instances.push(this);
  }

  trigger(): void {
    this.callback([{} as ResizeObserverEntry], this);
  }
}

describe('createOverlayRepositionRegistrations', () => {
  let originalResizeObserver: typeof ResizeObserver | undefined;

  beforeEach(() => {
    originalResizeObserver = globalThis.ResizeObserver;
    TestResizeObserver.instances = [];
    globalThis.ResizeObserver = TestResizeObserver;
  });

  afterEach(() => {
    if (originalResizeObserver) {
      globalThis.ResizeObserver = originalResizeObserver;
    } else {
      delete (globalThis as { ResizeObserver?: typeof ResizeObserver }).ResizeObserver;
    }
  });

  it('observes pane resize for unanchored overlays so dialogs reposition when content size changes', async () => {
    const applyPosition = vi.fn();
    const pane = document.createElement('div');

    const registrations = createOverlayRepositionRegistrations({
      applyPosition,
      config: {
        anchor: undefined,
        scrollStrategy: new NoopScrollStrategy(),
      } as OverlayConfig,
      host: null,
      getAnchorElement: () => undefined,
      pane,
    });

    const resizeObserver = TestResizeObserver.instances.at(0);
    if (!resizeObserver) throw new Error('expected a ResizeObserver instance to be created');
    expect(resizeObserver.observe).toHaveBeenCalledWith(pane);

    resizeObserver.trigger();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(applyPosition).toHaveBeenCalledTimes(1);

    for (const cleanup of registrations.restCleanups) {
      cleanup();
    }

    expect(resizeObserver.disconnect).toHaveBeenCalledTimes(1);
  });
});

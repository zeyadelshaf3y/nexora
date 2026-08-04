import { afterEach, describe, expect, it, vi } from 'vitest';

import { subscribeMentionViewportChanges } from './mention-viewport-tracking';

describe('subscribeMentionViewportChanges', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('listens to window scroll/resize and visualViewport scroll/resize', () => {
    const vv = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    vi.stubGlobal('visualViewport', vv);

    const winAdd = vi.spyOn(window, 'addEventListener');
    const winRemove = vi.spyOn(window, 'removeEventListener');
    const onChange = vi.fn();

    const cleanup = subscribeMentionViewportChanges(onChange);

    expect(winAdd).toHaveBeenCalledWith('scroll', onChange, {
      passive: true,
      capture: true,
    });
    expect(winAdd).toHaveBeenCalledWith('resize', onChange, undefined);
    expect(vv.addEventListener).toHaveBeenCalledWith('resize', onChange, undefined);
    expect(vv.addEventListener).toHaveBeenCalledWith('scroll', onChange, undefined);

    cleanup();

    expect(winRemove).toHaveBeenCalled();
    expect(vv.removeEventListener).toHaveBeenCalledWith('resize', onChange, undefined);
    expect(vv.removeEventListener).toHaveBeenCalledWith('scroll', onChange, undefined);
  });

  it('still works when visualViewport is missing', () => {
    vi.stubGlobal('visualViewport', undefined);
    const onChange = vi.fn();
    const cleanup = subscribeMentionViewportChanges(onChange);
    expect(() => cleanup()).not.toThrow();
  });
});

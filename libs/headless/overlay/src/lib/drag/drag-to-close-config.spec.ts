import { describe, expect, it } from 'vitest';

import {
  DEFAULT_DRAG_TO_CLOSE_MIN_VELOCITY,
  DEFAULT_DRAG_TO_CLOSE_THRESHOLD,
  resolveDragToCloseConfig,
} from './drag-to-close-config';

describe('resolveDragToCloseConfig', () => {
  it('returns null when disabled', () => {
    expect(resolveDragToCloseConfig(undefined)).toBeNull();
    expect(resolveDragToCloseConfig(false)).toBeNull();
  });

  it('returns defaults for true', () => {
    expect(resolveDragToCloseConfig(true)).toEqual({
      threshold: DEFAULT_DRAG_TO_CLOSE_THRESHOLD,
      minVelocity: DEFAULT_DRAG_TO_CLOSE_MIN_VELOCITY,
      dragFrom: 'handle',
    });
  });

  it('clamps invalid threshold and velocity', () => {
    expect(resolveDragToCloseConfig({ threshold: -1, minVelocity: -5 })).toEqual({
      threshold: DEFAULT_DRAG_TO_CLOSE_THRESHOLD,
      minVelocity: 0,
      dragFrom: 'handle',
    });

    expect(resolveDragToCloseConfig({ threshold: 2 })).toEqual({
      threshold: 1,
      minVelocity: DEFAULT_DRAG_TO_CLOSE_MIN_VELOCITY,
      dragFrom: 'handle',
    });
  });

  it('preserves snap config when provided', () => {
    const snap = { initialSize: '200px', expandedSize: '60vh' };

    expect(resolveDragToCloseConfig({ snap })).toEqual({
      threshold: DEFAULT_DRAG_TO_CLOSE_THRESHOLD,
      minVelocity: DEFAULT_DRAG_TO_CLOSE_MIN_VELOCITY,
      dragFrom: 'handle',
      snap,
    });
  });

  it('resolves dragFrom pane', () => {
    expect(resolveDragToCloseConfig({ dragFrom: 'pane' })).toEqual({
      threshold: DEFAULT_DRAG_TO_CLOSE_THRESHOLD,
      minVelocity: DEFAULT_DRAG_TO_CLOSE_MIN_VELOCITY,
      dragFrom: 'pane',
    });
  });
});

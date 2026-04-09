import { vi } from 'vitest';

import { CLOSE_REASON_PROGRAMMATIC } from './close-reason';
import {
  resolveOverlayCloseAnimationDurationMs,
  runOverlayBeforeClose,
  runOverlayBeforeOpen,
} from './overlay-config-lifecycle';

describe('runOverlayBeforeOpen', () => {
  it('allows open when callback is missing', async () => {
    await expect(runOverlayBeforeOpen(undefined)).resolves.toBe(true);
  });

  it('allows open when callback returns true', async () => {
    await expect(runOverlayBeforeOpen(() => true)).resolves.toBe(true);
  });

  it('blocks open when callback returns false', async () => {
    await expect(runOverlayBeforeOpen(() => false)).resolves.toBe(false);
  });
});

describe('runOverlayBeforeClose', () => {
  it('allows close when callback is missing', async () => {
    await expect(
      runOverlayBeforeClose(undefined, undefined, CLOSE_REASON_PROGRAMMATIC),
    ).resolves.toBe(true);
  });

  it('passes fallback reason when reason is undefined', async () => {
    const fn = vi.fn().mockResolvedValue(true);
    await runOverlayBeforeClose(fn, undefined, CLOSE_REASON_PROGRAMMATIC);
    expect(fn).toHaveBeenCalledWith(CLOSE_REASON_PROGRAMMATIC);
  });

  it('blocks close when callback returns false', async () => {
    await expect(
      runOverlayBeforeClose(() => false, 'escape', CLOSE_REASON_PROGRAMMATIC),
    ).resolves.toBe(false);
  });
});

describe('resolveOverlayCloseAnimationDurationMs', () => {
  it('returns 0 when reduced motion is preferred', () => {
    expect(resolveOverlayCloseAnimationDurationMs(300, 200, 150, true)).toBe(0);
  });

  it('uses override then config then default when not reduced motion', () => {
    expect(resolveOverlayCloseAnimationDurationMs(99, 200, 150, false)).toBe(99);
    expect(resolveOverlayCloseAnimationDurationMs(undefined, 200, 150, false)).toBe(200);
    expect(resolveOverlayCloseAnimationDurationMs(undefined, undefined, 150, false)).toBe(150);
  });
});

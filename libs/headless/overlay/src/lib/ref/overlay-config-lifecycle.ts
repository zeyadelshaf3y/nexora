import { prefersReducedMotion } from '@nexora-ui/core';

import type { CloseReason } from './close-reason';
import type { OverlayConfig } from './overlay-config';

/** Resolves `beforeOpen`; returns false only when the callback explicitly returns false. */
export async function runOverlayBeforeOpen(
  beforeOpen: OverlayConfig['beforeOpen'],
): Promise<boolean> {
  if (!beforeOpen) return true;
  const allow = await Promise.resolve(beforeOpen());

  return allow !== false;
}

/** Resolves `beforeClose`; returns false only when the callback explicitly returns false. */
export async function runOverlayBeforeClose(
  beforeClose: OverlayConfig['beforeClose'],
  reason: CloseReason | undefined,
  fallbackReason: CloseReason,
): Promise<boolean> {
  if (!beforeClose) return true;
  const allow = await Promise.resolve(beforeClose(reason ?? fallbackReason));

  return allow !== false;
}

/**
 * Effective close animation duration: 0 when reduced motion is preferred, otherwise
 * override → config → default.
 *
 * @param prefersReducedMotionHint — when set, used instead of calling {@link prefersReducedMotion}
 * (for tests). Omit in production code.
 */
export function resolveOverlayCloseAnimationDurationMs(
  overrideMs: number | undefined,
  configCloseAnimationMs: number | undefined,
  defaultMs: number,
  prefersReducedMotionHint?: boolean,
): number {
  const reduced =
    prefersReducedMotionHint !== undefined ? prefersReducedMotionHint : prefersReducedMotion();

  if (reduced) return 0;

  return overrideMs ?? configCloseAnimationMs ?? defaultMs;
}

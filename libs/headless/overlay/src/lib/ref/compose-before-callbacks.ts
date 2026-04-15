/**
 * Compose multiple `beforeOpen` / `beforeClose` hooks so they run in order.
 * The first callback runs first; if it returns `false`, the second is not invoked.
 * Use when layering hooks (e.g. directive defaults + trigger/panel overrides).
 */

import type { CloseReason } from './close-reason';
import type { BeforeCloseCallback, BeforeOpenCallback } from './overlay-config';

export function composeBeforeOpenCallbacks(
  first?: BeforeOpenCallback,
  second?: BeforeOpenCallback,
): BeforeOpenCallback | undefined {
  if (!first && !second) return undefined;

  return () => {
    const firstResult = first ? Promise.resolve(first()) : Promise.resolve(undefined);

    return firstResult.then((allowed) => {
      if (allowed === false) return false;

      return second ? second() : undefined;
    });
  };
}

export function composeBeforeCloseCallbacks(
  first?: BeforeCloseCallback,
  second?: BeforeCloseCallback,
): BeforeCloseCallback | undefined {
  if (!first && !second) return undefined;

  return (reason: CloseReason) => {
    const firstResult = first ? Promise.resolve(first(reason)) : Promise.resolve(undefined);

    return firstResult.then((allowed) => {
      if (allowed === false) return false;

      return second ? second(reason) : undefined;
    });
  };
}

/**
 * @nexora-ui/core — platform utilities (env, id, dom, events, animation, layout, value, debug).
 * All APIs are SSR-safe where applicable.
 */
export { canUseDOM, getGlobal } from './lib/env';
export { createId, idFactory } from './lib/id';
export {
  ownerDocument,
  getActiveElement,
  safeFocus,
  FOCUSABLE_SELECTOR,
  contains,
  hasClosest,
  scrollParents,
  observeResize,
  getViewportRect,
  getResolvedDir,
} from './lib/dom';
export { listen, type EventTargetLike, composeHandlers } from './lib/events';
export { rafThrottle, createRafThrottled, prefersReducedMotion } from './lib/animation';
export {
  type Rect,
  rectsIntersect,
  rectsIntersectStrict,
  rectFromSize,
  clamp,
  reindexStackIndicesAfterRemoval,
} from './lib/layout';
export { warnOnce, invariant } from './lib/debug';
export { resolveMaybeGetter } from './lib/value';

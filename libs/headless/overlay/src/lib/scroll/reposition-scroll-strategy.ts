import type { ScrollStrategy } from './scroll-strategy';

/**
 * Scroll strategy used when scroll strategy key is 'reposition'.
 * Same attach/detach as noop (no scroll blocking or close-on-scroll).
 * Distinguished from NoopScrollStrategy so config can apply reposition-specific
 * behavior (e.g. maintainInViewport) to the position strategy.
 */
export class RepositionScrollStrategy implements ScrollStrategy {
  attach(): void {}
  detach(): void {}
}

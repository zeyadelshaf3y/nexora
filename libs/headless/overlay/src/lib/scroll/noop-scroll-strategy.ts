import type { ScrollStrategy } from './scroll-strategy';

/** Scroll strategy that does nothing. */
export class NoopScrollStrategy implements ScrollStrategy {
  attach(): void {}
  detach(): void {}
}

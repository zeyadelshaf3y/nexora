/**
 * Shared parameter shape for `createDropdownAnchoredConfig` and `createMenuAnchoredConfig`.
 * The menu preset adds optional `arrowSize` (see `OverlayConfig`).
 */

import type { Placement } from '../position/position-strategy';
import type { ScrollStrategy } from '../scroll/scroll-strategy';

import type { BeforeCloseCallback, BeforeOpenCallback, ViewportBoundaries } from './overlay-config';
import type { OverlayRef } from './overlay-ref';

/** Fields common to dropdown- and menu-style anchored overlay presets. */
export interface BaseAnchoredPresetParams {
  readonly anchor: HTMLElement;
  readonly placement?: Placement;
  readonly offset?: number;
  readonly scrollStrategy: ScrollStrategy;
  readonly closeAnimationDurationMs: number;
  readonly parentRef?: OverlayRef;
  readonly panelClass?: string | string[];
  readonly backdropClass?: string | string[];
  readonly panelStyle?: Record<string, string>;
  readonly backdropStyle?: Record<string, string>;
  readonly maxHeight?: string;
  readonly width?: string;
  readonly hasBackdrop?: boolean;
  readonly beforeOpen?: BeforeOpenCallback;
  readonly beforeClose?: BeforeCloseCallback;
  /** Only for reposition scroll strategy. When true (default), keep panel in viewport. */
  readonly maintainInViewport?: boolean;
  readonly boundaries?: ViewportBoundaries;
}

import { DefaultFocusStrategy } from '../focus/default-focus-strategy';
import type { FocusStrategy } from '../focus/focus-strategy';
import { BlockScrollStrategy } from '../scroll/block-scroll-strategy';
import { NoopScrollStrategy } from '../scroll/noop-scroll-strategy';
import type { ScrollStrategy } from '../scroll/scroll-strategy';

/** Slice of dialog/drawer open options used for shared defaults. */
export type PanelOverlayModalOpenOptionsSlice = {
  readonly scrollStrategy?: ScrollStrategy;
  readonly hasBackdrop?: boolean;
  readonly focusStrategy?: FocusStrategy;
};

/**
 * Default scroll strategy for modal-style panel services ({@link DialogService}, {@link DrawerService}):
 * block document scroll when backdrop is on (default), noop when backdrop is explicitly off.
 */
export function resolvePanelOverlayScrollStrategy(
  options?: Pick<PanelOverlayModalOpenOptionsSlice, 'scrollStrategy' | 'hasBackdrop'>,
): ScrollStrategy {
  return (
    options?.scrollStrategy ??
    (options?.hasBackdrop !== false ? new BlockScrollStrategy() : new NoopScrollStrategy())
  );
}

/** Default: {@link DefaultFocusStrategy}. */
export function resolvePanelOverlayFocusStrategy(
  options?: Pick<PanelOverlayModalOpenOptionsSlice, 'focusStrategy'>,
): FocusStrategy {
  return options?.focusStrategy ?? new DefaultFocusStrategy();
}

/** Default: `true` (modal chrome). */
export function resolvePanelOverlayHasBackdrop(
  options?: Pick<PanelOverlayModalOpenOptionsSlice, 'hasBackdrop'>,
): boolean {
  return options?.hasBackdrop ?? true;
}

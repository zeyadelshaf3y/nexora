import { type OverlayRef, subscribeOnceAfterClosed } from '@nexora-ui/overlay';

/**
 * Subscribes once to `ref.afterClosed()` and clears the slot only if it still holds `ref`.
 * Prefer this over `ref.afterClosed().subscribe(...)` so teardown matches headless overlay helpers.
 */
export function bindClearOverlayOnClose(
  ref: OverlayRef | null,
  read: () => OverlayRef | null,
  write: (next: OverlayRef | null) => void,
): void {
  if (!ref) return;
  subscribeOnceAfterClosed(ref, () => {
    if (read() === ref) write(null);
  });
}

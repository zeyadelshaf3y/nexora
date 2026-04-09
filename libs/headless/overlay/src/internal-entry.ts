/**
 * `@nexora-ui/overlay/internal` — implementation hooks for Nexora headless packages (dynamic
 * component I/O, pane close registry).
 *
 * Applications should use `OverlayService`, `DialogService`, `DrawerService`, or `SnackbarService`
 * from the root `@nexora-ui/overlay` / `@nexora-ui/snackbar` entry points. Import this entry only
 * when building or extending headless behavior (same tier as `OverlayService` internals).
 *
 * **Root `@nexora-ui/overlay`** still exposes `isComponent`, `getContainingOverlayRef`, and the
 * concrete close directives (`CloseDialogDirective`, `CloseDrawerDirective`) for apps.
 *
 * **`BaseCloseOverlayDirective`** is here so sibling packages (e.g. popover) can extend the same
 * click → `handleCloseClick` path without widening the app-facing overlay entry.
 *
 * **`afterClosedOnceUntilDestroyed`** (uses `takeUntilDestroyed`) lives here so the root **`@nexora-ui/overlay`** entry stays free of that dependency for tree-shaking. **`afterClosedOnce`** / **`subscribeOnceAfterClosed`** are also re-exported from this entry for library authors who already import **`/internal`**.
 */

export {
  applyComponentInputs,
  subscribeComponentOutputs,
  unsubscribeComponentOutputSubscriptions,
} from './lib/utils/apply-component-bindings';

export {
  type CloseableRef,
  registerCloseableRef,
  unregisterCloseableRef,
  closestCloseableRef,
  handleCloseClick,
} from './lib/close/closeable-ref-registry';

export { BaseCloseOverlayDirective } from './lib/close/base-close-overlay.directive';

export { afterClosedOnce, subscribeOnceAfterClosed } from './lib/utils/subscribe-once-after-closed';

export { afterClosedOnceUntilDestroyed } from './lib/utils/after-closed-once-until-destroyed';

export { resolveViewContainerRefFromExplicitOptions } from './lib/utils/resolve-view-container-ref';

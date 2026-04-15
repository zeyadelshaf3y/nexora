# `@nexora-ui/overlay/internal`

Secondary entry for **Nexora headless packages** that open dynamic Angular components with the same input/output wiring as `OverlayService.open()`.

## Exports

- `applyComponentInputs` — set `ComponentRef` inputs from an `OpenInputs` map
- `subscribeComponentOutputs` / `unsubscribeComponentOutputSubscriptions` — wire `OutputRef` handlers and tear them down
- `registerCloseableRef` / `unregisterCloseableRef` / `closestCloseableRef` / `handleCloseClick` — pane → `CloseableRef` registry (used by overlay ref impl, snackbar, tests)
- `CloseableRef` — type for refs registered on pane elements
- `BaseCloseOverlayDirective` — shared `[click]` → `handleCloseClick` base for **library** close directives (e.g. `ClosePopoverDirective` in `@nexora-ui/popover`)
- `afterClosedOnce` / `subscribeOnceAfterClosed` — also on **root** `@nexora-ui/overlay` (RxJS-only module, app-friendly tree-shaking)
- `afterClosedOnceUntilDestroyed` — `afterClosedOnce` + `takeUntilDestroyed(destroyRef)`; **internal-only** so the root entry does not pull `DestroyRef` wiring unless needed
- `subscribeOnceAfterClosed` — `afterClosedOnce(ref).subscribe(fn)`; returns `Subscription` for early `unsubscribe()`

`isComponent` and **`getContainingOverlayRef`** remain on the **root** `@nexora-ui/overlay` entry. **`CloseDialogDirective`** and **`CloseDrawerDirective`** stay on the root entry.

Typical applications should not import this entry; use `OverlayService`, `DialogService`, `DrawerService`, or `SnackbarService` instead.

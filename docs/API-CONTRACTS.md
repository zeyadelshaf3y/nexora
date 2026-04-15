# API Contracts

Stable API contract for `@nexora-ui/*` packages.

## Stable surface

- Public symbols exported from each package root entrypoint (`src/index.ts`) are the supported API.
- Breaking changes to this surface require major-version handling.

## Internal surface

- Source folders named `internal/` are implementation details unless published as a **documented subpath** (see below).
- Internal helpers/tokens/components should not be exported from package roots unless explicitly declared stable.

## Published subpath entry points

Some packages ship a **secondary** entry (same npm package, different `exports` subpath). These are stable for **library authors** (Nexora headless packages or advanced integrations), not required for typical app code.

| Package                  | Subpath     | Purpose                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------ | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@nexora-ui/listbox-cdk` | `/internal` | Portal factory, virtual selection/index math, viewport scroll, `afterVirtualPanelFirstPaint`, and related types (see [MIGRATION.md](./MIGRATION.md)).                                                                                                                                                                                                                             |
| `@nexora-ui/overlay`     | `/internal` | `ComponentRef` I/O wiring, **`afterClosedOnceUntilDestroyed`** (and re-exports **`afterClosedOnce`** / **`subscribeOnceAfterClosed`** for convenience), pane **close-registry** (`registerCloseableRef`, …), `BaseCloseOverlayDirective` for sibling close directives, and **`resolveViewContainerRefFromExplicitOptions`** (shared open-path VCR resolution with e.g. snackbar). |

**Root `@nexora-ui/overlay`** still exposes `OverlayService`, dialog/drawer services, `isComponent`, `getContainingOverlayRef`, `CloseDialogDirective`, `CloseDrawerDirective`, **`afterClosedOnce`**, **`subscribeOnceAfterClosed`** (RxJS-only one-shot `afterClosed` helpers), and the rest of the app-facing overlay API.

## Import rules

- Use package imports (`@nexora-ui/overlay`, `@nexora-ui/select`, etc.).
- Subpaths: `@nexora-ui/listbox-cdk/internal`, `@nexora-ui/overlay/internal` — only when you intentionally depend on the contracts in the table above.
- Do not deep-import from `.../src/lib/...` across library boundaries.

## Core `resolveMaybeGetter`

- **`resolveMaybeGetter`** (`@nexora-ui/core`, **value** module) resolves optional reactive fields typed as `T | (() => T) | undefined`. It is stable on the **root** package entry (not a subpath). Overlay and dropdown use it for lazy element/host and dropdown options.

## Listbox overlay `onListboxReady` helpers (`@nexora-ui/listbox`)

- **`scheduleListboxScrollActiveOnNextMicrotask(listbox)`** — root export; queues **`scrollActiveIntoView()`** on the next microtask after attach (layout / virtual geometry).
- **`bindListboxReadyWithActiveScroll(setListboxRef)`** — root export; returns an **`onListboxReady`** handler that stores the listbox ref then calls **`scheduleListboxScrollActiveOnNextMicrotask`**. **`ListboxScrollActiveCapable`** is the minimal scroll surface.
- Nexora **select** and **combobox** use **`bindListboxReadyWithActiveScroll`** through internal listbox overlay portal factories; custom portaled listboxes may import the same helpers from the listbox package root.

## Dropdown anchored host teardown (`@nexora-ui/dropdown`)

- **`teardownAnchoredDropdownHostState`** — root export; runs **`beginHostDestroy`**, **`dropdownRef.destroy()`**, **`detachListboxRef`**, and **`clearOpenState`** in order. Used by **select**, **combobox**, and **menu** so teardown stays consistent with **`DropdownRef`** and host listbox/open signals.

- **`routeHeadlessDropdownTriggerKeydown`** — root export; wires closed-trigger open keys (**`OPEN_KEYS`**) and open-panel forwarding via **`DropdownRef.handleTriggerKeydown`**. Used by **select** and **menu** (combobox uses input-specific keys instead).

## Select and dropdown display strings

- **`computeDisplayValue`** and **`resolveDisplayLabel`** are exported from **`@nexora-ui/dropdown`**. They are **not** re-exported from **`@nexora-ui/select`**; custom trigger markup should import from dropdown (types align with `SelectAccessors` / listbox accessors).

## Menu panel portal (internal only)

- **`createMenuPanelPortal`** (`libs/headless/menu/src/lib/internal/create-menu-panel-portal.ts`) builds the **`ComponentPortal`** for **`MenuPanelHostComponent`** with **`NXR_MENU_CONTEXT`**. It is **not** exported from **`@nexora-ui/menu`** — same pattern as select/combobox internal listbox overlay portal helpers.

## Mention `getItems`

- **`MentionItemsResult<T>`** is the return type of **`MentionTriggerConfig.getItems`**: synchronous **`readonly T[]`**, **`Promise<readonly T[]>`**, or **`Observable<readonly T[]>`**. The type is exported from **`@nexora-ui/mention`** for implementers. The controller treats lists as read-only (do not mutate arrays after returning them). See [MIGRATION.md](./MIGRATION.md).

## Contract tests

- Add tests for lifecycle, close reasons, keyboard behavior, and event emissions on public components/directives.
- Add regression tests for race conditions and teardown semantics in overlay-based primitives.

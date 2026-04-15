# Architecture Guidelines

Guidelines for how the Nexora monorepo and headless libraries are structured. Use this when adding features, new libraries, or refactoring so the codebase stays consistent and maintainable.

## Monorepo layout

- **Apps** (`apps/`): Demo app (`demo`) and E2E tests (`demo-e2e`). No production apps in this repo.
- **Libraries** (`libs/headless/`): Publishable headless UI packages. Each lib is a single Nx project with its own `src/`, `ng-package.json`, and public API via `src/index.ts`.
- **Docs** (`docs/`): Markdown documentation for developers and AI agents. Keep architecture, behavior, and API design in docs; lib-specific details in each lib’s README.

## Library dependency rules

- **@nexora-ui/core**: No UI or framework UI dependencies. Used by all other headless libs for DOM, env, id, events, animation, layout, debug.
- **@nexora-ui/overlay**: Depends only on core. Provides overlay engine (stack, positioning, scroll/focus strategies, close behavior).
- **@nexora-ui/popover**, **@nexora-ui/tooltip**, **@nexora-ui/snackbar**: Depend on overlay (and thus core). Do not depend on each other.
- **@nexora-ui/interactions**: Focus trap and similar; depends on core. Can be used by overlay-based components but is not a dependency of overlay itself.
- **@nexora-ui/listbox**: Depends on **core** only. Provides option modeling, keyboard navigation, and listbox/menu semantics.
- **@nexora-ui/dropdown**: Depends on **core** and **overlay**. Provides anchored open/close lifecycle used by select, menu, and combobox (those packages compose listbox separately). Shared `DropdownRef` wiring: **`buildHeadlessDropdownRefOptions`** / **`HeadlessDropdownRefOptionsInput`**.
- **@nexora-ui/select**, **@nexora-ui/menu**, **@nexora-ui/combobox**: Depend on dropdown/listbox/overlay/core per feature needs.
- **@nexora-ui/mention**: Depends on overlay and core; contenteditable mention parsing/session/insert behavior.

No circular dependencies. New libraries must respect this DAG and current Nx tag/lint boundaries.

## Tree-shaking and overlay

The **overlay** package is the single home for both the overlay engine (stack, positioning, portal, close behavior) and the dialog/drawer conveniences (`DialogService`, `DrawerService`, and their close directives). Consumers who only use **tooltip** or **popover** should import only the symbols they need from `@nexora-ui/overlay` (e.g. via `@nexora-ui/tooltip` or `@nexora-ui/popover`, which do not import `DialogService` or `DrawerService`). With `sideEffects: false` and ESM, the bundler can tree-shake unused overlay exports so that dialog/drawer code is omitted when not used.

**Tree-shaking verification:** To confirm tree-shaking, (1) create a minimal app that imports only from `@nexora-ui/tooltip` (or `@nexora-ui/popover`), (2) run a production build, (3) inspect the bundle (e.g. search for `DialogService` or `DrawerService`) to ensure they are absent. If dialog/drawer symbols appear in the bundle, consider splitting them into a separate entry or package that depends only on overlay. All headless packages set `sideEffects: false` in their package.json.

## Per-library structure

- **Flat domain folders** under `src/lib/`: e.g. `ref/`, `position/`, `close/`, `portal/`, `services/`. Group by domain, not by type (no “models/”, “services/” at top level unless the lib is tiny). Folder names may be singular or plural per lib (e.g. overlay uses `services/`, snackbar uses `service/`); consistency within a lib is what matters.
- **Barrel files**: One `index.ts` per domain folder that re-exports public types and functions. Main `src/index.ts` is the single public API surface; export only what the user or other libs need.
- **No cross-lib deep imports**: Import from the package name (e.g. `@nexora-ui/overlay`), not from relative paths into another lib’s `src/`.

## Separation of concerns

- **Positioning**: Pure functions or strategy classes that take context (viewport, anchor, placement) and return coordinates/size. No direct DOM or Angular APIs in position strategies.
- **Lifecycle and DOM**: Overlay ref implementation attaches/detaches content, applies position, subscribes to resize/scroll. It uses position strategies; it does not implement placement math.
- **Close behavior**: Centralized in overlay (stack, Escape, outside click, backdrop). Dialogs, drawers, popovers, tooltips use the same close pipeline; snackbar uses overlay but has its own close-with-value contract.
- **Directives**: Thin layer over services and overlay APIs. They handle template bindings and call into overlay/utils; complex logic lives in services or shared utilities (e.g. `overlay/utils`).

## Shared utilities and reuse

- **Overlay utils** (`libs/headless/overlay/src/lib/utils/`): Shared by popover and tooltip (e.g. `triggerIncludes`, `setupAnchoredOverlayOpenedState`, `createAnchoredOverlayConfig`, hover leave, outside click). When adding behavior used by both, add it here rather than duplicating in each directive.
- **Close directives**: Dialog, drawer, and popover extend overlay’s `BaseCloseOverlayDirective`. Snackbar does not (different close contract: value on close). Do not duplicate close logic.
- **Ref implementations**: One ref implementation per overlay type (e.g. `OverlayRefImpl`, `SnackbarRefImpl`). Wrappers add type-specific behavior (e.g. `SnackbarRef.close(value)`); core lifecycle stays in overlay.

## Configuration and defaults

- **Options over many parameters**: Public and internal APIs use option objects (e.g. `OverlayConfig`, `SnackbarOpenOptions`). Avoid long parameter lists.
- **Constants**: Defaults (durations, sizes, z-index base) live in the lib that uses them (e.g. `overlay/defaults/`, lib-specific constants). No magic numbers in the public API surface.
- **Injection tokens**: Use tokens for global config (e.g. `OVERLAY_BASE_Z_INDEX`) so apps can override without changing library code.

## Nested overlays and stacking

- Overlays are stacked in registration order. Top of stack gets highest z-index and is the only one closed by Escape or “outside click” when the click is on the backdrop.
- **Nested overlays**: When opening an overlay from inside another (e.g. popover inside dialog), set `parentRef` so close behavior is scoped. Use `getContainingOverlayRef(element)` to obtain the parent ref. Directives (popover, tooltip) set `parentRef` automatically when the trigger is inside an overlay pane.
- **Content-scoped overlays**: Use `host` and `outsideClickBoundary` so dialogs/drawers open inside a content area and clicks on header/sidebar do not close them. See overlay README.

## Performance and lifecycle

- **Document-level listeners**: Attach once when the overlay stack is first used (Escape, pointerdown). Do not attach per overlay.
- **Per-overlay listeners**: Resize/scroll for repositioning are registered per overlay and cleared on close. No listener leaks after close.
- **Re-entrancy**: Guard open/close (e.g. `if (this.closed) return`) to avoid double-close or attach-after-close. Restore focus on close.

## What not to do

- Do not add framework or UI dependencies to core.
- Do not create circular dependencies between headless libs.
- Do not put business logic in directives; use services or pure functions.
- Do not duplicate close, positioning, or trigger logic between popover and tooltip; use overlay utils.
- Do not export internal helpers as part of the main public API; document which symbols are stable vs internal (see READMEs and PUBLIC-API-DESIGN.md).

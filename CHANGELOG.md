## 0.0.2 (2026-04-09)

This was a version bump only, there were no code changes.

# Changelog

All notable changes to the Nexora headless libraries will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **@nexora-ui/listbox**: **`bindListboxReadyWithActiveScroll`** — builds **`onListboxReady`** for portaled hosts (stores listbox ref + **`scheduleListboxScrollActiveOnNextMicrotask`**); used by select/combobox portal factories.
- **@nexora-ui/dropdown**: **`routeHeadlessDropdownTriggerKeydown`** — shared select/menu trigger **`keydown`** routing (`OPEN_KEYS` when closed, listbox forward when open); **`route-headless-dropdown-trigger-keydown.spec.ts`**.
- **@nexora-ui/dropdown**: **`teardownAnchoredDropdownHostState`** — shared **`DropdownRef.destroy()`** + listbox/open cleanup for select, combobox, and menu; **`teardown-anchored-dropdown-host.spec.ts`**.
- **@nexora-ui/core**: **`resolveMaybeGetter`** — resolves `T | (() => T) | undefined` for optional reactive config (shared by overlay lazy element/host resolution and dropdown **`resolveDropdownOption`**).
- **@nexora-ui/overlay** (root): **`afterClosedOnce`** and **`subscribeOnceAfterClosed`** — RxJS-only one-shot **`afterClosed()`** helpers for apps and sibling packages (no **`takeUntilDestroyed`** in the primary entry; see **`afterClosedOnceUntilDestroyed`** on **`/internal`**). Implementation split: **`subscribe-once-after-closed.ts`** vs **`after-closed-once-until-destroyed.ts`** for cleaner tree-shaking.
- **@nexora-ui/overlay/internal**: Secondary entry for headless implementations — component ref **`inputs`/`outputs`** wiring (`applyComponentInputs`, `subscribeComponentOutputs`, `unsubscribeComponentOutputSubscriptions`), **close-registry** helpers (`registerCloseableRef`, `unregisterCloseableRef`, `closestCloseableRef`, `handleCloseClick`, `CloseableRef`), **`BaseCloseOverlayDirective`** (e.g. popover’s close button), and **`resolveViewContainerRefFromExplicitOptions`** (explicit VCR / injector resolution before lazy overlay host fallback). Root **`@nexora-ui/overlay`** still exports **`isComponent`**, **`getContainingOverlayRef`**, **`CloseDialogDirective`**, and **`CloseDrawerDirective`**. See **`docs/MIGRATION.md`**.
- **@nexora-ui/mention**: Public re-export of type **`MentionItemsResult`** for annotating **`getItems`** implementations.
- **@nexora-ui/menu**: `boundaries` input (overlay viewport inset) and `disable()` / `enable()` for programmatic disabling, aligned with select/combobox.
- **@nexora-ui/select**: `boundaries` input (overlay viewport inset) and `disable()` / `enable()` for programmatic disabling, aligned with combobox overlay options.
- **@nexora-ui/core**: `getResolvedDir(element?)` — SSR-safe helper to resolve text direction (`'ltr'` | `'rtl'`) from an element's nearest `[dir]` ancestor or the document. Used by overlay and listbox for RTL-aware positioning and keyboard navigation.
- **Overlay README**: Stable vs Internal API table; documentation for `beforeOpen` / `beforeClose` (return `false` to cancel open or prevent close).
- **Docs**: RTL native support and listbox keyboard behavior in ACCESSIBILITY.md and HEADLESS-BEHAVIOR.md; tree-shaking verification steps in ARCHITECTURE.md and DEVELOPMENT.md.
- **CI**: Install Playwright browsers (`npx playwright install --with-deps`) before `e2e-ci` so Chromium, Firefox, and WebKit are available on Linux agents.
- **Dropdown**: `vite.config.mts` and `passWithNoTests: true` so `nx run dropdown:test` runs even when no spec files exist yet.
- **@nexora-ui/dropdown**: **`buildHeadlessDropdownRefOptions`** / **`HeadlessDropdownRefOptionsInput`** for select/combobox/menu `DropdownRef` wiring (optional **`configPreset`** / **`arrowSize`**); specs in **`build-headless-dropdown-ref-options.spec.ts`**.

### Fixed

- **@nexora-ui/overlay**: **`OverlayStackService.unregister`** only removes an id from the registered-id set when the **`OverlayRef` instance** is actually removed from the stack (avoids clearing another overlay’s id if **`unregister`** is called with an unrelated object that reuses the same **`id` string**).

### Changed

- **@nexora-ui/menu**: Internal **`createMenuPanelPortal`**, **`MENU_PANE_CLASS`** / **`MENU_DEFAULT_ARROW`**, **`buildMenuDropdownRefOptions`**, **`handleMenuDropdownOpened`/`Closed`**, **`assertMenuContentStructure`**, **`focusMenuPanelAutofocusTarget`**, **`internal/index`**, **`menu-dropdown-ref-options.spec.ts`** — parity with select/combobox structure; trigger uses shared **`routeHeadlessDropdownTriggerKeydown`**.
- **@nexora-ui/select**: Uses **`routeHeadlessDropdownTriggerKeydown`** from dropdown; removed internal **`select-trigger-keyboard.ts`**.
- **Docs**: [API-CONTRACTS.md](docs/API-CONTRACTS.md) documents listbox overlay helpers, dropdown **`teardownAnchoredDropdownHostState`** and **`routeHeadlessDropdownTriggerKeydown`**, and menu internal portal wiring.
- **@nexora-ui/select** / **@nexora-ui/combobox**: Internal **`createSelectListboxOverlayPortal`** / **`createComboboxListboxOverlayPortal`** centralize listbox overlay portal + **`bindListboxReadyWithActiveScroll`** wiring.
- **@nexora-ui/combobox**: **`ComboboxContext`** is a type alias of **`NxrListboxOverlayPanelContext`** (same runtime contract; **`NXR_COMBOBOX_CONTEXT`** unchanged).
- **@nexora-ui/overlay** / **@nexora-ui/snackbar**: **`OverlayService`** and **`SnackbarService`** share **`resolveViewContainerRefFromExplicitOptions`** (exported from **`@nexora-ui/overlay/internal`**) for **`viewContainerRef` → injector → fallback** resolution; snackbar’s injector branch uses **`get(ViewContainerRef, null)`** (instead of a bare **`get(ViewContainerRef)`**) so a missing token falls through to the overlay lazy host instead of throwing.
- **@nexora-ui/listbox**: **`resolveListboxVirtualScrollIndex`** (**`utils/resolve-listbox-virtual-scroll-index.ts`**) centralizes virtual active-index resolution; **`ListboxDirective`** delegates to it — behavior unchanged; **`resolve-listbox-virtual-scroll-index.spec.ts`** added.
- **Docs**: [API-CONTRACTS.md](docs/API-CONTRACTS.md) documents **`resolveMaybeGetter`** and expands **`@nexora-ui/overlay/internal`** with **`resolveViewContainerRefFromExplicitOptions`**.
- **@nexora-ui/overlay**: **`overlay-resolve-elements`** (**`resolveOverlayHost`**, **`resolveOverlayLazyElement`**) delegates to **`@nexora-ui/core`** **`resolveMaybeGetter`** (including the global-container fallback for unset host) — same behavior, less duplicated logic.
- **@nexora-ui/dropdown**: **`resolveDropdownOption`** uses **`resolveMaybeGetter`** from **`@nexora-ui/core`** — same behavior for defined values/getters.
- **@nexora-ui/overlay**: **`OverlayEventsService`** returns early on **`keydown`** / **`pointerdown`** when the overlay stack is empty (skips unnecessary work).
- **@nexora-ui/overlay**: Viewport/host bounds math moved from **`OverlayRefImpl`** into internal **`overlay-viewport-bounds.ts`** (`applyBoundariesToRect`, **`formatMaxSize`**, **`setTransformOriginFromViewportPoint`**, **`intersectHostRectWithVisibleViewport`**) with **`overlay-viewport-bounds.spec.ts`** — no public API change.
- **@nexora-ui/overlay**: Further **`OverlayRefImpl`** decomposition — **`overlay-pane-from-config.ts`** (initial ARIA + pane sizing from config), **`overlay-transform-origin.ts`** (trigger-based **`transform-origin`**), **`overlay-enter-animation.ts`** (enter rAF scheduling and open/closing class transitions), each with specs — behavior and public API unchanged.
- **@nexora-ui/overlay**: **`overlay-position-cycle.ts`** — single **`runOverlayPositionCycle`** for strategy apply, **`applyPositionResult`**, and anchored max-height reset/clamp (**`shouldFollowAnchorOffViewport`**, etc.) with **`overlay-position-cycle.spec.ts`**; **`OverlayRefImpl.applyPosition`** delegates to it — no public API change.
- **@nexora-ui/overlay**: **`overlay-host-dom.ts`** (scoped vs global pane/backdrop mount + host **`position`** restore), **`overlay-reposition-registrations.ts`** (RAF throttle + **`createRepositionListeners`** + pane **`observeResize`**), **`applyPaneMaxSizesForContainedHost`** on **`overlay-viewport-bounds`** — internal only; specs for host DOM and viewport helper; no public API change.
- **@nexora-ui/overlay**: **`overlay-config-lifecycle.ts`** (**`runOverlayBeforeOpen`**, **`runOverlayBeforeClose`**, **`resolveOverlayCloseAnimationDurationMs`**) and **`overlay-pane-initial-styles.ts`** (**`applyInitialOverlayPaneAndBackdropStyles`**) with specs — internal only; no public API change.
- **@nexora-ui/overlay**: **`overlay-resolve-elements.ts`** (**`resolveOverlayHost`**, **`resolveOverlayLazyElement`**) and **`getOverlayBaseViewportRect`** / **`getOverlayPositioningViewportRect`** on **`overlay-viewport-bounds`** — internal only; specs added; **`transformOriginElement`** now uses **`resolveOverlayLazyElement`** (removed duplicate **`resolveTransformOriginElement`**); no public API change.
- **@nexora-ui/overlay**: **`overlay-close-visual.ts`** (**`runOverlayCloseVisualTransition`**) centralizes close CSS transition sequence; **`OverlayRefImpl`** uses **`getResolvedAnchor()`** for anchor resolution — internal only; no public API change.
- **@nexora-ui/overlay**: **`overlayHasHostOption`** on **`overlay-resolve-elements`** (also used by **`applyInitialOverlayPaneAndBackdropStyles`**); **`OverlayRefImpl`** uses **`hasScopedContentHostAttached()`**, **`getPositioningViewportRect()`**, and **`getResolvedTransformOriginElement()`** — internal only; no public API change.
- **@nexora-ui/overlay**: **`createRepositionListeners`** uses **`overlayHasHostOption`** for host-scoped scroll wiring (aligned with pane sizing and mount helpers); **`OverlayRefImpl.closeInternal`** uses private **`isBeforeCloseBlocking`** for the **`beforeClose`** guard — internal only; no public API change.
- **@nexora-ui/overlay**: **`overlayHasAnchorOption`** on **`overlay-resolve-elements`** (parallel to **`overlayHasHostOption`**); **`createRepositionListeners`**, **`createOverlayRepositionRegistrations`**, and **`overlay-position-cycle`** use it for anchored-overlay branches (including the pre-measure max-height reset). **`getOverlayBaseViewportRect`** uses **`overlayHasHostOption`** — internal only; no public API change.
- **@nexora-ui/overlay**: **`resolveOverlayLazyElementOrNull`** on **`overlay-resolve-elements`** — used by **`OverlayRefImpl.getResolvedOutsideClickBoundary`** for **`null`** when unset — internal only; no public API change.
- **@nexora-ui/overlay**: Added **`overlay-stack.service.spec.ts`** (stack order, z-index after middle removal, duplicate id, impostor **`unregister`**, **`getBaseZIndex`** override). **@nexora-ui/core**: expanded **`reindexStackIndicesAfterRemoval`** tests (remove first / remove tail) and documented the dense-array expectation.
- **Tooling**: ESLint **`@typescript-eslint/no-explicit-any`** is **error**; Angular templates enforce **`@angular-eslint/template/no-any`** (no **`$any()`**). **npm** is the documented package manager (removed **`pnpm-lock.yaml`** / **`pnpm-workspace.yaml`**; CI already used **`npm ci`**).
- **@nexora-ui/select**: **`buildDropdownRefOptions`** uses **`buildHeadlessDropdownRefOptions`** (`basePaneClass: 'nxr-select-pane'`).
- **@nexora-ui/menu**: **`buildDropdownRefOptions`** uses **`buildHeadlessDropdownRefOptions`** with **`configPreset: 'menu'`**, **`arrowSize`**, **`useVirtualPanel: false`**, and **`basePaneClass: 'nxr-menu-pane'`**; optional **`boundaries`** forwards to the overlay when set.
- **@nexora-ui/dropdown**: **`HeadlessDropdownRefOptionsInput.boundaries`** is optional—omitted means **`boundaries`** is not set on **`DropdownRefOptions`**.
- **@nexora-ui/combobox**: **`buildComboboxDropdownRefOptions`** wraps **`buildHeadlessDropdownRefOptions`** with **`COMBOBOX_PANE_CLASS`**. Internal **`internal/index.ts`** re-exports overlay context, multi backspace/unselect, and selection/search helpers for **`combobox.component.ts`**.
- **@nexora-ui/select**, **combobox**, **menu**: **`disable()`** closes an open overlay with **`programmatic`** before applying programmatic disable.
- **@nexora-ui/listbox**: Virtual keyboard index/alignment in **`virtual-scroll-nav-index`**; text-input / scroll-into-view helpers under **`utils`**; single id path via **`getOptionId`** (removed duplicate **`optionId`** on the directive); **`scheduleListboxScrollActiveOnNextMicrotask`** for overlay **`onListboxReady`** (used by select/combobox).
- **@nexora-ui/listbox-cdk**: Library source grouped under **`src/lib/{components,layout,portal,virtual}`**. Root exports: virtual panel, built-in dropdown/shell, template directives, and **`NXR_LISTBOX_CDK_OVERLAY_FLEX_COLUMN_CLASS`**. **`@nexora-ui/listbox-cdk/internal`**: portal factory, virtual selection signals, scroll/index math, **`afterVirtualPanelFirstPaint`**, and related types (see `docs/MIGRATION.md`).
- **@nexora-ui/dropdown**: **`resolveOpenPanelDirective`** (built-in virtual vs projected panel); **`createListboxVirtualDropdownPanelStyle`** lives in **`create-listbox-virtual-dropdown-panel-style.ts`** (re-exported from package index with **`ListboxVirtualDropdownPanelStyleSources`**).
- **Docs**: [API-CONTRACTS.md](docs/API-CONTRACTS.md) documents **`@nexora-ui/listbox-cdk/internal`** and **`@nexora-ui/overlay/internal`**, select vs dropdown display imports, and mention **`MentionItemsResult`**. [HEADLESS.md](docs/HEADLESS.md) index row updated for the expanded contract doc.
- **Docs**: `PROJECT-OVERVIEW` now describes **Vitest** (not Karma) for unit tests; [HEADLESS.md](docs/HEADLESS.md) documents `overlay/stack/` and indexes **API-CONTRACTS**, **MIGRATION**, **PERFORMANCE**, and **SECURITY**; **DEVELOPMENT** / **PROJECT-OVERVIEW** link those docs. Mention package docs describe a single coalescing input (`nxrMentionCoalesceSessionCheckToMicrotask`).
- **Docs and roadmap**: Replaced long implementation plans with [HEADLESS-COMPONENTS-PLAN.md](docs/HEADLESS-COMPONENTS-PLAN.md), removed obsolete internal plan files, and refreshed root/library docs for current package behavior and Angular 21.
- **Select/listbox/combobox guidance**: Clarified that select panels keep listbox semantics (no in-panel search input), fixed `nxrListboxInitialHighlight` docs, and cross-linked select/combobox/dropdown docs.
- **Architecture docs**: Updated dependency descriptions for listbox/dropdown and expanded behavior/accessibility/testing docs (`HEADLESS-BEHAVIOR`, `ACCESSIBILITY`, `TESTING`, `ARCHITECTURE`, `GLOSSARY`).
- **Demo app cleanup**: Reworked select demos to use external narrowing filters, removed debug logging/no-op handlers, fixed template a11y/lint issues, and tagged `apps/demo` with `scope:demo` for module-boundary linting. Dialog/drawer/overview demos clear **`OverlayRef`** fields via **`bindClearOverlayOnClose`** (**`subscribeOnceAfterClosed`** from **`@nexora-ui/overlay`**) instead of raw **`afterClosed().subscribe`**.
- **E2E modernization**: Updated specs to rely on Playwright `baseURL`, removed noisy logging, strengthened assertions (including dark-mode and console error checks), and documented test configuration expectations.
- **Demo E2E**: Select and combobox virtual large-list specs press ArrowDown repeatedly and assert a distant option (`Country 26`) scrolls into view.
- **Demo E2E** (`menu.spec.ts`): basic open/Escape, programmatic `disable()` / `enable()`, `disable()` closes an open menu, viewport `boundaries` smoke, and scroll-strategy cases moved from `overlay.spec.ts`.
- **Demo E2E** (`select-combobox.spec.ts`): basic select and combobox **`disable()`** closes an open listbox; demo **Basic Single** sections add **Disable API** / **Enable API** buttons.
- **Core RTL plumbing**: Overlay and listbox now resolve direction through `@nexora-ui/core` `getResolvedDir`; removed duplicated local direction utilities.
- **Overlay/dropdown lifecycle**: Standardized close subscriptions using `takeUntilDestroyed`/`take(1)`, passed `DestroyRef` through dropdown consumers, and removed manual unsubscribe bookkeeping in affected directives/components.
- **Shared dropdown internals**: Consolidated select/menu/combobox close/value helpers and split combobox internals into focused helper modules (`focus-open-state`, `close-behavior`, `display-sync`).
- **@nexora-ui/core**: **`composeHandlers`** returns a no-op when empty and returns the **same function reference** when a single handler is passed (avoids an extra wrapper).
- **`@nexora-ui/overlay`**: **`DropdownRef`** uses **`afterClosedOnceUntilDestroyed`** from **`/internal`** when a **`DestroyRef`** is set, else **`subscribeOnceAfterClosed`** from the root entry. **`MentionControllerImpl`**, **`SnackbarRefImpl`**, and **`SnackbarService`** import **`subscribeOnceAfterClosed`** from the root entry. Specs: **`subscribe-once-after-closed.spec.ts`**, **`after-closed-once-until-destroyed.spec.ts`**.
- **Type/lint hygiene**: Removed non-null assertions in key paths, clarified intentional eslint suppressions (host metadata / structural infer), cleaned small casts/import-order issues, and aligned RxJS operator imports to `rxjs`.
- **@nexora-ui/core**: **`composeHandlers`** and **`reindexStackIndicesAfterRemoval`** avoid forbidden non-null assertions (lint-clean under **`@typescript-eslint/no-non-null-assertion`**).
- **@nexora-ui/overlay** (and specs): **`import/order`** cleanup — merged same-module **`hover-bridge`** imports, alphabetized parent imports with inline **`import type`**, and consistent **`rxjs`** / **`vitest`** ordering in specs; **listbox-cdk** / **mention** spec import order aligned the same way.
- **Mention controller runtime**: Replaced manual `itemsSub` orchestration with `fetchRequest$` + `switchMap` + `takeUntil`, introduced `dispose()` for explicit pipeline teardown, and documented the directive-managed lifecycle in mention docs.
- **@nexora-ui/mention**: **`MentionItemsResult<T>`** is now **`readonly T[]`**, **`Promise<readonly T[]>`**, or **`Observable<readonly T[]>`** (implementation detail: controller stores panel items as read-only; mutable **`T[]`** from apps remains assignable). Added **`mention-rx.spec.ts`** for **`itemsResultToObservable`**.

### Removed

- **@nexora-ui/dropdown** (breaking): **`buildListboxControlDropdownRefOptions`** and **`ListboxControlDropdownRefOptionsInput`** — use **`buildHeadlessDropdownRefOptions`** / **`HeadlessDropdownRefOptionsInput`**.
- **@nexora-ui/listbox** (minor): `ListboxDirective.optionId()` — use **`getOptionId()`** (same as `NxrListboxController`).
- **@nexora-ui/mention** (breaking): `focusEditor()` — use `focus()` instead. `nxrMentionCoalesceSessionCheckToFrame` — use `nxrMentionCoalesceSessionCheckToMicrotask` (default `true`; same coalescing behavior as the previous default).
- **@nexora-ui/combobox**: `COMBOBOX_PANEL_HOST_CLASS` (unused duplicate of `NXR_LISTBOX_OVERLAY_PANEL_HOST_CLASS` from `@nexora-ui/listbox`).
- **@nexora-ui/select** (breaking): **`computeDisplayValue`** and **`resolveLabel`** are no longer re-exported from the package index — import **`computeDisplayValue`** and **`resolveDisplayLabel`** from **`@nexora-ui/dropdown`**.
- **@nexora-ui/overlay** (breaking): **`applyComponentInputs`**, **`subscribeComponentOutputs`**, **`unsubscribeComponentOutputSubscriptions`**, close-registry symbols (**`registerCloseableRef`**, **`unregisterCloseableRef`**, **`closestCloseableRef`**, **`handleCloseClick`**, **`CloseableRef`**), and **`BaseCloseOverlayDirective`** are no longer on the root entry — use **`@nexora-ui/overlay/internal`** (apps should keep using services and documented root APIs).

### Fixed

- **@nexora-ui/listbox-cdk**: Virtual viewport “nearest” scroll uses `parentElement.closest('[role="listbox"]')` for the visible strip so the CDK viewport element is never mistaken for the listbox root.
- **@nexora-ui/mention**: Chip hover `mouseout` from a chip to non-chip content **inside** the editor no longer uses the leave delay (immediate `mentionChipMouseLeave`).
- Lint errors in listbox, snackbar, and dropdown so all headless libs pass `nx run-many -t lint`.
- **`nx run demo:lint`** passes (module boundaries + demo source fixes). **`App` smoke test** asserts `router-outlet` (root template has no `h1`).

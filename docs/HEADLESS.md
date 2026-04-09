# Nexora Headless Libraries

Overview of the headless UI libraries: what each provides, how they fit together, and where to find details.

**For AI agents**: When implementing a feature or fixing a bug, use the [Documentation index](#documentation-index) below for architecture, clean code, Angular patterns, public API design, and required behavior. That gives full context without guessing.

## Libraries

| Library                     | Purpose                                                                                                                                                                      | README                                                                          |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| **@nexora-ui/core**         | Platform utilities: DOM, env, id, events, animation, layout, debug. SSR-safe.                                                                                                | [libs/headless/core/README.md](../libs/headless/core/README.md)                 |
| **@nexora-ui/overlay**      | Overlay system: dialogs (9 positions), drawers (4), anchored panels. Stack, Escape/outside/backdrop, focus, RTL.                                                             | [libs/headless/overlay/README.md](../libs/headless/overlay/README.md)           |
| **@nexora-ui/popover**      | Directive to open an anchored popover (template or component). Click, focus, or hover triggers.                                                                              | [libs/headless/popover/README.md](../libs/headless/popover/README.md)           |
| **@nexora-ui/tooltip**      | Directive to show a tooltip on hover/focus. Uses overlay for positioning and arrow.                                                                                          | [libs/headless/tooltip/README.md](../libs/headless/tooltip/README.md)           |
| **@nexora-ui/snackbar**     | Service to open snackbars (template or component) at viewport edges. Stacking, replace-by-group.                                                                             | [libs/headless/snackbar/README.md](../libs/headless/snackbar/README.md)         |
| **@nexora-ui/dropdown**     | Shared dropdown primitive: overlay lifecycle, trigger keyboard, focus restore, resize. Used by select, menu, combobox.                                                       | [libs/headless/dropdown/README.md](../libs/headless/dropdown/README.md)         |
| **@nexora-ui/listbox**      | Listbox primitive: keyboard navigation, selection, listbox/menu role. Used by select, menu, and combobox.                                                                    | [libs/headless/listbox/README.md](../libs/headless/listbox/README.md)           |
| **@nexora-ui/listbox-cdk**  | CDK virtual-scroll option list + listbox virtual-scroll handler; used by combobox/select built-in virtual mode.                                                              | [libs/headless/listbox-cdk/README.md](../libs/headless/listbox-cdk/README.md)   |
| **@nexora-ui/select**       | Headless select: dropdown single/multi, listbox, value binding, CVA.                                                                                                         | [libs/headless/select/README.md](../libs/headless/select/README.md)             |
| **@nexora-ui/combobox**     | Headless combobox: input + dropdown, search, single/multi, selectedValues, CVA.                                                                                              | [libs/headless/combobox/README.md](../libs/headless/combobox/README.md)         |
| **@nexora-ui/menu**         | Headless menu: dropdown with role=menu, action items, groups, optionActivated, no value binding.                                                                             | [libs/headless/menu/README.md](../libs/headless/menu/README.md)                 |
| **@nexora-ui/mention**      | Headless mention: trigger character in contenteditable opens suggestion panel at caret; `getItems` returns `readonly T[]` (sync/Promise/Observable); mention chip insertion. | [libs/headless/mention/README.md](../libs/headless/mention/README.md)           |
| **@nexora-ui/interactions** | Focus trap directive for modals (dialogs, drawers).                                                                                                                          | [libs/headless/interactions/README.md](../libs/headless/interactions/README.md) |

## How they fit together

- **Core** has no UI dependencies; overlay, popover, tooltip, snackbar, and interactions depend on core (and overlay depends on core only).
- **Overlay** is the engine for dialogs, drawers, and any anchored pane. Popover and tooltip use `OverlayService` + `AnchoredStrategy`; snackbar uses `OverlayService` + its own position strategy. **Dropdown** uses overlay’s `createDropdownAnchoredConfig` (or `createMenuAnchoredConfig` when preset is `'menu'`) and `OverlayService`; Select, Menu, and Combobox depend on dropdown for trigger+panel lifecycle. They typically build options with **`buildHeadlessDropdownRefOptions`** from `@nexora-ui/dropdown`.
- **Nested overlays**: When opening a popover or tooltip from inside a dialog/drawer, set `parentRef` (or use the directive, which does this via `getContainingOverlayRef`). Close behavior is stack-based: Escape and outside click apply top-first.
- **Listbox option identity**: `activeOptionId()`, `optionId()`, controller helpers (`getOptionId`, `isDisabled`, unregister/refresh), keyboard navigation, and typeahead resolve the registered DOM row using `nxrListboxCompareWith` / `nxrListboxAccessors.value` when the active or passed item is not the same object reference as the row. Details: [listbox README](../libs/headless/listbox/README.md).
- **Virtual lists**: Combobox/select built-in CDK mode wires `NxrListboxVirtualScrollHandler` with `resolveIndexForActive` for value-equal actives; initial scroll uses the first `virtualItems` row matching the selection (single or multi). Overlay **`panelStyle`** uses `createListboxVirtualDropdownPanelStyle` / `mergeVirtualDropdownPaneStyle` from `@nexora-ui/dropdown`; inner hosts align with **`NXR_LISTBOX_CDK_OVERLAY_FLEX_COLUMN_CLASS`** from `@nexora-ui/listbox-cdk`. Custom panels can use `ListboxCdkVirtualPanelComponent`; helpers and **`afterVirtualPanelFirstPaint`** live on `@nexora-ui/listbox-cdk/internal`. Controller refs expose `virtualScroll()` / `virtualEmptyMessage()`; see [PUBLIC-API-DESIGN.md](PUBLIC-API-DESIGN.md).

## Conventions

- **Options over many params**: Public APIs use option objects (e.g. `OverlayConfig`, `SnackbarOpenOptions`) instead of long parameter lists.
- **RTL**: Overlays use `dir` from anchor or document; dialog, drawer, anchored, and snackbar placements are RTL-aware (start/end flip).
- **Accessibility**: Focus restore, ARIA roles, and optional aria-label/aria-labelledby are documented per lib; use focus trap on modal content.

## Public API stability

- **Stable**: Services, directives, and types documented in each lib’s README and exported from the package index. We avoid breaking these in minor/patch releases.
- **Internal / implementation detail**: Helpers like `handleCloseClick`, `closestCloseableRef`, `registerCloseableRef` / `unregisterCloseableRef` are exported for use by our own directives but may change; prefer public directives and `getContainingOverlayRef` when building apps.

## Library architecture

Folder layout is grouped by domain, with ongoing hardening around API boundaries, shared abstractions, and lint-enforced architecture constraints.

| Library          | Layout                                                                                                                                                                                          | Notes                                                                                                            |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **core**         | `env/`, `id/`, `dom/`, `events/`, `animation/`, `layout/`, `debug/`                                                                                                                             | Barrel `index.ts` per folder; no duplication.                                                                    |
| **overlay**      | `ref/`, `position/`, `scroll/`, `focus/`, `close/`, `portal/`, `services/`, `stack/`, `directives/`, `hover/`, `arrow/`, `container/`, `defaults/`, `types/`, `view-host/`, `utils/`, `events/` | Ref holds ref + config + close-reason/close-policy (used by ref-impl and close directives).                      |
| **snackbar**     | `ref/`, `position/`, `options/`, `service/`, `directives/`, `host/`                                                                                                                             | Aligned with overlay: ref (interface + impl + tokens), position, options, service.                               |
| **tooltip**      | `directives/`, `services/`, `host/`                                                                                                                                                             | Small surface; current grouping is sufficient. Supports provider-configured global defaults and warmup behavior. |
| **popover**      | `directives/`, `host/`                                                                                                                                                                          | Same pattern as tooltip; close directive extends overlay’s `BaseCloseOverlayDirective`.                          |
| **interactions** | `focus/`                                                                                                                                                                                        | Single directive; no further grouping needed.                                                                    |

**Close directives**: Dialog, drawer, and popover extend overlay’s `BaseCloseOverlayDirective` and use `CloseReason`. Snackbar uses `closestCloseableRef` + `ref.close(value)` so `afterClosed()` can emit a value; that’s a different contract, so it does not extend the base. No duplicated logic.

**Trigger directives**: Tooltip and popover share overlay utilities to avoid duplication: `triggerIncludes` (trigger input check), `setupAnchoredOverlayOpenedState` (pane id/role, hover bridge, outside-click/focus-pane attachment, afterClosed cleanup), plus existing `createAnchoredOverlayConfig`, `createTriggerDelay`, `handleAnchoredHoverLeave`, `createOutsideClickListener`. Each directive keeps its own inputs and open/close logic; shared setup lives in `overlay/utils`.

**Ref implementations**: `OverlayRefImpl` is the full overlay lifecycle; `SnackbarRefImpl` wraps `OverlayRef` to add close-with-value semantics. No duplication.

## Roadmap (overlay-based)

Everything here builds on **@nexora-ui/overlay** (and usually dropdown + listbox for pickers).

- **Shipped:** Select, menu, combobox, mention, shared **dropdown** and **listbox** primitives, and the overlay stack (dialog, drawer, popover, tooltip, snackbar).
- **Next:** Autocomplete, command palette, mega / tiered / context menus, menu bar, date/time/color pickers, confirm popup, tree select, cascade select, and related primitives.

See **[HEADLESS-COMPONENTS-PLAN.md](HEADLESS-COMPONENTS-PLAN.md)** for tables and links to package READMEs.

## Running tests and lint

```bash
nx run-many -t test -p core,overlay,popover,tooltip,snackbar,interactions,dropdown,listbox,listbox-cdk,menu,select,combobox,mention
nx run-many -t lint -p core,overlay,popover,tooltip,snackbar,interactions,dropdown,listbox,listbox-cdk,menu,select,combobox,mention
```

E2E (demo app):

```bash
npx playwright install   # once: install browser binaries
nx run demo-e2e:e2e
```

If you only have Chromium installed, run with one project:  
`nx run demo-e2e:e2e --project=chromium`

## Documentation index

Use these docs for consistent context when implementing features or fixing bugs:

| Doc                                                                 | Purpose                                                                                                                                                                         |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [ARCHITECTURE.md](ARCHITECTURE.md)                                  | Library layout, dependencies, reuse, nesting, what not to do.                                                                                                                   |
| [DROPDOWNS.md](DROPDOWNS.md)                                        | Select vs combobox, `hasValue` / `selectedValues`, clear button and chips patterns.                                                                                             |
| [HEADLESS-COMPONENTS-PLAN.md](HEADLESS-COMPONENTS-PLAN.md)          | Roadmap: shipped vs planned overlay-based components; links to package READMEs.                                                                                                 |
| [CLEAN-CODE.md](CLEAN-CODE.md)                                      | Naming, types, options objects, tests, formatting.                                                                                                                              |
| [ANGULAR-GUIDELINES.md](ANGULAR-GUIDELINES.md)                      | Signals, effects, computed, zoneless, standalone, a11y.                                                                                                                         |
| [PROJECT-OVERVIEW.md](PROJECT-OVERVIEW.md)                          | What we build, tech stack, repo layout, run commands.                                                                                                                           |
| [PUBLIC-API-DESIGN.md](PUBLIC-API-DESIGN.md)                        | Simple public APIs: services (`open(content, options)`), directives, refs, stable vs internal.                                                                                  |
| [HEADLESS-BEHAVIOR.md](HEADLESS-BEHAVIOR.md)                        | Required behavior for dialog, drawer, popover, tooltip, snackbar, listbox/dropdown pointers, mention pointers.                                                                  |
| [mention/docs/MENTION.md](../libs/headless/mention/docs/MENTION.md) | Deep integration guide for **@nexora-ui/mention**: blur vs panel, `mousedown` on options, mobile, `getItems`, programmatic insert. Single source of truth for mention behavior. |
| [ACCESSIBILITY.md](ACCESSIBILITY.md)                                | Focus, ARIA, keyboard, reduced motion, RTL.                                                                                                                                     |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md)                            | Common issues: open/close, z-index, focus, nested overlays, snackbar value.                                                                                                     |
| [GLOSSARY.md](GLOSSARY.md)                                          | Terms: overlay ref, placement, anchor, stack, close policy, etc.                                                                                                                |
| [TESTING.md](TESTING.md)                                            | Unit and E2E approach, what to test, commands.                                                                                                                                  |
| [DEVELOPMENT.md](DEVELOPMENT.md)                                    | Setup, commands, where to find code, adding a new lib, doc list.                                                                                                                |
| [API-CONTRACTS.md](API-CONTRACTS.md)                                | Root vs published `/internal` subpaths, import rules, select/dropdown display helpers, mention `getItems` typing.                                                               |
| [MIGRATION.md](MIGRATION.md)                                        | Upgrade checklist and breaking-change notes.                                                                                                                                    |
| [PERFORMANCE.md](PERFORMANCE.md)                                    | Performance expectations and profiling tips.                                                                                                                                    |
| [SECURITY.md](SECURITY.md)                                          | Security model; mention chip attribute allowlist.                                                                                                                               |

# Migration

Upgrade notes and migration checklist for headless libs.

## Angular 22 (`@nexora-ui/*` peers `^22.0.0`)

- **Node**: `^22.22.3`, `^24.15.0`, or `>=26` (see repo `.nvmrc` and `package.json` `engines`).
- **Consumer apps** must upgrade to **Angular 22** before taking new `@nexora-ui/*` releases that declare Angular 22 peers. Angular 21 and 22 cannot share one install.
- **Nx workspace** (this repo): Nx **24.x**, TypeScript **6.0.x**, Vite **8.x**.
- After upgrading, run the [upgrade checklist](#upgrade-checklist) and `nx run demo:build` / `nx run demo:serve` for smoke checks.
- Demo shell components may still use `ChangeDetectionStrategy.Eager` from the automatic v22 migration; new code should use **OnPush** and signals.
- **npm**: Install versions published after the Angular 22 release train (version plan `.nx/version-plans/angular-22-major.md` → major bump on all `@nexora-ui/*` packages when merged to `main`). Until then, npm `latest` may still list Angular 21 peers.

## Upgrade checklist

- Read each affected library README for API changes.
- Run:
  - `nx run-many -t lint -p core,overlay,popover,tooltip,snackbar,interactions,dropdown,listbox,listbox-cdk,select,menu,combobox,mention`
  - `nx run-many -t test -p core,overlay,popover,tooltip,snackbar,interactions,dropdown,listbox,listbox-cdk,select,menu,combobox,mention`
- Verify app-level behavior for overlays, keyboard interaction, and focus restore.

## Public API policy

- Consume symbols from each package’s **documented entry points** (root `index` and any published subpaths such as `@nexora-ui/listbox-cdk/internal`).
- Avoid deep imports into `lib/**` paths.
- Treat explicitly documented internal helpers as unstable.

## `@nexora-ui/listbox`

- If you used **`#lb="nxrListbox"`** and called **`lb.optionId(item)`**, switch to **`lb.getOptionId(item)`** — it matches **`NxrListboxController`** and is the only public id accessor on the directive.

## `@nexora-ui/listbox-cdk`

- **Root** `@nexora-ui/listbox-cdk` exports: `ListboxCdkVirtualPanelComponent`, `BuiltinVirtualDropdownPanelComponent`, `BuiltinVirtualPanel{Option,Header,Footer}TemplateDirective`, and **`NXR_LISTBOX_CDK_OVERLAY_FLEX_COLUMN_CLASS`** (CSS hook for custom virtual panels in flex overlays).
- **Internal** (`@nexora-ui/listbox-cdk/internal`): portal factory, virtual selection signals, scroll/index math, **`afterVirtualPanelFirstPaint`**, and related types. Do not deep-import `src/lib/**`.

## `@nexora-ui/overlay/internal`

- **`afterClosedOnce`** and **`subscribeOnceAfterClosed`** are published from the **root** `@nexora-ui/overlay` entry (RxJS-only; good for apps and tree-shaking). **`afterClosedOnceUntilDestroyed`** is **`@nexora-ui/overlay/internal`** only (uses `takeUntilDestroyed` / `DestroyRef`).
- **`applyComponentInputs`**, **`subscribeComponentOutputs`**, **`unsubscribeComponentOutputSubscriptions`**, **`registerCloseableRef`**, **`unregisterCloseableRef`**, **`closestCloseableRef`**, **`handleCloseClick`**, type **`CloseableRef`**, and **`BaseCloseOverlayDirective`** are published from **`@nexora-ui/overlay/internal`**, not from the root `@nexora-ui/overlay` entry.
- Root still exports **`isComponent`**, **`getContainingOverlayRef`**, and the concrete close directives **`CloseDialogDirective`** / **`CloseDrawerDirective`**.
- Application code should keep using overlay/snackbar services; this entry is for headless package authors.

## `@nexora-ui/select`

- **`computeDisplayValue`** and **`resolveLabel`** are no longer re-exported from `@nexora-ui/select`. Import **`computeDisplayValue`** and **`resolveDisplayLabel`** from **`@nexora-ui/dropdown`** instead (`SelectAccessors` matches the dropdown label contract).

## Mention-specific migration notes

- **`MentionItemsResult<T>`** is now expressed as **`readonly T[]`**, **`Promise<readonly T[]>`**, or **`Observable<readonly T[]>`**. Implementations that return plain `T[]` or `Observable<T[]>` remain compatible; the contract clarifies that the controller does not mutate your arrays.
- Mention is contenteditable-first; validate any prior assumptions around input/textarea behavior.
- Ensure mention chip attribute usage follows the safe allowlist documented in `docs/SECURITY.md`.
- **`focusEditor()`** was removed; use **`focus()`** on `nxrMention`.
- **`nxrMentionCoalesceSessionCheckToFrame`** was removed; use **`nxrMentionCoalesceSessionCheckToMicrotask`** (default `true`). Behavior matches the former default coalescing path.

## Menu close reason semantics

- Menu item activation now closes with reason `selection` (instead of `programmatic`).
- Programmatic API close (`menu.close()`) still emits `programmatic`.
- If app logic branches on `(closed)` reason values for menu analytics/workflows, update mappings accordingly.

## `@nexora-ui/dropdown` — `DropdownRef` options builder rename (breaking)

- **`buildListboxControlDropdownRefOptions`** and **`ListboxControlDropdownRefOptionsInput`** were removed from the public API.
- Replace with **`buildHeadlessDropdownRefOptions`** and **`HeadlessDropdownRefOptionsInput`** (same parameters and behavior).

## Select, combobox, menu — `disable()` while open

- **`disable()`** now closes the overlay panel first (close reason **`programmatic`**) when it was open, then applies programmatic disable. If you relied on the panel staying open while programmatically disabled, update that flow; adjust any tests or analytics that assumed the previous behavior.

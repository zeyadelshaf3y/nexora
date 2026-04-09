# Required Behavior: Headless Components

Canonical **required behavior** for the overlay engine, **anchored** primitives (popover, tooltip, select, menu, combobox), **modal** surfaces (dialog, drawer), and **snackbar**. Use this when implementing or changing these components so behavior stays consistent and accessible.

---

## Overlay (shared engine)

- **Stack**: Overlays are registered in order; top of stack gets highest z-index and is the one affected by Escape and by “outside click” when the click is on a backdrop.
- **Escape**: Closes the **top** overlay only (configurable via close policy). No bubbling to parent overlays.
- **Outside click**: If the click is on a **backdrop**, the overlay that owns that backdrop and all its **nested** overlays close. If the click is on a **pane** (e.g. dialog content), only the **top** overlay (e.g. popover) closes; parent stays open.
- **Close policy**: Configurable per overlay (escape: top/none, outside: top/none, backdrop: self/none). Default: close on escape, outside, and backdrop.
- **Nested overlays**: When opening from inside another overlay (e.g. popover inside dialog), set `parentRef` so closing the parent closes children. Directives set `parentRef` automatically when the trigger is inside an overlay pane.
- **Focus**: Default strategy focuses first focusable in pane on open and **restores focus** to the previously focused element on close.
- **RTL**: Placement and positioning use `dir` from anchor or document (via `getResolvedDir` from `@nexora-ui/core`); start/end flip in RTL. No extra API or configuration required.
- **Reposition**: On resize/scroll, overlay repositions (when strategy supports it). Listeners are per overlay and cleaned up on close.

---

## Anchored overlays (popover, tooltip, select, menu)

Overlays that are **anchored to a trigger** (popover, tooltip, select/menu/combobox dropdown panels) use `AnchoredStrategy` and share the following required behavior. Use this when implementing or changing anchored overlays so behavior stays consistent.

### Placement and viewport

- **Placements**: 12 positions: `top-start`, `top`, `top-end`, `bottom-start`, `bottom`, `bottom-end`, `start-top`, `start`, `start-end`, `end-start`, `end`, `end-end`. **RTL**: `start`/`end` resolve from anchor or document `dir` (shared `getResolvedDir` from core); no extra config.
- **Preferred placement**: Config specifies a preferred placement (e.g. `bottom-start`). The strategy may try fallbacks so the panel fits in the viewport, unless “preferred only” or “stick” mode is active (see below).
- **Clamp to viewport**: When clamping is enabled, the panel’s position is clamped so it stays within the viewport (with optional padding). When clamping is disabled (e.g. noop or “follow trigger”), the panel can move off-screen with the trigger.
- **Max height**: When the panel is clamped and the anchor is in view, the pane’s max-height may be reduced so the panel fits in the viewport. When the trigger is fully outside the viewport and the panel is in “follow” mode, max-height is not shrunk (panel keeps a sensible height).

### Scroll strategy and reposition

- **NoopScrollStrategy** (panel sticks to trigger):
  - **On open**: The panel must still choose a **placement that fits in the viewport** (best-fit), so it does not open off-screen. Position is clamped on this first apply.
  - **On scroll / later repositions**: The panel uses **only the placement chosen on open** and does **not** clamp; it follows the trigger. No jump back to the preferred placement.
  - **On close**: Strategy state (e.g. “has applied once”) is reset so the next open again gets best-fit on first apply.
- **RepositionScrollStrategy** (panel repositions on scroll):
  - **maintainInViewport: true** (default): Normal reposition with fallback placements and clamp so the panel stays in view. Max-height may be reduced to fit.
  - **maintainInViewport: false**: While the trigger is **in** (or partially in) the viewport, behave like default (reposition and clamp). When the trigger is **fully outside** the viewport:
    - **Placement**: Use the **current** placement only (do not revert to preferred), so the panel does not jump (e.g. from `top-start` back to `bottom-start`).
    - **Position**: Do **not** clamp; panel follows the trigger.
    - **Max-height**: Do **not** shrink; keep a sensible cap so the panel does not disappear or stay tiny.
- **CloseOnScrollStrategy**: Overlay closes when the user scrolls (when configured).
- **BlockScrollStrategy**: Used for modal overlays (e.g. dialog); body scroll blocked. Not used for anchored panels.

### Default scroll strategy and maintainInViewport

| Component   | Default scroll strategy                  | Default maintainInViewport | Notes                                                                                                                                                                                                                                                               |
| ----------- | ---------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Select**  | `noop`                                   | —                          | Panel sticks to trigger (best-fit on open). When set to `reposition`, `maintainInViewport` defaults to `true` in config. Single selection closes with reason `selection`; API `close()` defaults to `programmatic`.                                                 |
| **Menu**    | `noop`                                   | —                          | Same as select. Use `reposition` when the panel should stay in view on scroll; set `maintainInViewport="false"` to have it follow the trigger when fully off-screen. Menu item activation closes with reason `selection`; API `close()` defaults to `programmatic`. |
| **Tooltip** | `noop`                                   | `true`                     | Sticks to trigger by default. Only applies when `scrollStrategy="reposition"`; then panel repositions and stays in view (maintainInViewport true).                                                                                                                  |
| **Popover** | `noop`                                   | `true`                     | Same as tooltip. `nxrPopoverCloseOnScroll` (default false) can override to close on scroll instead.                                                                                                                                                                 |
| **Dialog**  | **Block** (when `hasBackdrop !== false`) | N/A                        | Body scroll blocked; not anchored. Optional `scrollStrategy` for noop (e.g. non-blocking dialog).                                                                                                                                                                   |
| **Drawer**  | **Block** (when `hasBackdrop !== false`) | N/A                        | Same as dialog.                                                                                                                                                                                                                                                     |

**Rationale:** Anchored panels (select, menu, tooltip, popover) default to **noop** so the panel sticks to the trigger and doesn’t jump when the user scrolls inside a scrollable container; on open we still pick a placement that fits so it doesn’t open off-screen. Dialogs and drawers default to **block** so the page doesn’t scroll behind the modal. When the consumer wants the panel to stay in viewport on scroll, they set `scrollStrategy="reposition"`; then `maintainInViewport` (default true) keeps the panel clamped, or `false` lets it follow the trigger when the trigger is fully off-screen.

### Config and API

- **Config builders**: `createAnchoredOverlayConfig` (popover/tooltip), `createDropdownAnchoredConfig` (select/combobox), `createMenuAnchoredConfig` (menu). They set scroll strategy, `clampToViewport`, `preferredPlacementOnly`, and (for reposition) `maintainInViewport` and `stickWhenAnchorFullyOutOfViewport` as required. Directives (popover, tooltip, menu, select) pass these through; consumers set e.g. `scrollStrategy="noop"` or `[maintainInViewport]="false"`.
- **Positioning helpers** (e.g. placement-utils, “anchor fully in/out of viewport”) are **internal**; only strategies and config builders are part of the public API.

### Arrow and accessibility

- **Arrow**: When the strategy returns `arrowOffset` and `arrowSide`, the overlay sets CSS variables on the pane. Arrow is hidden when the anchor is completely out of viewport.
- **ARIA**: Per component (popover: `aria-expanded`, `aria-controls`; tooltip: `aria-describedby`; menu/select: `role="menu"` / `role="listbox"`, etc.). Focus restore on close.

When adding or changing anchored overlay behavior, align with this section and with the overlay README (scroll strategies and anchored positioning).

---

## Listbox and dropdown (shared primitives)

Anchored **select**, **menu**, and **combobox** use **`DropdownRef`** (`@nexora-ui/dropdown`) for overlay open/close, trigger keydown routing, focus restore, and resize observation. **`open()`** may await an in-flight close; rapid reopen after close is **serialized**—do not assume overlapping opens.

**Listbox** (`@nexora-ui/listbox`) provides keyboard navigation, typeahead, selection, and optional **virtual scroll** integration. **Duplicate option values** in the registry: **the first matching registration** is treated as selected for identity and `isSelected` checks; use **`nxrListboxCompareWith`** / accessors when values are not unique references. For virtual windows, **`keepActiveWhenMissingFromRegistry`** avoids resetting the active item when the active value is outside the current window—misconfiguration can cause a “lost” highlight.

Canonical picking patterns (select vs combobox, chips, clear): [DROPDOWNS.md](DROPDOWNS.md). Package detail: [listbox README](../libs/headless/listbox/README.md), [dropdown README](../libs/headless/dropdown/README.md).

---

## Mention

**`nxrMention`** runs on a **contenteditable** surface with trigger-based sessions. Deep behavior (blur deferral so panel clicks run before close, **`mousedown`** on suggestion rows, mobile touch, **`getItems`** returning `readonly T[]` sync/async, programmatic insert) is documented in **[MENTION.md](../libs/headless/mention/docs/MENTION.md)**—prefer linking there instead of duplicating long prose in root docs.

Chip attributes merged onto mention DOM are **allowlisted** for safety; see [SECURITY.md](SECURITY.md) and the [mention README](../libs/headless/mention/README.md).

---

## Dialog

- **Opening**: `DialogService.open(componentOrTemplate, options)`. Returns `Promise<OverlayRef | null>`. `null` if opening was cancelled (e.g. `beforeOpen` returned false).
- **Positions**: 9 placements: top-start, top, top-end, start, center, end, bottom-start, bottom, bottom-end. Default: `'center'`.
- **Backdrop**: Default on. Blocks interaction with rest of page. Backdrop click closes (unless close policy disables it).
- **Scroll**: Body scroll blocked by default while open (block strategy). Optional noop for “non-blocking” dialogs.
- **Focus**: First focusable element focused on open; focus restored on close. Focus trap recommended for modal content (use interactions lib).
- **ARIA**: Pane has `role="dialog"` and `aria-modal="true"`. Consumer should set `aria-label` or `aria-labelledby` (e.g. on pane or heading).
- **Content**: Template or component. Component can receive `inputs`/`outputs` via options. No built-in header/footer/actions; consumer provides full content and styling.

---

## Drawer

- **Opening**: `DrawerService.open(componentOrTemplate, options)`. Same contract as dialog: `Promise<OverlayRef | null>`.
- **Positions**: 4 placements: top, bottom, start, end. **RTL-aware**: start/end follow document/anchor `dir`. Default: `'end'`.
- **Sizing**: start/end: height 100vh by default, width from options. top/bottom: width 100vw by default, height from options.
- **Backdrop, scroll, focus, ARIA**: Same as dialog (backdrop default on, block scroll, focus restore, `role="dialog"` / `aria-modal="true"`). Consumer provides `aria-label` or `aria-labelledby`.
- **Content**: Template or component; consumer owns structure and styles.

---

## Popover

- **Trigger**: Directive on host element. Content is a `TemplateRef` (panel content). Opens anchored to the host.
- **Triggers**: Click (default), focus, or hover. Can be combined (e.g. `['hover', 'focus']`). For click: open on click, close on outside click or Escape. For focus: open on focus, close when focus leaves trigger and panel. For hover: open on mouse enter; close on leave (with optional “allow content hover” and gap bridge).
- **Placement**: 12 positions (top/start/end/bottom × start/center/end). RTL-aware. Optional flip to keep in viewport unless `preferredPlacementOnly` is set.
- **Delays**: Open delay and close delay (hover/focus) configurable. Close delay can differ for hover vs focus.
- **Allow content hover**: When true, hovering the panel (and optional gap) keeps it open; when false, leaving the trigger closes it.
- **Outside click / Escape**: Close popover when user clicks outside or presses Escape (when trigger is click or when open via click). Nested: only top overlay closes unless click is on parent backdrop.
- **ARIA**: Trigger gets `aria-expanded`, `aria-haspopup="true"`, `aria-controls` (pane id when open). Pane has stable id and `role="dialog"` (override via options if needed for listbox/combobox).
- **Touch**: Hover is not meaningful on touch. Prefer click or focus for touch-friendly UX.
- **State**: Directive exposes `isOpen` and `paneId` (signals) for template binding.

---

## Tooltip

- **Trigger**: Directive on host. Content is **text** (or simple content). Shown on hover or focus (configurable).
- **Placement**: Same 12 placements as popover. RTL-aware. Default e.g. `'top'`.
- **Delays**: Open delay and close delay are configurable (`openDelay`, `closeDelay`, `hoverCloseDelay`, `focusCloseDelay`).
- **Direct handoff**: Moving directly from one tooltip trigger to another can open the next tooltip instantly (skip open delay and enter animation) when handoff is enabled.
- **Leave without handoff**: Leaving a tooltip without entering another keeps normal close delay and close animation.
- **Warmup window**: Optional post-close warmup window can allow instant open for the next tooltip if it opens within the configured window.
- **Hover**: Open on mouse enter; close on mouse leave. Optional “allow content hover” so hovering the tooltip content keeps it open (e.g. for links inside).
- **Focus**: Open on focus; close when focus leaves trigger (and optionally tooltip content). Ensures keyboard users get the same content.
- **ARIA**: Trigger gets `aria-describedby` pointing to tooltip pane id when open. Pane has `role="tooltip"` and stable id. Content should be short and descriptive.
- **No focus trap**: Tooltips are supplementary; focus stays on trigger. No modal behavior.
- **Viewport**: Optional clamp to viewport so tooltip doesn’t go off-screen.
- **Arrow**: Optional arrow pointing at trigger; same mechanism as overlay arrow (CSS variables).
- **Global defaults**: Tooltip inputs can be configured app-wide with provider config (while per-instance inputs still override).

---

## Snackbar

- **Opening**: `SnackbarService.open(componentOrTemplate, options)`. Returns `SnackbarRef`. No `null` for cancel by default; can be extended if needed.
- **Position**: Viewport edges: top-start, top, top-end, bottom-start, bottom, bottom-end. Default: `'bottom-end'`. RTL-aware for start/end.
- **Stacking**: Multiple snackbars at same placement stack (e.g. new one pushes previous). Reflow when one closes.
- **Replace-by-group**: Optional `groupId`. Only one snackbar per group at a time; opening another with same `groupId` closes the previous.
- **Auto-close**: Optional `duration` in ms; `0` means no auto-close.
- **Close with value**: Buttons (or other actions) can close with a value via `nxrSnackbarClose` (e.g. “Dismiss” vs “Undo”). `ref.close(value)` / `ref.dismiss(value)`; `afterClosed()` emits that value.
- **Focus**: No focus trap; snackbars are non-modal. Focus typically stays in the page; optional focus move is app-specific.
- **ARIA**: Consumer can add `role="status"` or `role="alert"` and live region attributes as needed. No default role from the engine beyond pane structure.

---

## Summary table

| Component              | Open API                        | Close (user)                            | Focus                   | ARIA (pane)                           | Special                                                                                           |
| ---------------------- | ------------------------------- | --------------------------------------- | ----------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Dialog**             | `DialogService.open(...)`       | Escape, backdrop, outside               | Restore + optional trap | role=dialog, aria-modal               | 9 positions, block scroll                                                                         |
| **Drawer**             | `DrawerService.open(...)`       | Same as dialog                          | Same                    | Same                                  | 4 positions, RTL start/end                                                                        |
| **Popover**            | `[nxrPopover]="tpl"`            | Outside, Escape, (blur for focus)       | Restore                 | role=dialog, aria-controls on trigger | Click/focus/hover, 12 placements                                                                  |
| **Tooltip**            | `nxrTooltip="text"`             | Leave / blur                            | No trap                 | role=tooltip, aria-describedby        | Hover/focus, delays, optional arrow                                                               |
| **Snackbar**           | `SnackbarService.open(...)`     | Button/duration/group replace           | No trap                 | Consumer                              | Stack, groupId, close with value                                                                  |
| **Listbox / dropdown** | Host components + `DropdownRef` | Escape/outside (via overlay), selection | Restore to trigger      | listbox/menu roles                    | See [Listbox and dropdown](#listbox-and-dropdown-shared-primitives); [DROPDOWNS.md](DROPDOWNS.md) |
| **Mention**            | `nxrMention` + panel template   | Blur, outside, programmatic             | Editor focus            | Panel + editor                        | See [Mention](#mention); [MENTION.md](../libs/headless/mention/docs/MENTION.md)                   |

When adding or changing behavior, align with this document and with the package READMEs (`overlay`, `popover`, `tooltip`, `snackbar`, `dropdown`, `listbox`, `select`, `menu`, `combobox`, `mention`) and **[MENTION.md](../libs/headless/mention/docs/MENTION.md)** as relevant.

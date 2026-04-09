# @nexora-ui/overlay

Overlay system: dialogs (9 positions), drawers (4 positions), scroll/focus strategies. One API for template or component content.

**Public API:** Exports from `src/index.ts` are the supported surface ([PUBLIC-API-DESIGN.md](../../../docs/PUBLIC-API-DESIGN.md)).

**Internal entry:** `@nexora-ui/overlay/internal` exposes component ref I/O helpers, the pane close-registry (`registerCloseableRef`, …), and `BaseCloseOverlayDirective` for sibling headless packages (e.g. popover’s close button). See [internal/README.md](./internal/README.md).

## Tree-shaking and bundle size

This package includes both the **overlay engine** (OverlayService, ref, positioning, portal, close behavior) and **dialog/drawer** conveniences (DialogService, DrawerService, close directives). If your app only uses **tooltip** or **popover**, import only what you need (e.g. use `@nexora-ui/tooltip` or `@nexora-ui/popover`); they do not use DialogService or DrawerService, so the bundler can tree-shake those out when they are unused. The package is built with `sideEffects: false`. To verify tree-shaking, build an app that uses only tooltip (or tooltip + popover), run a production build, and confirm that the bundle does not contain dialog/drawer symbols (e.g. search for `DialogService`).

## Dashboard / content-scoped overlays

When the overlay should open **inside a content area** (e.g. main content between header and sidebar) instead of full-viewport:

1. **`host`** — Mount the pane and backdrop on the content element instead of the global container. Positioning **viewport** becomes that element’s rect, so the dialog is centered and clamped to the content area. Z-index is relative to that host.
2. **`outsideClickBoundary`** — Element that counts as “inside” for outside-click: clicks inside it do **not** close the overlay. Set this to the **dashboard root** (the element that contains header + sidebar + content) so that clicks on the header or sidebar do not close the dialog.

**Example:** Dialog opens in the main content region; clicks on header/sidebar do not close it; clicking the dimmed content area (backdrop) or Escape still closes it.

```ts
// Template: <div #dashboardRoot> <header>...</header> <aside>...</aside> <main #contentArea>...</main> </div>
const ref = await this.dialogService.open(MyDialogComponent, {
  host: this.contentArea,
  outsideClickBoundary: this.dashboardRoot,
  placement: 'center',
});
```

`DialogService.open()` and `DrawerService.open()` accept `host` and `outsideClickBoundary` in options; they are passed through to `OverlayConfig`.

## Z-index and stacking above app chrome

Overlays are stacked in registration order; the topmost overlay gets the highest z-index. The **base z-index** defaults to `1000`. When your app chrome (header, sidebar, etc.) uses fixed z-index values, configure a higher base so dialogs, drawers, popovers, tooltips, and snackbars render above them:

```ts
// e.g. app.config.ts or main module
import { OVERLAY_BASE_Z_INDEX } from '@nexora-ui/overlay';

providers: [
  // Header 1000, sidebar 10001 → overlays above both
  { provide: OVERLAY_BASE_Z_INDEX, useValue: 10002 },
];
```

Each overlay then gets `baseZIndex + stackOrder` (first overlay base, next base+1, etc.). To force a **single overlay** above everything, pass **`zIndex`** in that overlay’s config (e.g. `dialog.open(..., { zIndex: 11000 })`); it overrides the stack-assigned value.

Content-scoped overlays (with **`host`**) use z-index relative to the host (0/1), so they inherit the host’s stacking (e.g. sidebar at 10001) and do not use the global base.

## Stack and closing behavior

Overlays are kept in a **stack** (registration order). Global listeners handle **Escape** (closes top overlay only) and **pointerdown** (backdrop / outside click).

- **Outside click**: Handled **top-first**. If the click is on a **parent’s backdrop** (e.g. dialog’s dark area), the parent and all its **nested** overlays (popover, tooltip) close together. If the click is on a parent’s **pane** (e.g. dialog content), only the top overlay (e.g. popover) closes and the parent stays open.
- **Nested overlays**: When opening an overlay from inside another (e.g. popover inside dialog), set **`parentRef`** so close behavior is scoped. Use **`getContainingOverlayRef(element)`** to get the overlay ref for the nearest pane containing `element` and pass it as `parentRef`. Dialog and drawer `open()` accept `parentRef` in options. Popover and tooltip directives set `parentRef` automatically when the trigger is inside an overlay pane.
- **Close policy** (`closePolicy` / `ClosePolicy`): `escape` (`'top'` | `'none'`), `outside` (`'top'` | `'none'`), `backdrop` (`'self'` | `'none'`). Default is close on escape, outside, and backdrop.

## Accessibility

- **Focus**: The default focus strategy focuses the first focusable element in the pane on open and **restores focus** to the previously focused element on close.
- **ARIA**: For overlays with a backdrop, the pane gets `role="dialog"` and `aria-modal="true"` by default. Override via **`ariaRole`** and **`ariaModal`** in config (e.g. `ariaRole: 'alertdialog'`, `ariaModal: false` for non-modal popovers). For dialogs, provide **`aria-label`** or **`aria-labelledby`** (e.g. on the pane or a heading) so screen readers announce the overlay.
- **Reduced motion**: Respect user preference via `prefers-reduced-motion` in your CSS (e.g. shorter or no transitions when `(prefers-reduced-motion: reduce)`).

## Opening an overlay (template or component)

Use `OverlayService.open(content, options)`. You do **not** need to pass `viewContainerRef`: the service uses an internal host by default. Pass `viewContainerRef` or call `setDefaultViewContainerRef()` (e.g. via the optional `nxrOverlayViewContainer` directive) only when you need content created in a specific injector hierarchy.

**Dialog** (default, 9 positions: `top-start`, `top`, `top-end`, `start`, `center`, `end`, `bottom-start`, `bottom`, `bottom-end`):

```ts
ref = await this.overlay.open(MyDialogComponent, {
  type: 'dialog',
  placement: 'center',
  maxWidth: 'min(480px, 90vw)',
});
```

**Drawer** (4 positions: `top`, `bottom`, `start`, `end`; **RTL-aware** for `start`/`end` — placement follows document/anchor `dir`):

```ts
ref = await this.overlay.open(MyDrawerComponent, {
  type: 'drawer',
  placement: 'end',
  drawerSize: '320px',
});
```

**Template:**

Import **`subscribeOnceAfterClosed`** from **`@nexora-ui/overlay`** for a one-shot **`afterClosed`** subscription (cancellable **`Subscription`**).

```ts
ref = await this.overlay.open(this.myTemplate, {
  placement: 'top-end',
  maxWidth: 'min(700px, 90vw)',
});
if (ref) {
  subscribeOnceAfterClosed(ref, () => {
    if (this.ref === ref) this.ref = null;
  });
}
```

**Options:** `type` (`'dialog'` | `'drawer'`), `placement` (dialog or drawer positions), `drawerSize` (for drawer), `maxWidth`, `maxHeight`, `beforeOpen`, `beforeClose`. Return `false` from `beforeOpen` to cancel opening (the promise resolves with `null`); return `false` from `beforeClose` to prevent closing. For components: `injector`, `inputs`, `outputs`.

## Anchored overlays and arrow (e.g. popovers)

For overlays anchored to an element (e.g. popover next to a trigger), use **`AnchoredStrategy`** with 12 placements: `top-start`, `top`, `top-end`, `bottom-start`, `bottom`, `bottom-end`, `start-top`, `start`, `start-end`, `end-start`, `end`, `end-end`. **RTL**: `start`/`end` and placement logic use the anchor’s (or nearest `[dir]` / document) direction via **`getResolvedDir`** from `@nexora-ui/core`; no extra configuration required.

**Config builders:** Use **`createAnchoredOverlayConfig`** for popover/tooltip. For dropdown-style panels (select, combobox), use **`createDropdownAnchoredConfig`** (default placement bottom, vertical fallbacks). For menu-style panels, use **`createMenuAnchoredConfig`** (default placement bottom-start, full 12-position fallbacks). The dropdown and menu libraries use these internally via `DropdownRef` and its `configPreset` option. Both preset builders share the parameter shape **`BaseAnchoredPresetParams`**; the menu preset adds optional **`arrowSize`**.

**Lifecycle hooks:** Use **`composeBeforeOpenCallbacks`** and **`composeBeforeCloseCallbacks`** when two `beforeOpen` / `beforeClose` handlers must run in order (e.g. directive defaults, then trigger-level overrides). The first runs first; if it returns `false`, the second is not called.

## Scroll strategies and anchored positioning

Scroll strategy and **`maintainInViewport`** (for reposition) control how the panel behaves when the page or a scroll container moves.

| Strategy                     | Behavior                                                                                                                                                                                                                                                                                                                          |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **NoopScrollStrategy**       | Panel **sticks to the trigger** (no reposition on scroll). On **open**, the panel still picks a placement that fits in the viewport so it doesn’t open off-screen; on **scroll**, it keeps that placement and follows the trigger without clamping.                                                                               |
| **RepositionScrollStrategy** | Panel repositions on scroll. With **`maintainInViewport: true`** (default): normal flip/fallback and clamp so the panel stays in view. With **`maintainInViewport: false`**: same while the trigger is in view; when the trigger is **fully outside** the viewport, the panel follows it (no clamp, current placement preserved). |
| **BlockScrollStrategy**      | Body scroll is blocked while the overlay is open (e.g. dialog).                                                                                                                                                                                                                                                                   |
| **CloseOnScrollStrategy**    | Overlay closes when the user scrolls.                                                                                                                                                                                                                                                                                             |

You typically choose scroll strategy and `maintainInViewport` via the directive or config (e.g. `scrollStrategy="noop"`, `[maintainInViewport]="false"`). Positioning helpers (e.g. placement-utils) are **internal** and not part of the public API; use the config builders and strategies above.

**Defaults per component:** Select and menu default to **noop** (panel sticks to trigger); tooltip and popover default to **noop** with **maintainInViewport true** when using reposition. Dialog and drawer default to **block** (body scroll blocked). See **[HEADLESS-BEHAVIOR.md](../../../docs/HEADLESS-BEHAVIOR.md#default-scroll-strategy-and-maintaininviewport)** for the full table and rationale.

**Required behavior:** The canonical list of required behavior for anchored overlays (placement, noop best-fit on open, reposition + maintainInViewport, stick when anchor fully out, max-height, config) is in **[HEADLESS-BEHAVIOR.md](../../../docs/HEADLESS-BEHAVIOR.md#anchored-overlays-popover-tooltip-select-menu)**. When implementing or changing anchored overlay behavior, align with that section.

**Arrow:** When the position strategy returns `arrowOffset` and `arrowSide`, the overlay sets CSS variables on the pane so you can show an arrow pointing at the anchor.

- **`OverlayArrowDirective`** — Put `[nxrOverlayArrow]` on one element inside your overlay content. The directive applies `--nxr-arrow-x`, `--nxr-arrow-y`, `--nxr-arrow-rotate`, and `--nxr-arrow-visible` so the arrow follows the anchor. Style the host as your arrow (e.g. triangle via borders). The arrow is hidden when the anchor is completely out of viewport.
- **`OverlayConfig.arrowSize`** — Optional `{ width: number; height: number }` (default 12×6). Used to offset the arrow so it sits outside the pane edge. Set when your arrow has different dimensions.

**CSS variables** (set on the pane when arrow is used): `--nxr-arrow-x`, `--nxr-arrow-y` (px), `--nxr-arrow-rotate` (deg), `--nxr-arrow-side` (`top` | `bottom` | `start` | `end`), `--nxr-arrow-visible` (`visible` | `hidden`).

## Animations

The overlay pane has `data-placement` set (e.g. `dialog-center`, `drawer-end`) and `data-state="open"`. Use these in your styled components to drive open/close animations (e.g. `[data-placement="drawer-end"] { transform: translateX(100%); }` and transition to `translateX(0)` when open).

## API surface

| Kind         | Symbols                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Notes                                                                                                                 |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Stable**   | `OverlayService`, `OverlayRef`, `OverlayConfig`, `DialogService`, `DrawerService`, `ClosePolicy`, position/scroll/focus strategies, `getContainingOverlayRef`, `createAnchoredOverlayConfig`, `createDropdownAnchoredConfig`, `createMenuAnchoredConfig`, `BaseAnchoredPresetParams`, `composeBeforeOpenCallbacks`, `composeBeforeCloseCallbacks`, `TemplatePortal`, `ComponentPortal`, close reasons, directives (`nxrOverlay`, `nxrDialogClose`, etc.) | Safe for app and other Nexora libs; we avoid breaking these in minor/patch releases.                                  |
| **Internal** | `handleCloseClick`, `closestCloseableRef`, `registerCloseableRef`, `unregisterCloseableRef`                                                                                                                                                                                                                                                                                                                                                              | Used by close directives and overlay impl. Prefer `getContainingOverlayRef` when you need the containing overlay ref. |
| **Internal** | `applyComponentInputs`, `subscribeComponentOutputs`, `isComponent`                                                                                                                                                                                                                                                                                                                                                                                       | Used by overlay and snackbar services for component content; may change.                                              |
| **Internal** | Strategy/ref implementation classes, positioning helpers (e.g. placement-utils)                                                                                                                                                                                                                                                                                                                                                                          | Not exported; only strategies and config builders are part of the public API so the package stays tree-shakeable.     |

## Conventions

- **Options over many params**: Public and internal APIs use option objects (e.g. `OverlayConfig`, `ApplyPositionResultParams`) instead of long parameter lists.
- **Constants**: Defaults (e.g. close animation duration, arrow size) live in the modules that use them; no magic numbers in the public API surface.

## Performance and lifecycle

- **Listeners**: Document-level Escape and pointerdown are attached once when the overlay stack is first used. Reposition listeners (resize, scroll) are registered per overlay and cleared on close.
- **Cleanup**: Each overlay tears down its reposition throttler and listeners in `close()` before detach; no listener leaks when overlays are closed or disposed.
- **Re-entrancy**: Open/close guards (e.g. `if (this.closed) return false`) prevent double-close or attach-after-close. Focus is restored on close so rapid open/close does not leave focus in a detached pane.

## Internal structure

Layout of `src/lib/` for contributors:

| Folder         | Role                                                                                                                                                                                                                                                                                                                                                              |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ref/**       | Overlay reference and config: `OverlayRef` / `OverlayRefImpl`, `OverlayConfig`, close policy/reason, pane styling and position applier, reposition listeners. Config helpers: `createAnchoredOverlayConfig`, `createDropdownAnchoredConfig`, `createMenuAnchoredConfig`, `BaseAnchoredPresetParams`, `composeBeforeOpenCallbacks`, `composeBeforeCloseCallbacks`. |
| **position/**  | Positioning only: `PositionStrategy`, context → result; strategies (anchored, dialog, drawer, global center), placement utils. No DOM.                                                                                                                                                                                                                            |
| **events/**    | Document-level behavior: Escape and outside-click via overlay stack (one service).                                                                                                                                                                                                                                                                                |
| **close/**     | Closeable ref registry and close directives (base, dialog, drawer).                                                                                                                                                                                                                                                                                               |
| **portal/**    | Content attachment: `Portal`, `TemplatePortal`, `ComponentPortal`.                                                                                                                                                                                                                                                                                                |
| **scroll/**    | Scroll strategies (noop, block, close-on-scroll).                                                                                                                                                                                                                                                                                                                 |
| **focus/**     | Focus strategies (default, noop).                                                                                                                                                                                                                                                                                                                                 |
| **arrow/**     | Arrow CSS application (used by ref position applier).                                                                                                                                                                                                                                                                                                             |
| **container/** | Global overlay container element.                                                                                                                                                                                                                                                                                                                                 |
| **stack/**     | Overlay stack (order, z-index assignment).                                                                                                                                                                                                                                                                                                                        |
| **hover/**     | Hover bridge for tooltip/popover (keep open over gap).                                                                                                                                                                                                                                                                                                            |
| **view-host/** | Internal component providing default `ViewContainerRef`.                                                                                                                                                                                                                                                                                                          |
| **utils/**     | Trigger delay, outside-click helper, anchored overlay opened state, component bindings.                                                                                                                                                                                                                                                                           |

Root `lib/` folders: **defaults/** (constants, overlay-attributes, overlay-z-index), **types/** (open-types), **services/** (overlay.service, dialog.service, drawer.service), **directives/** (overlay-trigger, overlay-view-container, overlay-arrow). Remaining root: ref/, position/, events/, close/, portal/, scroll/, focus/, arrow/, container/, stack/, hover/, view-host/, utils/.

## Running unit tests

Run `nx test overlay` to execute the unit tests.

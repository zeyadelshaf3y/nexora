# Troubleshooting

Common issues when using or developing Nexora headless components, and what to check. Use this when debugging or when an AI agent needs to fix a reported bug.

## Overlay doesn’t open

- **ViewContainerRef**: Overlay needs a place to attach content. Ensure the app has `nxrOverlayViewContainer` on a parent (e.g. app root), or pass `viewContainerRef` in options. Without it, the overlay service may use an internal default; if that’s not set, opening can fail.
- **beforeOpen**: If `beforeOpen` returns `false` (or a promise resolving to false), open is cancelled. Check that the callback doesn’t block open unintentionally.
- **Async open**: `dialog.open()` / `drawer.open()` return `Promise<OverlayRef | null>`. `null` means open was cancelled or failed. Await the promise and check for `null` before using the ref.

## Overlay doesn’t close (Escape / outside click)

- **Close policy**: Overlay has a close policy (escape, outside, backdrop). If `closePolicy` was overridden with `escape: 'none'` or `outside: 'none'`, those actions won’t close. Check the config passed to `OverlayService.open()` or the directive’s effective config.
- **Nested overlays**: Only the **top** overlay closes on Escape or outside click. If the user expects a parent to close, the click might be on the parent’s pane (which closes only the top). Clicks on a **backdrop** close that overlay and its nested overlays.
- **parentRef**: When opening an overlay from inside another (e.g. popover inside dialog), the inner one must have `parentRef` set so the stack and close behavior are correct. Directives set this automatically when the trigger is inside an overlay pane; when calling the service manually, pass `parentRef: getContainingOverlayRef(element)`.

## Z-index: overlay behind header/sidebar

- **Base z-index**: Overlays use a base z-index (default 1000) plus stack order. If app chrome (header, sidebar) has a higher z-index, overlays render behind. Set a higher base via the token: `{ provide: OVERLAY_BASE_Z_INDEX, useValue: 10002 }` in app config (or root providers).
- **Single overlay above everything**: Pass `zIndex` in that overlay’s options to override the stack-assigned value for that instance only.
- **Content-scoped overlays**: With `host`, the pane is rendered inside the host element; z-index is relative to the host. Ensure the host (e.g. dashboard content) has a stacking context and z-index that sits above surrounding layout if needed.

## Focus not restored after close

- **Focus strategy**: Overlay uses a focus strategy (default: focus first focusable on open, restore previous on close). If a custom `focusStrategy` was passed (e.g. `NoopFocusStrategy`), focus is not moved or restored. Use the default or a strategy that restores focus.
- **Trigger destroyed**: If the trigger element is removed from the DOM before the overlay closes, restore may target nothing. Prefer closing the overlay before destroying the trigger, or handle focus in app code.

## Popover / tooltip closes immediately or doesn’t stay open

- **Hover**: If trigger is “hover,” moving the pointer to the panel might close the popover if there’s a gap (pointer “leaves” trigger before entering panel). Use **allow content hover** and ensure the overlay’s hover bridge (gap) is in place so moving to the panel keeps it open.
- **Focus**: With focus trigger, closing on blur is correct. If the panel contains focusable elements, ensure focus can move into the panel (and that “outside” isn’t considered the panel). The overlay utils attach focus listeners so that focus inside the pane doesn’t close the overlay.
- **Touch**: Hover doesn’t apply on touch devices. Use click or focus trigger for touch-friendly UX.

## Snackbar: close with value not emitted

- **Close method**: Use the ref’s `close(value)` or `dismiss(value)` so that `afterClosed()` emits that value. Buttons in the template should use `nxrSnackbarClose` with optional value (e.g. `[nxrSnackbarClose]="'undo'"`). If the snackbar is closed by duration or another path without a value, `afterClosed()` may emit `undefined`.

## Snackbar: `SnackbarService.open` throws or won’t attach

- **ViewContainerRef**: `open()` needs a `ViewContainerRef` to create the portal. Pass `viewContainerRef` in options, ensure the injector provides one, or rely on the overlay container path documented in the snackbar README. Without a resolvable VCR, the service throws (see JSDoc on `SnackbarService.open`).
- **groupId / replace-in-group**: Opening a snackbar with the same **`groupId`** as an existing one **closes the previous** instance in that group. If messages “disappear,” check whether `groupId` was reused unintentionally.

## Listbox: wrong option appears selected or duplicate values behave oddly

- **First match wins**: When multiple registered options share the same value identity, **the first registered row** is treated as selected for `isSelected` and related logic. Use **`nxrListboxCompareWith`** and/or **`nxrListboxAccessors`** so value identity matches your data model, or ensure unique values per row.
- **Virtual scroll**: If the active highlight “disappears” while scrolling, the active item may be outside the virtual window. Configure **`keepActiveWhenMissingFromRegistry`** when using virtual lists so the controller does not reset active incorrectly. See [listbox README](../libs/headless/listbox/README.md).

## Mention: panel closes before selection, or tap doesn’t select

- **Blur vs panel**: The editor blurs before `click` fires on a suggestion. Use **`mousedown`** (or `pointerdown`) on options so `select()` runs before blur closes the panel; see [MENTION.md](../libs/headless/mention/docs/MENTION.md).
- **Mobile / touch**: The mention package uses capture **`touchstart`** on the panel host so taps can reach selection; ensure styles allow taps (e.g. `touch-action: manipulation` on the editor surface as in the mention README).

## Mention: IME composition or paste behaves unexpectedly

- **IME**: Complex scripts may defer `input` events; if the session doesn’t open/close as expected, verify trigger detection after composition ends. Details are implementation-specific—see [MENTION.md](../libs/headless/mention/docs/MENTION.md) and the mention README.
- **Paste**: Use documented paste hooks / plain-text insertion paths; avoid piping unsanitized HTML into contenteditable. Chip attributes are allowlisted—see [SECURITY.md](SECURITY.md).

## Dropdown: rapid open after close seems ignored

- **`DropdownRef.open()`** waits for an in-flight **close** to finish before opening again. If you call `open()` immediately after `close()`, await or chain so the previous close completes; do not assume overlapping opens.

## Dialog / drawer: content not scrollable or wrong size

- **Sizing**: The overlay engine applies max dimensions and viewport clamping; it doesn’t set overflow or inner layout. Use `panelClass` / `panelStyle` (e.g. `overflow: auto`, `max-height: 80vh`) so the pane scrolls. For fixed header/footer, set `overflow: hidden` on the pane and scroll only on the content area (consumer’s template).

## Tests: overlay or ref is null

- **Async open**: In tests, ensure you await `dialog.open(...)` or `drawer.open(...)` before asserting on the ref. The service returns a Promise.
- **ViewContainerRef in tests**: Test host must have a valid view container. Use `TestBed.createComponent()` so the component’s view is created; or provide a `ViewContainerRef` in the test injector if the service requires it.

## Summary table

| Symptom                                  | Likely cause                          | Check                                                         |
| ---------------------------------------- | ------------------------------------- | ------------------------------------------------------------- |
| Overlay doesn’t open                     | No view container; beforeOpen cancels | `nxrOverlayViewContainer` or options; beforeOpen return value |
| Doesn’t close on Escape/outside          | Close policy; wrong target            | closePolicy; nested vs top overlay; backdrop vs pane click    |
| Behind header/sidebar                    | Low z-index                           | OVERLAY_BASE_Z_INDEX; or zIndex in options                    |
| Focus not restored                       | Noop focus strategy; trigger gone     | focusStrategy; lifecycle of trigger                           |
| Popover/tooltip closes on hover to panel | Gap or no content-hover               | allowContentHover; hover bridge/gap                           |
| Snackbar afterClosed no value            | Close path doesn’t pass value         | close(value) / nxrSnackbarClose with value                    |
| Snackbar open throws                     | No ViewContainerRef                   | Pass viewContainerRef / injector; see snackbar README         |
| Snackbar message replaced                | groupId                               | Same groupId closes previous; omit or use distinct groups     |
| Listbox wrong selected row               | Duplicate values / compareWith        | First registry match; fix accessors or compareWith            |
| Mention option not chosen                | blur before click                     | mousedown on options; see MENTION.md                          |
| Dropdown second open no-op               | Close still in flight                 | await close; DropdownRef serializes open                      |

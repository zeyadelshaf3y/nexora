# Mention — developer guide

This document complements the package **README**: integration patterns, **desktop + mobile** behavior, and edge cases.

## Placeholder (user-managed)

The library does **not** ship a built-in `nxrMentionPlaceholder` input. The editor host sets **`[attr.data-empty]`** on the contenteditable when trimmed text is empty (`''` when empty, removed when not). You can:

- Style a muted hint with **`[data-empty]`** on `.nxr-mention-editor` (e.g. `::before` content in your app CSS), or
- Wrap the field in a positioned container and show your own label that hides when the editor is non-empty (see the demo app).

## Focus and blur

- The editor is **contenteditable**. Choosing a suggestion must not steal focus in a way that drops the selection before `select()` runs.
- **Use `(mousedown)` on options**, not only `click`, so selection runs before the browser moves focus away from the editor.
- **`nxr-mention-panel-host`** registers **`mousedown` (capture)** and **`touchstart` (capture, non-passive)** on the panel subtree. For targets that are not native text fields, it calls `preventDefault()` so the editor stays focused until your handler runs.
- **Do not** rely on `preventDefault()` on `touchstart` for real `<input>`, `<textarea>`, `<select>`, links, or nested **contenteditable** inside your custom panel — those paths are skipped so native behavior still works.

## Deferred close on blur

When the editor **blurs**, the directive does **not** close the panel synchronously. It schedules a **microtask** and then **`requestAnimationFrame`**: if focus moved into the overlay pane (`.nxr-mention-overlay-pane`) or the internal `nxr-mention-panel-host`, the panel stays open. Otherwise it closes.

This matches tap/click flows where blur fires before the option’s `mousedown` / `touchstart`.

## Mobile

- **`touch-action: manipulation`** is applied on `.nxr-mention-editor` to reduce tap delay on many browsers.
- Prefer **`mousedown`** (and keyboard) for selection; **`touchstart`** on the host is an extra safety net for iOS-style focus ordering.
- Test with **virtual keyboard** open: panel positioning uses the overlay stack; very small viewports may need your panel template to scroll or constrain height.

## Styling custom panels

- Overlay pane class: **`NXR_MENTION_OVERLAY_PANE_CLASS`** (`nxr-mention-overlay-pane`).
- Internal wrapper tag: **`NXR_MENTION_PANEL_HOST_SELECTOR`** (`nxr-mention-panel-host`) — useful if you use `closest()` in app code or tests.

## `select()` and session lifetime

`MentionControllerImpl.select()` captures the active **session** (including `rangeStart` / `rangeEnd`) **before** calling `close()` when `closeOnSelect !== false`. Replacement therefore uses a consistent snapshot even after overlay teardown.

`MentionControllerImpl` also exposes `dispose()` for explicit teardown of its internal fetch pipeline. The public `nxrMention` directive already calls `close()` + `dispose()` during destroy; this matters only if you deep-import and own controller instances directly.

## Coalescing (`nxrMentionCoalesceSessionCheckToMicrotask`)

Default **`true`**: session checks run once per burst of input via the internal microtask scheduler (not `requestAnimationFrame`). Set **`false`** to run detection synchronously on every input event.

## Paste behavior (`nxrMentionBeforePaste`)

Paste is handled by the directive (default browser paste is prevented), then plain text is inserted through the adapter.

- `nxrMentionBeforePaste` receives a mutable `MentionPasteEvent`:
  - read: `plainText`, `htmlText`
  - write: `transformedText` (replace inserted text), `preventDefault` (cancel paste)
- Inserted text is clamped to a safe max length (`200_000` chars) to avoid pathological payloads.
- If your handler throws, paste is skipped (dev mode logs a one-time warning).

## Chip hover / click events

`mentionChipMouseEnter`, `mentionChipMouseLeave`, and `mentionChipClick` emit **`MentionChipInteractionEvent`**. The embedded **`MentionEntity`** carries chip **id**, **label**, and **text** from the DOM; **`start` and `end` are always `0`** (not resolved to linear offsets). Use **`getDocument()`** or **`getMentions()`** when you need positions in `bodyText`.

Set **`nxrMentionChipLeaveDelayMs`** (e.g. `100`–`150`) when you open a hover popover from `mentionChipMouseEnter`: the pointer can cross a small gap before `mentionChipMouseLeave` is considered.

Moving to **plain text inside the editor** ends chip hover **immediately** (no delay). Moving **chip → chip** is still handled by the usual `mouseover` transition.

## Query length cap

Per trigger, optional **`maxQueryLength`** on `MentionTriggerConfig` ends the mention match when the query segment grows past that length (panel closes / no `getItems` for that overlong query). Use to limit work and list height for very long typed queries.

## Per-trigger panel / overlay (`MentionTriggerPanelOptions`)

Optional **`panel`** on `MentionTriggerConfig` configures the **anchored overlay** for that trigger: scroll strategy, viewport/placement flags (`maintainInViewport`, `clampToViewport`, `preferredPlacementOnly`), `beforeOpen` / `beforeClose` (after the directive’s `nxrMentionBeforeOpen` / `nxrMentionBeforeClose`), placement/offset overrides, `closePolicy` (only `escape` / `outside` matter; **`backdrop` is always `'none'`**), per-trigger `closeAnimationDurationMs`, `arrowSize`, pane `ariaLabel` / `ariaLabelledBy`, sizing/classes/boundaries, and other fields passed through to `createAnchoredOverlayConfig`. See the type’s JSDoc for grouping and precedence; overlay options are fixed when the panel **first** opens for a session (switching trigger without closing does not recreate the overlay).

## Programmatic API notes

- `insertMention(item, options?)` supports:
  - legacy trigger string as second argument
  - preferred `{ trigger, at }` options where `at` is `'selection' | 'start' | 'end' | { start, end? }`
- Programmatic insertion also respects `beforeInsert` / `afterInsert`.

## Accessibility

- The directive sets basic **ARIA** on the editor (`role="textbox"`, `aria-expanded`, etc.).
- **Listbox / option roles** for your template are your responsibility.
- Wire `nxrMentionAriaControlsPanelId` if you expose a stable list id.
- Wire `nxrMentionAriaActiveDescendantId` if you maintain an active option id in your listbox template.

## Security boundary for chip attributes

When using `insertWith(...).mentionAttributes` or `getMentionAttributes`, only safe attributes are applied to mention chips:

- `class`
- `title`
- `data-*`
- `aria-*`

This intentionally blocks risky attributes (for example inline event handlers) from being written to chip elements.

## Emission behavior

- `mentionValueChange` emits only when the plain text value changes.
- `mentionDocumentChange` emits only when the document changes and is not suppressed by `setDocument(...)`.
- `mentionOpenChange` emits on open/close transitions only; it does not repeatedly emit `true` on each session re-check while already open.

## Internal architecture (adapter)

- `contenteditable-adapter.ts` orchestrates adapter behavior and event wiring.
- `internal/contenteditable-line-model.ts` owns line-row normalization (`<div><br></div>` model), structural `<br>` upgrades, and selection-safe text-space normalization.
- `internal/contenteditable-selection.ts` owns selection mapping (`walkSelectionModel`) and caret/offset geometry (`getCaretRectFromSelection`, `getBoundingRectAtLinearOffset`).
- `internal/contenteditable-subscribe.ts` wires DOM events (`input`, `keydown`, `paste`, composition, focus/blur, selection/scroll) to adapter callbacks.
- `internal/contenteditable-replace.ts` owns range replacement, mention chip element construction, safe attribute allowlisting (see [SECURITY.md](../../../../docs/SECURITY.md) — Mention attribute safety), and caret restoration.

## Naming vocabulary

- **Linear offset**: index in plain `bodyText`.
- **Selection map**: output of `walkSelectionModel` used to convert DOM selection/ranges <-> linear offsets.
- **Mention cursor**: internal pointer while reconstructing mention entities during `setDocument`.
- **Surface snapshot**: `{ value, document, lockedMentionTextRanges? }` returned from one DOM traversal.

## See also

- Package [README](../README.md)
- Workspace [docs/HEADLESS.md](../../../../docs/HEADLESS.md) (if present in monorepo)
- [docs/SECURITY.md](../../../../docs/SECURITY.md) — chip attribute allowlist and trust boundaries for custom mention markup

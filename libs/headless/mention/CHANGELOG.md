## 0.5.0 (2026-06-20)

### 🚀 Features

- Add a typed, structured `data` payload to mentions. ([6334a54](https://github.com/zeyadelshaf3y/nexora/commit/6334a54))

  ### @nexora-ui/mention (minor)
  - Add a typed, structured `data` payload to mentions: `MentionEntity<D>` gains `readonly data?: D` and `MentionDocument<D>` / `MentionChipContext<D>` / `MentionChipInteractionEvent<D>` / `MentionDirective<T, D>` are now generic over it (default `D = unknown`; `attributes` is unchanged and stays the DOM/styling bag). `MentionInsertion` gains `mentionData` so `insertWith` can supply the payload at insert time.
  - `data` round-trips through `getDocument()` -> `setDocument()` and chip re-render/restore via one reserved attribute, **`data-mention-data`** (JSON-encoded), exported as `NXR_MENTION_RESERVED_DATA_ATTR`. It is excluded from the `attributes` map and must not be used as an `attributes` key. Parsing is guarded: `undefined` => attribute absent; explicit `null` round-trips as `null`; non-serializable/malformed values are dropped (read back as `undefined`) and never throw.
  - Add `MentionDirective.updateMentionData(target, valueOrUpdater)` (mirrors `updateMentionAttributes`) and the `MentionDataUpdate` type.
  - A data-only document change now emits `mentionDocumentChange` (and an identical-data update does not).

  > **Backward compatible (additive):** existing consumers that never set `data` compile and behave exactly as before. Type the payload via `MentionDirective<Item, MyData>`. Inside `[nxrMentionChip]` templates `mention.data` is `unknown` (Angular does not infer template context generics) — narrow/cast at the call site.

### ❤️ Thank You

- Zeyad Alshafey

## 0.4.0 (2026-06-13)

### 🚀 Features

- Add overlay runtime control APIs and mention custom chip templates. ([93afd7f](https://github.com/zeyadelshaf3y/nexora/commit/93afd7f))

  ### @nexora-ui/overlay (minor)
  - Provide the `OVERLAY_REF` injection token to component content, so portaled dialog/drawer content can control its own overlay without a manual `injector` factory.
  - Add `OverlayRef` runtime control: `updateSize` (reset-to-`auto`, `panelStyle` preservation, host-scoped max support), `addPanelClass` / `removePanelClass`, and `addCloseGuard`.
  - Add `OverlayRef` lifecycle accessors `isOpen()`, `afterOpened()` (replayed, so it is observable from the ref returned by `open()`), and `beforeClosed()`.
  - Fix: keep the pane `transform-origin` anchored to the configured `transformOriginElement` on every reposition, so dialogs grow from the trigger instead of their center.
  - Fix: anchor the pane close-registry on `globalThis` so `@nexora-ui/overlay` and `@nexora-ui/overlay/internal` share one map.

  > **Interface expansion:** `OverlayRef` gained `isOpen`, `afterOpened`, `beforeClosed`, `updateSize`, `addPanelClass`, `removePanelClass`, and `addCloseGuard`. Code that **implements** `OverlayRef` directly must add these members. Code that only **consumes** `OverlayRef` is unaffected.

  ### @nexora-ui/mention (minor)
  - Add `MentionChipDirective` (`nxrMentionChip`) for custom chip templates, plus the supporting public types: `MentionChipContext`, `MentionEntityTarget`, `MentionEntityPredicate`, `MentionUpsertOptions`, `MentionReplaceOptions`, `MentionFocusOptions`, `MentionUpdateDocumentOptions`, `MentionAttributesUpdate`, and `MentionDocumentUpdater`.
  - Re-render existing chips when the registered chip templates (or their trigger) change.
  - Target the correct chip for `updateMentionAttributes` when multiple mentions share an id (matcher-by-index).

### 🧱 Updated Dependencies

- Updated overlay to 0.2.0

### ❤️ Thank You

- Zeyad Alshafey

## 0.3.0 (2026-06-10)

### 🚀 Features

- Add opt-in hover pointer highlight for select and combobox, and mention suggestion rows. ([e1df7b9](https://github.com/zeyadelshaf3y/nexora/commit/e1df7b9))

  ### @nexora-ui/listbox (patch)
  - Extend `NxrListboxOverlayPanelContext` with `pointerHighlight` and forward it to `[nxrListboxPointerHighlight]` in the overlay panel host.

  ### @nexora-ui/listbox-cdk (patch)
  - Align overlay panel portal test fixture with the updated listbox panel context shape.

  ### @nexora-ui/select (minor)
  - Add `[pointerHighlight]="'hover' | 'off'"` input (default `'off'`).
  - Export `SelectPointerHighlight` type.

  ### @nexora-ui/combobox (minor)
  - Add `[pointerHighlight]="'hover' | 'off'"` input (default `'off'`).
  - Export `ComboboxPointerHighlight` type.

  ### @nexora-ui/mention (minor)
  - Add `[nxrMentionPointerHighlight]="'hover' | 'off'"` (default `'hover'`).
  - Add `MentionOptionDirective` (`[nxrMentionOption]="$index"`) for hover and mousedown highlight.
  - Fix portaled panel DI: `createMentionPanelOutletInjector` + `[ngTemplateOutletInjector]` on the panel host so option directives resolve `NXR_MENTION_CONTROLLER`.
  - Move panel tokens to `mention-panel-tokens.ts`.

  ### Consumer notes
  - Select/combobox: set `[pointerHighlight]="'hover'"` for menu-like hover (default preserves prior mousedown-only behavior).
  - Mention: add `[nxrMentionOption]="$index"` on each suggestion row when using hover highlight.

### ❤️ Thank You

- Zeyad Alshafey

## 0.1.1 (2026-05-01)

### 🧱 Updated Dependencies

- Updated overlay to 0.1.1

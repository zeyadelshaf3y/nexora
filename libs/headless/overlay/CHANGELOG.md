## 0.2.0 (2026-06-13)

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

### ❤️ Thank You

- Zeyad Alshafey

## Unreleased

### 🚀 Features

- **overlay:** provide the `OVERLAY_REF` injection token to component content so an opened dialog/drawer can control its own overlay without a manual `injector` factory
- **overlay:** add runtime control to `OverlayRef` — `updateSize` (with reset-to-`auto`, `panelStyle` preservation, and host-scoped max support), `addPanelClass` / `removePanelClass`, and `addCloseGuard`
- **overlay:** add `OverlayRef` lifecycle accessors `isOpen()`, `afterOpened()` (replayed, so it is observable from the ref returned by `open()`), and `beforeClosed()`

> **Note (interface expansion):** `OverlayRef` gained `isOpen`, `afterOpened`, `beforeClosed`, `updateSize`, `addPanelClass`, `removePanelClass`, and `addCloseGuard`. Code that **implements** `OverlayRef` directly (e.g. custom refs or structural test doubles) must add these members. Code that only **consumes** `OverlayRef` is unaffected.

### 🩹 Fixes

- **overlay:** anchor the pane close-registry on `globalThis` so `@nexora-ui/overlay` and `@nexora-ui/overlay/internal` share one map; fixes `nxrPopoverClose` (and other close directives reading via `/internal`) silently no-oping in published apps
- **overlay:** keep the pane `transform-origin` anchored to the configured `transformOriginElement` on every reposition. Previously a reposition during the open animation (e.g. the pane `ResizeObserver`'s initial callback now that unanchored overlays observe resize) reset the origin to the placement value, so dialogs grew from their center instead of the trigger

## 0.1.2 (2026-05-01)

### 🚀 Features

- **overlay:** add `OverlayAnchorPopupRegistry` for tooltip/popup coordination on shared anchors

### 🧱 Chore

- Align source `package.json` version with publishable artifacts.

## 0.1.1 (2026-05-01)

### 🩹 Fixes

- **tooltip:** close on tab hidden and outside pointer; align popover & overlay
- **overlay:** preserve reactive input updates in dynamic dialogs and drawers

### ❤️ Thank You

- Zeyad Alshafey

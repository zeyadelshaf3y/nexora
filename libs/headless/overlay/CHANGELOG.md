## Unreleased

### 🩹 Fixes

- **overlay:** anchor the pane close-registry on `globalThis` so `@nexora-ui/overlay` and `@nexora-ui/overlay/internal` share one map; fixes `nxrPopoverClose` (and other close directives reading via `/internal`) silently no-oping in published apps

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

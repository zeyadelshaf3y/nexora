## 0.3.1 (2026-06-09)

### 🩹 Fixes

- fix(listbox): import primary entry in overlay host to dedupe NXR_LISTBOX_CONTROLLER

  The internal secondary bundle duplicated `NXR_LISTBOX_CONTROLLER`, so option directives from the primary entry could not inject the controller provided by the overlay panel. Options rendered without `role="option"` and did not register with the listbox.

### ❤️ Thank You

- Cursor
- Zeyad Alshafey

## 0.3.2 (2026-06-09)

### 🩹 Fixes

- fix(listbox): publish deduplicated NXR_LISTBOX_CONTROLLER in internal bundle ([351ecc3](https://github.com/zeyadelshaf3y/nexora/commit/351ecc3))

  Republish after the internal entry import fix so select/combobox options receive
  NXR_LISTBOX_CONTROLLER and render with role="option".

### ❤️ Thank You

- Cursor @cursoragent
- Zeyad Alshafey

## 0.3.1 (2026-06-09)

### 🩹 Fixes

- fix(listbox): import primary entry in overlay host to dedupe NXR_LISTBOX_CONTROLLER

  The internal secondary bundle duplicated `NXR_LISTBOX_CONTROLLER`, so option directives from the primary entry could not inject the controller provided by the overlay panel. Options rendered without `role="option"` and did not register with the listbox.

### ❤️ Thank You

- Cursor
- Zeyad Alshafey

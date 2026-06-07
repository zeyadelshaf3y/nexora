---
overlay: patch
listbox-cdk: patch
dropdown: patch
popover: patch
tooltip: patch
menu: patch
select: patch
combobox: patch
snackbar: patch
mention: patch
headless: patch
---

fix(headless): republish anchor popup coordination to npm

Republish overlay, dropdown, popover, tooltip, menu, select, combobox, and
dependents after the prior release skipped them because target versions
already existed on npm without this feature code.

fix(overlay): share closeable ref registry on globalThis across main and /internal entrypoints
feat(overlay): export OverlayAnchorPopupRegistry for tooltip/popup coordination on shared anchors
feat(dropdown): optional anchorPopupRegistry on DropdownRef
feat(popover,tooltip): close and suppress tooltip while an anchored popup is open on the same anchor
feat(menu,select,combobox): wire anchor popup registry and listbox overlay panel updates

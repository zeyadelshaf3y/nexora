---
overlay: patch
listbox: minor
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

feat(overlay,dropdown,listbox,popover,tooltip,menu,select,combobox): anchor popup coordination and listbox highlight events

fix(overlay): share closeable ref registry on globalThis across main and /internal entrypoints
feat(overlay): export OverlayAnchorPopupRegistry for tooltip/popup coordination on shared anchors
feat(dropdown): optional anchorPopupRegistry on DropdownRef
feat(listbox): nxrListboxOptionHighlighted output, nxrListboxOptionHighlightedOn input, and highlight source types
feat(popover,tooltip): close and suppress tooltip while an anchored popup is open on the same anchor
feat(menu,select,combobox): wire anchor popup registry and listbox overlay panel updates

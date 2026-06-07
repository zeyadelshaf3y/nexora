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

Requires git tags synced to current npm versions first (npm run release:sync-tags).
Bumps one patch above npm so publish is not skipped. listbox is excluded — already
on npm at 0.3.0; source must stay at 0.3.0 so publish retags latest to 0.3.0.

fix(overlay): share closeable ref registry on globalThis across main and /internal entrypoints
feat(overlay): export OverlayAnchorPopupRegistry for tooltip/popup coordination on shared anchors
feat(dropdown): optional anchorPopupRegistry on DropdownRef
feat(popover,tooltip): close and suppress tooltip while an anchored popup is open on the same anchor
feat(menu,select,combobox): wire anchor popup registry and listbox overlay panel updates

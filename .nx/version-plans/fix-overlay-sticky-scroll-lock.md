---
overlay: patch
---

fix(overlay): stop locking html overflow so sticky headers work behind dialogs

BlockScrollStrategy now sets overflow hidden on document.body only. Locking
document.documentElement broke position: sticky on page chrome (headers, sidebars)
while modal dialogs were open.

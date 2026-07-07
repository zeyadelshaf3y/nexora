---
mention: patch
---

Fix touch selection for mention suggestion rows.

### @nexora-ui/mention (patch)

- **`MentionOptionDirective`** (`[nxrMentionOption]`): select the indexed item on touch **`pointerup`**. The panel host calls `preventDefault()` on `touchstart` so the contenteditable keeps focus; that suppresses the compatibility **`mousedown`** / **`click`** sequence, so consumer `(mousedown)="select(item)"` handlers never ran on touch screens.
- Ignore touch drags beyond a small movement threshold so scrolling the panel does not accidentally select.
- Desktop mouse behavior is unchanged — keep `(mousedown)="select(item)"` on each row.

### Consumer notes

- Ensure every suggestion row has **`[nxrMentionOption]="$index"`** (required for touch tap-to-select).
- Desktop: keep **`(mousedown)="select(item)"`** as before.

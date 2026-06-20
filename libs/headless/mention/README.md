# @nexora-ui/mention

Headless **mention** primitive for Angular: type a **trigger** (`@`, `#`, …) in a **contenteditable** surface, show a suggestion **overlay**, insert a mention span or plain text.

**Public API:** Exports from `src/index.ts` are the supported surface ([PUBLIC-API-DESIGN.md](../../../docs/PUBLIC-API-DESIGN.md)).

## Principles

Headless, unstyled panel template; contenteditable line model with safe chip deletion; overlay hooks aligned with combobox. **Line model, blur timing, mobile, and chip hover** are covered in [docs/MENTION.md](./docs/MENTION.md). **Chip DOM attributes** merged onto mentions are allowlisted for security—see [SECURITY.md](../../../docs/SECURITY.md) (Mention attribute safety).

## Quick start

```html
<div
  nxrMention
  #mention="nxrMention"
  [nxrMentionTriggers]="triggers"
  (mentionOpenChange)="open.set($event)"
>
  <ng-template nxrMentionPanel let-state="state" let-select="select" let-close="close">
    @for (item of state.items; track $index) {
    <!-- mousedown (not click) avoids blur timing; panel host also retains focus on pointer/touch -->
    <button type="button" (mousedown)="select(item)">{{ display(item) }}</button>
    }
  </ng-template>
</div>
```

**More detail:** [docs/MENTION.md](./docs/MENTION.md) (blur deferral, mobile, `select()` ordering, placeholder pattern).

### Mobile

- Use **`(mousedown)`** on options (same as desktop).
- The internal **`nxr-mention-panel-host`** uses capture **`touchstart`** (non-passive) where appropriate so taps can still reach `select()` before the editor loses focus.
- Editor surface uses **`touch-action: manipulation`** for snappier taps.

```ts
// Programmatic: insert trigger, then detect (or rely on input from insertTextAtCaret)
mention.insertTextAtCaret('@');
mention.detectMentions();
mention.closeMentionPanel();
mention.focus();
```

## Styling hooks

| Class                                                        | Purpose                                                                                           |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| `.nxr-mention-editor-wrapper`                                | Layout wrapper (block, width)                                                                     |
| `.nxr-mention-editor`                                        | Contenteditable — structural defaults; override via `nxrMentionEditorClass`                       |
| `.nxr-mention` / `.nxr-mention-tag` / `.nxr-mention-command` | Inserted mention **spans** — minimal structural styles; use `nxrMentionChipClass` + CSS for chips |
| `.nxr-mention-overlay-pane`                                  | Overlay pane (+ `nxr-overlay-pane--open` / `--closing`)                                           |

### Overlay styling inputs

| Hook                    | Type                     | Applies to   | Notes                                                                                       |
| ----------------------- | ------------------------ | ------------ | ------------------------------------------------------------------------------------------- |
| `nxrMentionPanelClass`  | `string \| string[]`     | Overlay pane | Reusable pane styling/animation class(es).                                                  |
| `nxrMentionPanelStyle`  | `Record<string, string>` | Overlay pane | Directive-level pane style defaults, merged with trigger `panel.panelStyle` (trigger wins). |
| `nxrMentionChipClass`   | `string`                 | Mention chip | Class merged onto inserted mention chip spans.                                              |
| `nxrMentionEditorClass` | `string \| string[]`     | Editor host  | Class(es) applied to the contenteditable host.                                              |

## Inputs (directive)

- `nxrMentionTriggers` (required): per-trigger config.
- `nxrMentionDebounceMs` (`0`): debounce for `getItems`.
- `nxrMentionLoadingDebounceMs` (`120`): delay before `loading` becomes true.
- `nxrMentionMinLoadingMs` (`120`): minimum visible loading duration.
- `nxrMentionCloseOnBlur` (`true`): close on editor blur (deferred; see `MENTION.md`).
- `nxrMentionPlacement` (`bottom-start`): overlay placement.
- `nxrMentionOffset` (`NXR_MENTION_DEFAULT_PANEL_OFFSET`): panel offset in px.
- `nxrMentionMovePanelWithCaret` (`false`): follow caret when true, trigger anchor when false.
- `nxrMentionPanelClass` (none): extra overlay pane class(es).
- `nxrMentionPanelStyle` (none): inline overlay pane style defaults (merged with per-trigger `panel.panelStyle`; trigger keys win).
- `nxrMentionCloseAnimationDurationMs` (`150`): close animation duration.
- `nxrMentionAriaLabel` (default constant): `aria-label` on editor.
- `nxrMentionAriaControlsPanelId` (none): optional `aria-controls` target.
- `nxrMentionAriaActiveDescendantId` (none): optional `aria-activedescendant`.
- `nxrMentionDocument` (`null`): two-way document input.
- `nxrMentionBeforeOpen` / `nxrMentionBeforeClose` (none): same contract as `@nexora-ui/overlay`.
- `nxrMentionEditorClass` (none): extra editor class(es).
- `nxrMentionChipClass` (none): base class merged onto mention chips.
- `nxrMentionDisabled` (`false`): disables editor and closes panel.
- `nxrMentionBeforePaste` (none): mutate `MentionPasteEvent` to transform or block paste.
- `nxrMentionChipLeaveDelayMs` (`0`): delays chip leave when pointer moves toward non-chip UI.
- `nxrMentionCoalesceSessionCheckToMicrotask` (`true`): coalesce mention session checks to one pass per input burst (see **Coalescing** in [MENTION.md](./docs/MENTION.md)).

### Trigger config (`MentionTriggerConfig`)

- `getItems`: sync array, `Promise`, or `Observable` of **`readonly T[]`** (mutable `T[]` is still accepted where TypeScript widens). Do not mutate arrays after returning them; the controller treats lists as read-only.
- `maxQueryLength`: optional cap; no match when query exceeds this length.
- `panel` (`MentionTriggerPanelOptions`, optional): per-trigger overlay behavior — e.g. `scrollStrategy`, `maintainInViewport`, `clampToViewport`, `preferredPlacementOnly`, `beforeOpen` / `beforeClose` (after the directive’s `nxrMentionBeforeOpen` / `nxrMentionBeforeClose`), `placement` / `offset`, `closePolicy` (`escape` / `outside` are mergeable; **`backdrop` is always `'none'`** because the panel is non-modal), `closeAnimationDurationMs` (overrides `nxrMentionCloseAnimationDurationMs`), `arrowSize`, pane `ariaLabel` / `ariaLabelledBy`, sizing / `boundaries` / `panelClass`, and other fields forwarded to `createAnchoredOverlayConfig`. **`ArrowSize`** is re-exported from `@nexora-ui/mention` for convenience. See JSDoc on `MentionTriggerPanelOptions` for grouping, precedence, and limits (e.g. options apply when the overlay is created, not when switching trigger while already open).

## Constants

- `NXR_MENTION_DEFAULT_PANEL_OFFSET` (default panel offset in px)
- `NXR_MENTION_DEFAULT_ARIA_LABEL` (default editor aria-label)

## Custom chip templates

Render rich chip contents (avatar + name, `#` icon + tag, …) with `ng-template[nxrMentionChip]`. The library always owns the chip span (the mention boundary and its canonical `data-mention-text`); your template only fills the inner visual content.

```html
<div nxrMention [nxrMentionTriggers]="triggers">
  <!-- default template (any trigger without a specific override) -->
  <ng-template nxrMentionChip let-mention let-text="text">
    <span class="chip-label">{{ text }}</span>
  </ng-template>

  <!-- per-trigger override -->
  <ng-template nxrMentionChip="@" let-mention let-text="text">
    <img class="chip-avatar" [src]="mention.attributes?.['data-avatar']" alt="" />
    <span>{{ text }}</span>
  </ng-template>

  <ng-template nxrMentionPanel let-state="state" let-select="select"><!-- … --></ng-template>
</div>
```

Context (`MentionChipContext`): `$implicit` / `mention` (the `MentionEntity`), `text` (canonical chip text), `trigger`.

Key rules:

- The template is **item-free by design**. Hydration is DOM-driven and also runs on `setDocument` restore, where the original selected item no longer exists. Put presentational data (avatar URL, initials, icon kind, color) into the mention `attributes` via `getMentionAttributes` / `insertWith(...).mentionAttributes` so it round-trips and renders identically on insert and restore.
- Chip `attributes` are allowlisted (`class`, `title`, `data-*`, `aria-*`); `data-mention-text` is reserved/canonical and never overridable.
- The chip carries `data-mention-trigger` so per-trigger templates resolve after restore; it round-trips through `MentionDocument.attributes`.
- Entity `start`/`end` are `0` in the chip context (not resolved to offsets). Use `getDocument()` / `getMentions()` for positions.
- Custom interactive controls inside a chip should `stopPropagation()` so they don't trigger chip click/hover outputs. Keep a meaningful `label`/`aria-label` when visuals are icon-only.
- With no matching template the chip keeps its plain-text rendering (fully backward compatible).

## Structured `data` payload

Alongside the string `attributes` bag (for DOM/styling) and `label`, each mention can carry a typed, structured **`data`** payload — persist mentions as references (e.g. `{ kind: 'user' | 'team'; refId: string; handle?: string }`) and resolve display values at read time.

```ts
// Supply data at insert time
insertWith: ((item) => ({
  replacementText: item.name,
  mentionId: item.id,
  mentionData: { kind: 'user', refId: item.id, handle: item.handle },
}),
  // Or set/restore it on the document
  mention.setDocument({
    bodyText,
    mentions: [{ id, text, start, end, data: { kind: 'user', refId } }],
  }));
mention.getMentions()[0].data; // -> { kind: 'user', refId }
mention.updateMentionData('u1', (data) => ({ ...data, handle: 'alice' }));
```

- Type it with the directive's second generic: `MentionDirective<Item, MyData>` (so `getDocument()`, `getMentions()`, chip interaction events, etc. are typed). The default is `unknown`.
- `data` is read from chip interaction events (`mentionChipClick`/`MouseEnter`/`Leave`) and the `[nxrMentionChip]` template context (`mention.data`). Note: Angular does not infer template context generics, so inside the template `mention.data` is `unknown` — narrow/cast it at the call site.
- **Round-trip:** `data` survives `getDocument()` -> `setDocument()` and chip re-render/restore, the same guarantee as `attributes`. It rides ONE reserved attribute, **`data-mention-data`** (exported as `NXR_MENTION_RESERVED_DATA_ATTR`), encoded as JSON; it never appears in the `attributes` map. Like the rest of the document, mentions are resolved to plain text on a (plain-text) paste.
- **Serialization contract:** `data` must be JSON-serializable. `undefined` => no attribute is written (reads back `undefined`); explicit `null` round-trips as `null`; non-serializable values (cycles, `BigInt`, …) are dropped on write and read back as `undefined`. Parsing is guarded — a malformed value never throws and never corrupts the document.
- Reserved key: do not use `data-mention-data` as an `attributes` key; it is ignored in favor of the encoded `data`.

## Trigger text vs chip (e.g. Facebook)

The parser replaces the whole range **from trigger through query** (`rangeStart`–`rangeEnd`).  
Use **`insertWith`** so **`replacementText`** is only the visible name (and `mentionId` / `getMentionAttributes` for the chip). The literal `@` is **not** kept unless you include it in `replacementText`.

## Security notes

- Mention chip attributes are allowlisted for safety: `class`, `title`, and `data-*` / `aria-*`.
- Event handlers and style attributes are intentionally ignored when building chip DOM attributes.
- Treat external item data as untrusted input and sanitize at your data boundary as needed.
- Workspace guidance: [Security docs](../../../docs/SECURITY.md).

## API notes

- **`MentionItemsResult<T>`** is exported from the package entry for typing **`getItems`** return values (sync / `Promise` / `Observable` of **`readonly T[]`**).
- TypeScript types are split for maintainability: **`mention-types-core.ts`** (match/session/trigger/document model) and **`mention-types-events.ts`** (selection/paste callbacks and events). Import from the package entry as before; **`mention-types.ts`** re-exports the full set.
- `mentionValueChange` and `mentionDocumentChange` are coalesced to avoid duplicate emissions for unchanged content.
- `mentionOpenChange` is transition-based (`true` on closed -> open, `false` on open -> closed), so repeated session checks while open do not re-emit `true`.
- Internal note: `MentionControllerImpl` now has `close()` plus `dispose()`; `nxrMention` calls both during teardown. Package consumers should use the directive API (no deep imports).

### Programmatic editing

Use the template ref (`#mention="nxrMention"`) for editor/document operations:

- `getPlainText()`, `getMentions()`, `getDocument()` read the current serialized state.
- `setDocument(doc)` restores a document and suppresses `mentionDocumentChange` for sync/restore flows.
- `updateDocument(updater, { emit? })` applies a document update and emits by default when content changes.
- `insertMention(item, { trigger, at })` inserts or replaces an explicit range.
- `replaceMention(idOrMatcher, item, { trigger? })` replaces one existing mention and returns `false` when not found.
- `upsertMention(item, { mentionId, matchBy, trigger, fallbackAt })` replaces a matching mention or inserts at `fallbackAt`.
- `removeMention(idOrMatcher)` removes one mention.
- `updateMentionAttributes(idOrMatcher, patchOrUpdater)` patches safe chip attributes (`class`, `title`, `data-*`, `aria-*`) and refreshes chip templates.
- `updateMentionData(idOrMatcher, valueOrUpdater)` patches the structured `data` payload in place (returning `undefined` clears it); equivalent to a targeted `updateDocument`.
- `selectMentionRange(idOrMatcherOrRange)` and `focusMention(id, options?)` help build edit/inspect flows.

`replaceMention` and `upsertMention` reuse the same insertion path as panel selection, including `insertWith`, `getMentionAttributes`, `beforeInsert`, `afterInsert`, chip classes, and `mentionSelect`. When replacing a library-created chip, they consume one following space if present so repeated upserts do not accumulate separators.

## RTL

Caret rects use `getBoundingClientRect` with a **`getClientRects` fallback** so the panel can follow the caret in RTL when `nxrMentionMovePanelWithCaret` is true.

## Accessibility

- Editor: `role="textbox"`, `aria-expanded`, `aria-autocomplete="list"` when open, `aria-haspopup="listbox"`.
- Point **`nxrMentionAriaControlsPanelId`** at your listbox id if you expose one.
- Point **`nxrMentionAriaActiveDescendantId`** at the current active option id if your panel supports active-row semantics.
- Panel markup (roles for list/options) is **your** responsibility in the template.

## Dependencies

- `@nexora-ui/core`
- `@nexora-ui/overlay`

## Running unit tests

```bash
nx test mention
```

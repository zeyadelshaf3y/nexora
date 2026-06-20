---
mention: minor
---

Add a typed, structured `data` payload to mentions.

### @nexora-ui/mention (minor)

- Add a typed, structured `data` payload to mentions: `MentionEntity<D>` gains `readonly data?: D` and `MentionDocument<D>` / `MentionChipContext<D>` / `MentionChipInteractionEvent<D>` / `MentionDirective<T, D>` are now generic over it (default `D = unknown`; `attributes` is unchanged and stays the DOM/styling bag). `MentionInsertion` gains `mentionData` so `insertWith` can supply the payload at insert time.
- `data` round-trips through `getDocument()` -> `setDocument()` and chip re-render/restore via one reserved attribute, **`data-mention-data`** (JSON-encoded), exported as `NXR_MENTION_RESERVED_DATA_ATTR`. It is excluded from the `attributes` map and must not be used as an `attributes` key. Parsing is guarded: `undefined` => attribute absent; explicit `null` round-trips as `null`; non-serializable/malformed values are dropped (read back as `undefined`) and never throw.
- Add `MentionDirective.updateMentionData(target, valueOrUpdater)` (mirrors `updateMentionAttributes`) and the `MentionDataUpdate` type.
- A data-only document change now emits `mentionDocumentChange` (and an identical-data update does not).

> **Backward compatible (additive):** existing consumers that never set `data` compile and behave exactly as before. Type the payload via `MentionDirective<Item, MyData>`. Inside `[nxrMentionChip]` templates `mention.data` is `unknown` (Angular does not infer template context generics) — narrow/cast at the call site.

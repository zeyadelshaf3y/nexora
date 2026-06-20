export const LINE_BLOCK_TAG_DIV = 'DIV';
export const LINE_BLOCK_TAG_P = 'P';
export const LINE_BREAK_TAG = 'BR';

export const ATTR_MENTION_ID = 'data-mention-id';
export const ATTR_MENTION_LABEL = 'data-mention-label';
/**
 * Canonical mention text stored on the chip span. This is the source of truth for the
 * document/offset model so a custom chip template can render arbitrary inner DOM (avatars,
 * icons, badges) without corrupting `bodyText`.
 */
export const ATTR_MENTION_TEXT = 'data-mention-text';
/**
 * Trigger character the chip was created from (e.g. `@`, `#`). Rides as a regular `data-*`
 * attribute so it round-trips through `MentionDocument.attributes` and lets per-trigger chip
 * templates resolve on restore.
 */
export const ATTR_MENTION_TRIGGER = 'data-mention-trigger';
export const ATTR_CONTENTEDITABLE = 'contenteditable';
/**
 * Reserved chip attribute holding the JSON-encoded structured `data` payload of a mention entity
 * (see `MentionEntity.data`). It is the round-trip channel for `data`, kept separate from the
 * string `attributes` bag. Reserved: it must not collide with user-supplied `attributes` keys and
 * is excluded from the entity `attributes` map on read.
 */
export const ATTR_MENTION_DATA = 'data-mention-data';

/**
 * Resolves the canonical logical text for a mention chip element. Falls back to `textContent`
 * for legacy chips or chips created without an explicit `data-mention-text`.
 */
export function readMentionLogicalText(el: Element): string {
  return el.getAttribute(ATTR_MENTION_TEXT) ?? el.textContent ?? '';
}

/**
 * Parses the structured `data` payload from a chip's reserved `data-mention-data` attribute.
 * Guarded: a missing or malformed value yields `undefined` (never throws). `JSON.parse('null')`
 * legitimately yields `null`, so an explicit `null` payload round-trips as `null`.
 */
export function readMentionData(el: Element): unknown {
  const raw = el.getAttribute(ATTR_MENTION_DATA);
  if (raw == null) return undefined;

  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

/**
 * Serializes a structured `data` payload for the reserved `data-mention-data` attribute.
 * Returns `null` when the attribute should be omitted: `undefined` input (=> read back as
 * `undefined`) or a non-serializable value (cycles, BigInt, …) which is dropped rather than
 * throwing. An explicit `null` serializes to `'null'` and round-trips as `null`.
 */
export function serializeMentionData(value: unknown): string | null {
  if (value === undefined) return null;

  try {
    return JSON.stringify(value) ?? null;
  } catch {
    return null;
  }
}

export function isLineBlockTag(tagName: string): boolean {
  return tagName === LINE_BLOCK_TAG_DIV || tagName === LINE_BLOCK_TAG_P;
}

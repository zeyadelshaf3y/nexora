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
 * Resolves the canonical logical text for a mention chip element. Falls back to `textContent`
 * for legacy chips or chips created without an explicit `data-mention-text`.
 */
export function readMentionLogicalText(el: Element): string {
  return el.getAttribute(ATTR_MENTION_TEXT) ?? el.textContent ?? '';
}

export function isLineBlockTag(tagName: string): boolean {
  return tagName === LINE_BLOCK_TAG_DIV || tagName === LINE_BLOCK_TAG_P;
}

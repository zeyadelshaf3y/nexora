export const LINE_BLOCK_TAG_DIV = 'DIV';
export const LINE_BLOCK_TAG_P = 'P';
export const LINE_BREAK_TAG = 'BR';

export const ATTR_MENTION_ID = 'data-mention-id';
export const ATTR_MENTION_LABEL = 'data-mention-label';
export const ATTR_CONTENTEDITABLE = 'contenteditable';

export function isLineBlockTag(tagName: string): boolean {
  return tagName === LINE_BLOCK_TAG_DIV || tagName === LINE_BLOCK_TAG_P;
}

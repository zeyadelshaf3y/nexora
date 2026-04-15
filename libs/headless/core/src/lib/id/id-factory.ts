import { createId } from './create-id';

/**
 * Returns a function that generates unique ids, optionally with a prefix.
 * Useful for aria linking (e.g. trigger id + panel id with same base) or multiple related ids.
 *
 * Each invocation of the returned function produces a new unique id. The prefix is not
 * guaranteed to be unique across the page; uniqueness comes from the suffix.
 *
 * @param prefix - Optional prefix (e.g. "popover-panel"); ids will look like `${prefix}-${unique}` or just unique if omitted
 * @returns A function that returns a new unique string on each call
 */
export function idFactory(prefix?: string): () => string {
  if (!prefix) {
    return createId;
  }

  return () => `${prefix}-${createId()}`;
}

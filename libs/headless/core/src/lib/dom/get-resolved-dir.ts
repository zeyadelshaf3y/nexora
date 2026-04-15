import { ownerDocument } from './owner-document';

/**
 * Resolves text direction for RTL/LTR-aware layout and positioning.
 * Uses the element's nearest `[dir]` ancestor, or the document element when no element is given.
 * Safe for SSR: returns `'ltr'` when document is not available.
 *
 * @param element - Element to resolve direction from (e.g. anchor or host). When `undefined` or `null`, uses the document root.
 * @returns `'ltr'` or `'rtl'`
 */
export function getResolvedDir(element?: HTMLElement | null): 'ltr' | 'rtl' {
  const doc = ownerDocument(element ?? undefined);

  if (!doc) return 'ltr';

  const el = element?.closest?.('[dir]') ?? doc.documentElement;
  const dir = el.getAttribute?.('dir')?.toLowerCase();

  return dir === 'rtl' ? 'rtl' : 'ltr';
}

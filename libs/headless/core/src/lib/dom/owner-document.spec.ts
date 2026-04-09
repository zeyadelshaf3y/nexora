import { ownerDocument } from './owner-document';

describe('ownerDocument', () => {
  it('returns the global document when called with no argument', () => {
    expect(ownerDocument()).toBe(document);
  });

  it('returns the same document when passed a Document', () => {
    expect(ownerDocument(document)).toBe(document);
  });

  it('returns the ownerDocument of an element', () => {
    const el = document.createElement('div');
    expect(ownerDocument(el)).toBe(document);
  });

  it('returns the global document for null (falls through to canUseDOM check)', () => {
    expect(ownerDocument(null)).toBe(document);
  });
});

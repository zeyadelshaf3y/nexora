import type { MentionDocument } from '../types/mention-types';

import { isSameMentionDocument } from './mention-document-equality';

describe('isSameMentionDocument', () => {
  const base: MentionDocument = {
    bodyText: 'Hello Alice',
    mentions: [
      {
        id: 'u1',
        label: 'Alice',
        text: 'Alice',
        start: 6,
        end: 11,
        attributes: { 'data-role': 'user' },
      },
    ],
  };

  it('returns true for same reference', () => {
    expect(isSameMentionDocument(base, base)).toBe(true);
  });

  it('returns true for structurally equal documents', () => {
    const equal: MentionDocument = {
      bodyText: 'Hello Alice',
      mentions: [
        {
          id: 'u1',
          label: 'Alice',
          text: 'Alice',
          start: 6,
          end: 11,
          attributes: { 'data-role': 'user' },
        },
      ],
    };
    expect(isSameMentionDocument(base, equal)).toBe(true);
  });

  it('returns false when body text differs', () => {
    const changed: MentionDocument = { ...base, bodyText: 'Hello Bob' };
    expect(isSameMentionDocument(base, changed)).toBe(false);
  });

  it('returns false when mention order differs', () => {
    const a: MentionDocument = {
      bodyText: 'AB',
      mentions: [
        { id: 'a', text: 'A', start: 0, end: 1 },
        { id: 'b', text: 'B', start: 1, end: 2 },
      ],
    };
    const b: MentionDocument = {
      bodyText: 'AB',
      mentions: [
        { id: 'b', text: 'B', start: 1, end: 2 },
        { id: 'a', text: 'A', start: 0, end: 1 },
      ],
    };
    expect(isSameMentionDocument(a, b)).toBe(false);
  });

  it('returns false when mention attributes differ', () => {
    const changed: MentionDocument = {
      ...base,
      mentions: [
        {
          ...base.mentions[0],
          attributes: { 'data-role': 'admin' },
        },
      ],
    };
    expect(isSameMentionDocument(base, changed)).toBe(false);
  });

  it('returns true when attributes are equal with different key order', () => {
    const a: MentionDocument = {
      bodyText: 'A',
      mentions: [
        {
          id: 'u1',
          text: 'A',
          start: 0,
          end: 1,
          attributes: { 'data-role': 'user', 'aria-label': 'User' },
        },
      ],
    };
    const b: MentionDocument = {
      bodyText: 'A',
      mentions: [
        {
          id: 'u1',
          text: 'A',
          start: 0,
          end: 1,
          attributes: { 'aria-label': 'User', 'data-role': 'user' },
        },
      ],
    };
    expect(isSameMentionDocument(a, b)).toBe(true);
  });

  it('handles large equivalent documents', () => {
    const mentions = Array.from({ length: 1200 }, (_, i) => {
      const text = `U${i}`;
      const start = i * 3;
      const end = start + text.length;

      return {
        id: `u-${i}`,
        text,
        start,
        end,
        attributes: { 'data-idx': `${i}` },
      };
    });

    const docA: MentionDocument = {
      bodyText: 'x'.repeat(3600),
      mentions,
    };

    const docB: MentionDocument = {
      bodyText: docA.bodyText,
      mentions: mentions.map((m) => ({ ...m })),
    };

    expect(isSameMentionDocument(docA, docB)).toBe(true);
  });
});

import type { MentionDocument, MentionEntity } from '../types/mention-types';

function isSameMentionIdentity(a: MentionEntity, b: MentionEntity): boolean {
  return a.id === b.id && a.start === b.start && a.end === b.end && a.text === b.text;
}

function isSameMention(a: MentionEntity, b: MentionEntity): boolean {
  return (
    isSameMentionIdentity(a, b) &&
    a.label === b.label &&
    hasSameAttributes(a.attributes, b.attributes)
  );
}

function hasSameAttributes(
  a: Readonly<Record<string, string>> | undefined,
  b: Readonly<Record<string, string>> | undefined,
): boolean {
  if (a === b) return true;

  const expected = a ?? {};
  const actual = b ?? {};
  const hasOwn = Object.prototype.hasOwnProperty;

  let expectedCount = 0;

  for (const key in expected) {
    if (!hasOwn.call(expected, key)) continue;

    expectedCount += 1;

    if (expected[key] !== actual[key]) return false;
  }

  let actualCount = 0;

  for (const key in actual) {
    if (!hasOwn.call(actual, key)) continue;
    actualCount += 1;
  }

  return expectedCount === actualCount;
}

function hasSameBoundaryMentions(
  a: MentionDocument,
  b: MentionDocument,
  mentionCount: number,
): boolean {
  const aFirst = a.mentions[0];
  const bFirst = b.mentions[0];

  if (!isSameMentionIdentity(aFirst, bFirst)) return false;

  if (!hasSameAttributes(aFirst.attributes, bFirst.attributes)) return false;

  if (mentionCount > 1) {
    const aLast = a.mentions[mentionCount - 1];
    const bLast = b.mentions[mentionCount - 1];

    if (!isSameMentionIdentity(aLast, bLast)) return false;
    if (!hasSameAttributes(aLast.attributes, bLast.attributes)) return false;
  }

  return true;
}

export function isSameMentionDocument(
  a: MentionDocument | null,
  b: MentionDocument | null,
): boolean {
  if (a === b) return true;

  if (!a || !b) return false;

  if (a.bodyText !== b.bodyText) return false;

  const mentionCount = a.mentions.length;

  if (mentionCount !== b.mentions.length) return false;

  if (mentionCount === 0) return true;
  if (!hasSameBoundaryMentions(a, b, mentionCount)) return false;

  return a.mentions.every((leftMention, i) => {
    const rightMention = b.mentions[i];

    return rightMention != null && isSameMention(leftMention, rightMention);
  });
}

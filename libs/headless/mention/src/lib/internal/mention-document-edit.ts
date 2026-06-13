import type {
  MentionDocument,
  MentionEntity,
  MentionEntityPredicate,
  MentionEntityTarget,
  MentionLinearRange,
} from '../types/mention-types';

function isPredicate(target: MentionEntityTarget): target is MentionEntityPredicate {
  return typeof target === 'function';
}

export function findMentionEntity(
  document: MentionDocument,
  target: MentionEntityTarget,
): MentionEntity | null {
  const mentions = document.mentions;

  for (let i = 0; i < mentions.length; i += 1) {
    const mention = mentions[i];

    if (isPredicate(target) ? target(mention, i) : mention.id === target) {
      return mention;
    }
  }

  return null;
}

export function findMentionEntityForUpsert(params: {
  readonly document: MentionDocument;
  readonly mentionId?: string;
  readonly matchBy?: MentionEntityPredicate;
}): MentionEntity | null {
  const { document, mentionId, matchBy } = params;

  if (mentionId) {
    const byId = findMentionEntity(document, mentionId);
    if (byId) return byId;
  }

  if (matchBy) return findMentionEntity(document, matchBy);

  return null;
}

export function toMentionLinearRange(mention: MentionEntity): MentionLinearRange {
  return { start: mention.start, end: mention.end };
}

import type {
  MentionDocument,
  MentionEntity,
  MentionEntityPredicate,
  MentionEntityTarget,
  MentionLinearRange,
} from '../types/mention-types';

function isPredicate<D>(target: MentionEntityTarget<D>): target is MentionEntityPredicate<D> {
  return typeof target === 'function';
}

export function findMentionEntity<D>(
  document: MentionDocument<D>,
  target: MentionEntityTarget<D>,
): MentionEntity<D> | null {
  const mentions = document.mentions;

  for (let i = 0; i < mentions.length; i += 1) {
    const mention = mentions[i];

    if (isPredicate(target) ? target(mention, i) : mention.id === target) {
      return mention;
    }
  }

  return null;
}

export function findMentionEntityForUpsert<D>(params: {
  readonly document: MentionDocument<D>;
  readonly mentionId?: string;
  readonly matchBy?: MentionEntityPredicate<D>;
}): MentionEntity<D> | null {
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

import type { MentionTextSurfaceAdapter } from '../adapters/mention-surface';
import type {
  MentionInsertion,
  MentionSelectEvent,
  MentionSession,
  MentionTriggerConfig,
} from '../types/mention-types';

import { mergeMentionAttributeRecords, readClassFromAttrMap } from './mention-attr-map';

function resolveCaretOffset(insertion: MentionInsertion): number {
  if (insertion.caretPlacement === 'end') return insertion.replacementText.length;

  return insertion.caretPlacement ?? insertion.replacementText.length;
}

function mergeMentionClassTokens(...sources: Array<string | undefined>): string | undefined {
  const parts: string[] = [];

  for (const s of sources) {
    if (s) parts.push(s);
  }

  const merged = parts.join(' ').trim();

  return merged || undefined;
}

/**
 * Builds a normalized insertion payload for mention chip replacement.
 * Shared by controller-driven select and directive programmatic insertion.
 */
export function buildMentionInsertion<T>(
  config: MentionTriggerConfig<T>,
  item: T,
  session: MentionSession<T>,
): { insertion: MentionInsertion; caretOffset: number } {
  const base = config.insertWith?.(item, session) ?? {
    replacementText: config.displayWith(item),
    caretPlacement: 'end',
  };

  const shouldAppendTrailingSpace =
    base.replacementText.length > 0 && !/\s$/.test(base.replacementText);
  const trailingSpace = shouldAppendTrailingSpace ? ' ' : '';
  const replacementText = base.replacementText + trailingSpace;

  const mentionAttrs = config.getMentionAttributes?.(item);
  const classFromConfig = config.getMentionClass?.(item)?.trim();
  const classFromAttrs = readClassFromAttrMap(mentionAttrs);
  const classFromInsertion = readClassFromAttrMap(base.mentionAttributes);
  const mergedClass = mergeMentionClassTokens(classFromConfig, classFromAttrs, classFromInsertion);

  const mergedMentionAttributes = mergeMentionAttributeRecords(
    mentionAttrs,
    base.mentionAttributes,
    mergedClass,
  );
  const fallbackMentionLabel = base.replacementText.trim();

  const insertion: MentionInsertion = {
    replacementText,
    caretPlacement: base.caretPlacement === 'end' ? 'end' : (base.caretPlacement as number),
    mentionId: base.mentionId ?? mentionAttrs?.['data-mention-id'],
    mentionLabel: base.mentionLabel ?? mentionAttrs?.['data-mention-label'] ?? fallbackMentionLabel,
    mentionAttributes: mergedMentionAttributes,
  };

  const caretOffset = resolveCaretOffset(insertion);

  return { insertion, caretOffset };
}

/**
 * Inserts the built mention at `session.match` range, optionally closes the panel first,
 * then emits selection and `afterInsert`. Caller must run `beforeInsert` (and handle `false`) first.
 */
export function applyMentionInsertion<T>(params: {
  readonly adapter: MentionTextSurfaceAdapter;
  readonly config: MentionTriggerConfig<T>;
  readonly item: T;
  readonly session: MentionSession<T>;
  readonly chipClass?: string;
  readonly closePanel: () => void;
  readonly emitSelect: (payload: MentionSelectEvent<T>) => void;
}): void {
  const { adapter, config, item, session, chipClass, closePanel, emitSelect } = params;
  const { insertion, caretOffset } = buildMentionInsertion(config, item, session);

  if (config.closeOnSelect !== false) closePanel();

  adapter.replaceTextRange(
    session.match.rangeStart,
    session.match.rangeEnd,
    insertion,
    caretOffset,
    chipClass,
  );

  emitSelect({ item, trigger: config.trigger });
  config.afterInsert?.(item, session);
}

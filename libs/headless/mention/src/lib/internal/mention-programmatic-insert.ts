import type { MentionTextSurfaceAdapter } from '../adapters/mention-surface';
import type { MentionInsertOptions, MentionTriggerConfig } from '../types/mention-types';

function clampToValueLength(value: number, valueLength: number): number {
  return Math.max(0, Math.min(valueLength, value));
}

function toSortedRange(start: number, end: number): { rangeStart: number; rangeEnd: number } {
  return { rangeStart: Math.min(start, end), rangeEnd: Math.max(start, end) };
}

export function normalizeInsertMentionOptions(
  triggerOrOptions?: string | MentionInsertOptions,
): MentionInsertOptions {
  if (typeof triggerOrOptions === 'string') {
    return { trigger: triggerOrOptions, at: 'selection' };
  }

  return { at: 'selection', ...(triggerOrOptions ?? {}) };
}

/**
 * Maps trigger string → config. Duplicate triggers: first entry in `configs` wins
 * (same as {@link resolveTriggerConfig} with an explicit trigger).
 */
export function buildTriggerConfigLookup<T>(
  configs: readonly MentionTriggerConfig<T>[],
): ReadonlyMap<string, MentionTriggerConfig<T>> {
  const m = new Map<string, MentionTriggerConfig<T>>();

  for (const c of configs) {
    if (!m.has(c.trigger)) {
      m.set(c.trigger, c);
    }
  }

  return m;
}

export function resolveTriggerConfig<T>(
  configs: readonly MentionTriggerConfig<T>[],
  trigger?: string,
): MentionTriggerConfig<T> | undefined {
  if (trigger != null) {
    for (const c of configs) {
      if (c.trigger === trigger) return c;
    }

    return undefined;
  }

  return configs.length === 1 ? configs[0] : undefined;
}

export function resolveProgrammaticRange(
  adapter: Pick<MentionTextSurfaceAdapter, 'getValue' | 'getSelectionRange'>,
  at: MentionInsertOptions['at'] = 'selection',
): { rangeStart: number; rangeEnd: number } {
  const valueLength = adapter.getValue().length;

  if (at === 'start') return { rangeStart: 0, rangeEnd: 0 };

  if (at === 'end') return { rangeStart: valueLength, rangeEnd: valueLength };

  if (typeof at === 'object' && at != null) {
    const start = clampToValueLength(at.start, valueLength);
    const end = clampToValueLength(at.end ?? at.start, valueLength);

    return toSortedRange(start, end);
  }

  const selectionRange = adapter.getSelectionRange();

  if (selectionRange != null) {
    return toSortedRange(selectionRange.start, selectionRange.end);
  }

  // Allow programmatic insertion without prior focus/selection: append at document end.
  return { rangeStart: valueLength, rangeEnd: valueLength };
}

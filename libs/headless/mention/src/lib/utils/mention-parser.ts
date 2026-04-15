/**
 * Pure mention parser: given text and caret offset, returns MentionMatch or null.
 * No DOM; single-character trigger in v1; configurable boundary and invalidation.
 */

import type { MentionMatch, MentionTriggerConfig } from '../types/mention-types';

/** Half-open [start, end) ranges in `fullText` that are locked mention content (serialized chips). */
export type MentionLockedTextRange = { readonly start: number; readonly end: number };

function isOffsetInsideLockedRange(
  offset: number,
  lockedRanges: readonly MentionLockedTextRange[],
): boolean {
  for (const r of lockedRanges) {
    if (offset >= r.start && offset < r.end) return true;
  }

  return false;
}

/** Default: character is a word boundary (space, start, or punctuation). */
function hasLeadingBoundary(textBeforeTrigger: string): boolean {
  if (textBeforeTrigger.length === 0) return true;

  const last = textBeforeTrigger[textBeforeTrigger.length - 1];

  return /\s/.test(last) || /[^\w\u00C0-\u024F]/.test(last);
}

function isQueryValidForConfig(query: string, config: MentionTriggerConfig<unknown>): boolean {
  const allowsSpaces = config.allowSpacesInQuery === true;

  if (!allowsSpaces && /\s/.test(query)) return false;

  if (allowsSpaces) {
    const hasDoubleSpace = /  /.test(query);
    const hasNewline = /\n/.test(query);

    if (hasDoubleSpace || hasNewline) return false;
  }

  const maxQueryLength = config.maxQueryLength;
  const hasMaxLength = maxQueryLength != null && maxQueryLength >= 0;

  if (hasMaxLength && query.length > maxQueryLength) return false;

  return true;
}

function isEligibleTriggerIndex(
  triggerIndex: number,
  lockedMentionTextRanges?: readonly MentionLockedTextRange[],
): boolean {
  if (triggerIndex === -1) return false;

  const hasLockedRanges = !!lockedMentionTextRanges && lockedMentionTextRanges.length > 0;

  if (!hasLockedRanges) return true;

  return !isOffsetInsideLockedRange(triggerIndex, lockedMentionTextRanges);
}

function buildMentionMatch(
  trigger: string,
  query: string,
  rangeStart: number,
  rangeEnd: number,
): MentionMatch {
  return { trigger, query, rangeStart, rangeEnd };
}

/**
 * Find the active mention match at the given caret offset.
 * v1: single-character triggers only.
 * Returns null if selection would be non-collapsed (caller must pass collapsed selection).
 */
export function parseMentionMatch(
  fullText: string,
  caretOffset: number,
  triggerConfigs: readonly MentionTriggerConfig<unknown>[],
  /** Triggers inside these ranges (e.g. `@` inside a completed mention chip) are ignored. */
  lockedMentionTextRanges?: readonly MentionLockedTextRange[],
): MentionMatch | null {
  if (caretOffset < 0 || caretOffset > fullText.length) return null;

  const textBeforeCaret = fullText.slice(0, caretOffset);

  let best: MentionMatch | null = null;
  let bestRangeStart = -1;

  for (const config of triggerConfigs) {
    const trigger = config.trigger;
    const isSingleCharacterTrigger = trigger.length === 1;

    if (!isSingleCharacterTrigger) continue;

    const triggerIndex = textBeforeCaret.lastIndexOf(trigger);

    if (!isEligibleTriggerIndex(triggerIndex, lockedMentionTextRanges)) continue;

    const rangeStart = triggerIndex;
    const rangeEnd = caretOffset;
    const query = textBeforeCaret.slice(triggerIndex + 1);

    if (config.requireLeadingBoundary !== false) {
      const textBeforeTrigger = textBeforeCaret.slice(0, triggerIndex);

      if (!hasLeadingBoundary(textBeforeTrigger)) continue;
    }

    if (!isQueryValidForConfig(query, config)) continue;

    if (rangeStart > bestRangeStart) {
      bestRangeStart = rangeStart;
      best = buildMentionMatch(trigger, query, rangeStart, rangeEnd);
    }
  }

  return best;
}

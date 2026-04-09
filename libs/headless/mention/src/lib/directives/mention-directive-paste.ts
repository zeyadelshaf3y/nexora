import type { MentionPasteEvent } from '../types/mention-types';

export const MAX_SAFE_PASTE_TEXT_LENGTH = 200_000;

export function createMentionPasteEvent(event: ClipboardEvent): MentionPasteEvent {
  const plainText = event.clipboardData?.getData('text/plain') ?? '';
  const htmlText = event.clipboardData?.getData('text/html') || null;

  return {
    plainText,
    htmlText,
    transformedText: undefined,
    preventDefault: false,
  };
}

export function getSafeTextToInsert(pasteEvent: MentionPasteEvent): {
  text: string;
  wasClamped: boolean;
} {
  const textToInsert = pasteEvent.transformedText ?? pasteEvent.plainText;
  if (textToInsert.length === 0) {
    return { text: '', wasClamped: false };
  }

  const safeText = textToInsert.slice(0, MAX_SAFE_PASTE_TEXT_LENGTH);

  return { text: safeText, wasClamped: safeText.length < textToInsert.length };
}

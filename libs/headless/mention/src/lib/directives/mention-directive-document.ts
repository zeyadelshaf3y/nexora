import type { MentionTextSurfaceAdapter } from '../adapters/mention-surface';
import type { MentionDocumentState } from '../internal/mention-document-state';
import type { MentionDocument } from '../types/mention-types';

export function applyBaseChipClassToElements(params: {
  chipElements: readonly HTMLElement[];
  chipClass: string | undefined;
}): void {
  const trimmedChipClass = params.chipClass?.trim();
  if (!trimmedChipClass) return;

  const raw = trimmedChipClass.split(/\s+/);
  const classTokens: string[] = [];

  for (const t of raw) {
    if (t) classTokens.push(t);
  }

  if (classTokens.length === 0) return;

  for (const chipElement of params.chipElements) {
    chipElement.classList.add(...classTokens);
  }
}

export function applyMentionDocumentWithSuppressedEmit(params: {
  adapter: MentionTextSurfaceAdapter | null;
  documentState: MentionDocumentState;
  doc: MentionDocument;
  afterSetDocument: () => void;
}): void {
  const { adapter, documentState, doc, afterSetDocument } = params;
  if (!adapter) return;

  documentState.applyWithSuppressedEmit(() => {
    adapter.setDocument(doc);
    afterSetDocument();
  });
}

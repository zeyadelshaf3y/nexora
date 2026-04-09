import type {
  MentionSurfaceSnapshot,
  MentionTextSurfaceAdapter,
} from '../adapters/mention-surface';
import type { MentionDocument } from '../types/mention-types';

interface MentionDocumentStateSyncParams {
  readonly adapter: MentionTextSurfaceAdapter | null;
  readonly setContentValue: (value: string) => void;
  readonly setHostContentValue: (value: string) => void;
  readonly emitValueChange: (value: string) => void;
  readonly emitDocumentChange: (doc: MentionDocument) => void;
  readonly isSameDocument: (a: MentionDocument | null, b: MentionDocument | null) => boolean;
}

interface ApplyIncomingDocumentParams {
  readonly adapter: MentionTextSurfaceAdapter | null;
  readonly inputDoc: MentionDocument | null;
  readonly applyDocument: (doc: MentionDocument) => void;
}

/**
 * Owns mention directive document/value emission state.
 * Keeps duplicate-emit suppression and input-document tracking in one place.
 */
export class MentionDocumentState {
  private suppressDocumentEmit = false;
  private lastEmittedValue = '';
  private lastEmittedDocument: MentionDocument | null = null;
  private lastAppliedInputDocumentRef: MentionDocument | null = null;

  syncFromAdapter(params: MentionDocumentStateSyncParams): MentionSurfaceSnapshot | null {
    const {
      adapter,
      setContentValue,
      setHostContentValue,
      emitValueChange,
      emitDocumentChange,
      isSameDocument,
    } = params;
    const snapshot = adapter?.getSnapshot?.();
    const currentValue = snapshot?.value ?? adapter?.getValue() ?? '';

    setContentValue(currentValue);
    setHostContentValue(currentValue);

    if (currentValue !== this.lastEmittedValue) {
      this.lastEmittedValue = currentValue;
      emitValueChange(currentValue);
    }

    if (!this.suppressDocumentEmit) {
      const currentDocument = snapshot?.document ?? adapter?.getDocument();

      if (currentDocument && !isSameDocument(currentDocument, this.lastEmittedDocument)) {
        this.lastEmittedDocument = currentDocument;
        emitDocumentChange(currentDocument);
      }
    }

    return snapshot ?? null;
  }

  applyIncomingDocument(params: ApplyIncomingDocumentParams): void {
    const { adapter, inputDoc, applyDocument } = params;

    if (!inputDoc) {
      this.lastAppliedInputDocumentRef = null;

      return;
    }

    if (!adapter) return;
    if (inputDoc === this.lastAppliedInputDocumentRef) return;

    this.lastAppliedInputDocumentRef = inputDoc;
    this.applyWithSuppressedEmit(() => applyDocument(inputDoc));
  }

  applyWithSuppressedEmit(run: () => void): void {
    this.suppressDocumentEmit = true;
    try {
      run();
    } finally {
      this.suppressDocumentEmit = false;
    }
  }

  resetForDestroyedAdapter(): void {
    this.lastAppliedInputDocumentRef = null;
  }
}

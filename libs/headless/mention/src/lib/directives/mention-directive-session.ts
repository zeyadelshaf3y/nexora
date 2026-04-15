import type {
  MentionSurfaceSnapshot,
  MentionTextSurfaceAdapter,
} from '../adapters/mention-surface';
import type { MentionDocumentState } from '../internal/mention-document-state';
import type { MentionDocument } from '../types/mention-types';

import type { MentionSessionCheckScheduler } from './mention-session-check-scheduler';

export function scheduleMentionSessionCheck(params: {
  snapshot?: MentionSurfaceSnapshot;
  /** When true (default on the directive), session checks are coalesced to one per input burst (microtask). */
  coalesce: boolean;
  sessionScheduler: MentionSessionCheckScheduler<MentionSurfaceSnapshot> | null;
  runSessionCheck: (snapshot?: MentionSurfaceSnapshot) => void;
}): void {
  const { sessionScheduler, snapshot, runSessionCheck, coalesce } = params;

  if (!sessionScheduler) {
    if (!coalesce) runSessionCheck(snapshot);

    return;
  }

  sessionScheduler.schedule(!!coalesce, snapshot);
}

export function syncContentValueFromAdapter(params: {
  documentState: MentionDocumentState;
  adapter: MentionTextSurfaceAdapter | null;
  setContentValue: (value: string) => void;
  setHostContentValue: (value: string) => void;
  emitValueChange: (value: string) => void;
  emitDocumentChange: (doc: MentionDocument) => void;
  isSameDocument: (a: MentionDocument | null, b: MentionDocument | null) => boolean;
}): MentionSurfaceSnapshot | null {
  return params.documentState.syncFromAdapter({
    adapter: params.adapter,
    setContentValue: params.setContentValue,
    setHostContentValue: params.setHostContentValue,
    emitValueChange: params.emitValueChange,
    emitDocumentChange: params.emitDocumentChange,
    isSameDocument: params.isSameDocument,
  });
}

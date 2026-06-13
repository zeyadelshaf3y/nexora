/**
 * Repairs the leading empty line a native undo/redo of a "clear" leaves behind.
 *
 * Our structural normalization mutates the DOM directly on `input`, which the browser's native
 * undo history does not track. Undoing a clear therefore re-inserts the restored content beneath
 * a spurious empty placeholder line. This tracker remembers the value across input events so a
 * subsequent `historyUndo`/`historyRedo` that restores into a previously-empty editor can be
 * reconciled — strictly gated so normal edits and intentional blank leading lines are untouched.
 */
import type { MentionTextSurfaceAdapter } from '../mention-surface';

import { reconcileLeadingEmptyLineArtifact } from './contenteditable-line-model';

export interface UndoClearArtifactReconciler {
  /** Run after structural normalization and before propagating the input downstream. */
  reconcile(event: Event | undefined): void;
  /** Record the post-input value so the next undo/redo can be reconciled. */
  record(): void;
}

export function createUndoClearArtifactReconciler(params: {
  root: HTMLElement;
  adapter: MentionTextSurfaceAdapter;
  invalidateSnapshotCache: () => void;
}): UndoClearArtifactReconciler {
  const { root, adapter, invalidateSnapshotCache } = params;

  // Reconciliation removes nodes between reads, so it needs a fresh (cache-invalidating) value.
  const readFreshValue = (): string => {
    invalidateSnapshotCache();

    return adapter.getValue();
  };

  const initialValue = adapter.getValue();
  let previousValueWasEmpty = initialValue.length === 0;
  let lastNonEmptyValue: string | null = initialValue.length > 0 ? initialValue : null;

  return {
    reconcile(event: Event | undefined): void {
      const inputType = event instanceof InputEvent ? event.inputType : '';
      const isHistoryEdit = inputType === 'historyUndo' || inputType === 'historyRedo';

      if (!isHistoryEdit || !previousValueWasEmpty || lastNonEmptyValue == null) return;

      reconcileLeadingEmptyLineArtifact(root, lastNonEmptyValue, readFreshValue);
    },

    record(): void {
      // The cache already reflects the current DOM for this input turn; avoid bumping the
      // snapshot version (the session-check staleness guard relies on it).
      const value = adapter.getValue();

      previousValueWasEmpty = value.length === 0;
      if (value.length > 0) lastNonEmptyValue = value;
    },
  };
}

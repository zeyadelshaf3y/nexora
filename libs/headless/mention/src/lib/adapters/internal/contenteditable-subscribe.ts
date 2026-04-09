/**
 * Surface event wiring for contenteditable adapter:
 * registers editor/document listeners and returns single unsubscribe cleanup.
 */
import { type NgZone } from '@angular/core';
import { listen } from '@nexora-ui/core';

import type { MentionSurfaceCallbacks, MentionTextSurfaceAdapter } from '../mention-surface';

import {
  ensureRootLineModel,
  normalizeStructuralBrIntoLineRows,
} from './contenteditable-line-model';

export function subscribeEditorSurface(params: {
  root: HTMLElement;
  ngZone: NgZone;
  adapter: MentionTextSurfaceAdapter;
  callbacks: MentionSurfaceCallbacks;
  invalidateSnapshotCache: () => void;
  normalizeEditorTextSpacing: (root: HTMLElement) => void;
  getSelectStartSuppressed: () => boolean;
}): () => void {
  const {
    root,
    ngZone,
    adapter,
    callbacks,
    invalidateSnapshotCache,
    normalizeEditorTextSpacing,
    getSelectStartSuppressed,
  } = params;

  const ownerDoc = root.ownerDocument;
  if (ownerDoc) {
    ngZone.runOutsideAngular(() => {
      ensureRootLineModel(root, ownerDoc);
    });
  }

  const cleanups: Array<() => void> = [];
  let backspaceHandledInThisTurn = false;

  const addRootListener = (
    event: string,
    handler: (event?: Event) => void,
    options?: boolean | AddEventListenerOptions,
  ): void => {
    const off = listen(root, event, handler, options);
    cleanups.push(off);
  };

  const suppressEvent = (event: Event): void => {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  };

  addRootListener(
    'beforeinput',
    (event) => {
      if (!event) return;
      if (event.defaultPrevented) return;
      if (!(event instanceof InputEvent)) return;
      if (event.inputType !== 'deleteContentBackward') return;

      ngZone.runOutsideAngular(() => {
        if (adapter.removeMentionBeforeCaret?.()) {
          backspaceHandledInThisTurn = true;
          suppressEvent(event);
          queueMicrotask(() => {
            backspaceHandledInThisTurn = false;
          });
        }
      });
    },
    { capture: true },
  );

  addRootListener(
    'keydown',
    (event) => {
      if (!event) return;
      if (event.defaultPrevented) return;
      if (backspaceHandledInThisTurn) return;
      if (!(event instanceof KeyboardEvent) || event.key !== 'Backspace') return;
      ngZone.runOutsideAngular(() => {
        if (adapter.removeMentionBeforeCaret?.()) {
          suppressEvent(event);
        }
      });
    },
    { capture: true },
  );

  addRootListener(
    'selectstart',
    (event) => {
      if (!event || !getSelectStartSuppressed()) return;
      if (!root.contains(event.target as Node)) return;
      event.preventDefault();
      event.stopPropagation();
    },
    { capture: true },
  );

  if (callbacks.input) {
    addRootListener('input', () => {
      invalidateSnapshotCache();
      normalizeEditorTextSpacing(root);
      callbacks.input?.();
    });
  }

  if (callbacks.keydown) {
    addRootListener('keydown', (event) => {
      if (event instanceof KeyboardEvent && event.key.startsWith('Arrow')) {
        ngZone.runOutsideAngular(() => {
          normalizeStructuralBrIntoLineRows(root);
        });
      }
      (callbacks.keydown as (ev?: Event) => void)(event);
    });
  }

  if (callbacks.click) addRootListener('click', callbacks.click);
  if (callbacks.scroll) addRootListener('scroll', callbacks.scroll);
  if (callbacks.focus) addRootListener('focus', callbacks.focus);
  if (callbacks.blur) addRootListener('blur', callbacks.blur);
  if (callbacks.compositionstart) addRootListener('compositionstart', callbacks.compositionstart);
  if (callbacks.compositionend) addRootListener('compositionend', callbacks.compositionend);
  if (callbacks.paste) {
    addRootListener('paste', (event) => {
      if (event instanceof ClipboardEvent) {
        (callbacks.paste as (ev: ClipboardEvent) => void)(event);
      }
    });
  }

  const doc = root.ownerDocument;
  if (doc && callbacks.selectionchange) {
    const off = listen(doc, 'selectionchange', () => {
      if (root.contains(doc.activeElement)) callbacks.selectionchange?.();
    });

    cleanups.push(off);
  }

  return () => {
    for (const off of cleanups) {
      off();
    }
  };
}

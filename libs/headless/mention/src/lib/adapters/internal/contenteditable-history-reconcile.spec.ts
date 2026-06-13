import { describe, expect, it } from 'vitest';

import type { MentionTextSurfaceAdapter } from '../mention-surface';

import { createUndoClearArtifactReconciler } from './contenteditable-history-reconcile';

function createEditableRoot(innerHTML: string): HTMLElement {
  const root = document.createElement('div');
  root.setAttribute('contenteditable', 'true');
  root.innerHTML = innerHTML;
  document.body.appendChild(root);

  return root;
}

/** Linearize line-block rows into the adapter's `bodyText` form (rows joined by "\n"). */
function readBodyText(root: HTMLElement): string {
  return Array.from(root.children)
    .map((line) => (line.textContent ?? '').replace(/\u00A0/g, ' '))
    .join('\n');
}

/** Minimal adapter stub whose `getValue` mirrors the live DOM. */
function createAdapterStub(root: HTMLElement): MentionTextSurfaceAdapter {
  return { getValue: () => readBodyText(root) } as unknown as MentionTextSurfaceAdapter;
}

function inputEvent(inputType: string): InputEvent {
  return new InputEvent('input', { inputType });
}

describe('createUndoClearArtifactReconciler', () => {
  it('strips the spurious leading empty line when undo restores a cleared editor', () => {
    const root = createEditableRoot('<div>hello</div>');
    const reconciler = createUndoClearArtifactReconciler({
      root,
      adapter: createAdapterStub(root),
      invalidateSnapshotCache: () => undefined,
    });

    // Typed "hello".
    reconciler.record();

    // Cleared (editor now empty).
    root.innerHTML = '<div><br></div>';
    reconciler.record();

    // Native undo re-inserts content beneath a spurious empty placeholder line.
    root.innerHTML = '<div><br></div><div>hello</div>';
    reconciler.reconcile(inputEvent('historyUndo'));

    expect(root.innerHTML).toBe('<div>hello</div>');
    expect(readBodyText(root)).toBe('hello');

    root.remove();
  });

  it('ignores non-history edits that happen to start with an empty line', () => {
    const root = createEditableRoot('<div>hello</div>');
    const reconciler = createUndoClearArtifactReconciler({
      root,
      adapter: createAdapterStub(root),
      invalidateSnapshotCache: () => undefined,
    });

    reconciler.record();
    root.innerHTML = '<div><br></div>';
    reconciler.record();

    root.innerHTML = '<div><br></div><div>hello</div>';
    reconciler.reconcile(inputEvent('insertText'));

    expect(root.children.length).toBe(2);

    root.remove();
  });

  it('does not reconcile when the editor was not empty before the undo', () => {
    const root = createEditableRoot('<div>hello</div>');
    const reconciler = createUndoClearArtifactReconciler({
      root,
      adapter: createAdapterStub(root),
      invalidateSnapshotCache: () => undefined,
    });

    // Editor stays non-empty (no clear step).
    reconciler.record();

    root.innerHTML = '<div><br></div><div>hello</div>';
    reconciler.reconcile(inputEvent('historyUndo'));

    expect(root.children.length).toBe(2);

    root.remove();
  });
});

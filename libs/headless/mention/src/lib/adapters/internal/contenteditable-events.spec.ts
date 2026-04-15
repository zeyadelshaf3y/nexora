import { describe, expect, it, vi } from 'vitest';

import { emitEditorInputEvent, getSelectionInRoot } from './contenteditable-events';

describe('contenteditable-events', () => {
  it('emitEditorInputEvent dispatches bubbling input event', () => {
    const root = document.createElement('div');
    const listener = vi.fn<(event: Event) => void>();

    root.addEventListener('input', listener);
    emitEditorInputEvent(root);

    expect(listener).toHaveBeenCalledTimes(1);
    const event = listener.mock.calls[0]?.[0];
    expect(event).toBeInstanceOf(Event);
    expect(event?.type).toBe('input');
    expect(event?.bubbles).toBe(true);
  });

  it('getSelectionInRoot returns null when selection is outside root', () => {
    const root = document.createElement('div');
    const outside = document.createElement('div');

    root.contentEditable = 'true';
    outside.contentEditable = 'true';
    root.textContent = 'inside';
    outside.textContent = 'outside';

    document.body.append(root, outside);

    const selection = document.getSelection();
    expect(selection).toBeTruthy();
    selection?.removeAllRanges();

    const range = document.createRange();
    range.setStart(outside.firstChild as Text, 0);
    range.collapse(true);
    selection?.addRange(range);

    expect(getSelectionInRoot(root)).toBeNull();
  });

  it('getSelectionInRoot returns current selection when anchored in root', () => {
    const root = document.createElement('div');
    root.contentEditable = 'true';
    root.textContent = 'inside';
    document.body.append(root);

    const selection = document.getSelection();
    expect(selection).toBeTruthy();
    selection?.removeAllRanges();

    const range = document.createRange();
    range.setStart(root.firstChild as Text, 0);
    range.collapse(true);
    selection?.addRange(range);

    expect(getSelectionInRoot(root)).toBe(selection);
  });
});

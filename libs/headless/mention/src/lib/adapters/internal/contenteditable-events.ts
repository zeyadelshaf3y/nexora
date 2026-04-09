/**
 * Shared contenteditable event helpers used by mention adapter internals.
 */

export function emitEditorInputEvent(root: HTMLElement): void {
  root.dispatchEvent(new Event('input', { bubbles: true }));
}

/** Returns live selection only when anchored inside the editor root. */
export function getSelectionInRoot(root: HTMLElement): Selection | null {
  const selection = root.ownerDocument?.getSelection();

  if (!selection || selection.rangeCount === 0) return null;
  if (!root.contains(selection.anchorNode)) return null;

  return selection;
}

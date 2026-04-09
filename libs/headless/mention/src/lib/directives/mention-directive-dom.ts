export function getChipElementByMentionId(
  editableRoot: HTMLElement | null | undefined,
  mentionId: string,
): HTMLElement | null {
  if (!editableRoot) return null;

  return editableRoot.querySelector<HTMLElement>(`[data-mention-id="${CSS.escape(mentionId)}"]`);
}

export function getChipElements(editableRoot: HTMLElement | null | undefined): HTMLElement[] {
  if (!editableRoot) return [];

  const nodes = editableRoot.querySelectorAll<HTMLElement>('[data-mention-id]');

  return Array.from(nodes);
}

export function normalizeEditorClassInput(editorClass: string | string[] | undefined): string {
  if (editorClass == null) return '';
  if (Array.isArray(editorClass)) return editorClass.join(' ');

  return editorClass;
}

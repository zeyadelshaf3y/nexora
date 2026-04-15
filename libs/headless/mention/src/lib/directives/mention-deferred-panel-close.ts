import { isElementWithinMentionSuggestionUi } from '../utils/mention-panel-dom';

/** Deferred blur close so `mousedown` / `touchstart` on the suggestion panel can run before the editor loses focus. */
export function scheduleMentionPanelCloseAfterEditorBlur(params: {
  readonly closeOnBlur: boolean;
  readonly editable: HTMLElement;
  readonly isPanelOpen: () => boolean;
  readonly closePanel: () => void;
  readonly overlayPaneClass: string;
}): void {
  const { closeOnBlur, editable, isPanelOpen, closePanel, overlayPaneClass } = params;

  if (!closeOnBlur) return;

  queueMicrotask(() => {
    requestAnimationFrame(() => {
      if (!isPanelOpen()) return;

      const activeElement = editable.ownerDocument.activeElement;
      const isEditorFocused =
        !!activeElement && (editable === activeElement || editable.contains(activeElement));

      if (isEditorFocused) return;
      if (isElementWithinMentionSuggestionUi(activeElement, overlayPaneClass)) return;

      closePanel();
    });
  });
}

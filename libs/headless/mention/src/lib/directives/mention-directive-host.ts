import type { MentionEditorHostLifecycle } from '../internal/mention-editor-host-lifecycle';

export function setMentionEditorHostClass(
  hostLifecycle: MentionEditorHostLifecycle,
  editorExtraClass: string,
): void {
  hostLifecycle.setInput('editorExtraClass', editorExtraClass);
}

export function syncMentionEditorHostInputs(params: {
  hostLifecycle: MentionEditorHostLifecycle;
  ariaLabel: string;
  ariaControlsPanelId: string | undefined;
  ariaActiveDescendantId: string | undefined;
  panelOpen: boolean;
  disabled: boolean;
  editorExtraClass: string;
}): void {
  const {
    hostLifecycle,
    ariaLabel,
    ariaControlsPanelId,
    ariaActiveDescendantId,
    panelOpen,
    disabled,
    editorExtraClass,
  } = params;

  hostLifecycle.setInput('ariaLabel', ariaLabel);
  hostLifecycle.setInput('ariaControlsPanelId', ariaControlsPanelId);
  hostLifecycle.setInput('ariaActiveDescendantId', ariaActiveDescendantId);
  hostLifecycle.setInput('panelOpen', panelOpen);
  hostLifecycle.setInput('disabled', disabled);
  setMentionEditorHostClass(hostLifecycle, editorExtraClass);
}

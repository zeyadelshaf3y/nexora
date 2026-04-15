import type { MentionControllerImpl } from '../internal/mention-controller';
import type { CreateMentionControllerRuntimeParams } from '../internal/mention-controller-runtime';

import { scheduleMentionPanelCloseAfterEditorBlur } from './mention-deferred-panel-close';

export function createDirectiveRuntimeHandlers<T>(params: {
  isDisabled: () => boolean;
  getController: () => MentionControllerImpl<T> | null;
  onInput: () => void;
  onBlurEmit: () => void;
  onFocusEmit: () => void;
  setComposing: (value: boolean) => void;
  onPaste: (event: ClipboardEvent) => void;
  getEditable: () => HTMLElement | null;
  closeOnBlur: () => boolean;
  overlayPaneClass: string;
}): CreateMentionControllerRuntimeParams<T>['handlers'] {
  const getIsPanelOpen = (): boolean => params.getController()?.panelState().open ?? false;
  const closePanel = (): void => params.getController()?.close?.();

  const closePanelFromBlur = (): void => {
    const editable = params.getEditable();
    if (!editable) return;

    scheduleMentionPanelCloseAfterEditorBlur({
      closeOnBlur: params.closeOnBlur(),
      editable,
      isPanelOpen: getIsPanelOpen,
      closePanel,
      overlayPaneClass: params.overlayPaneClass,
    });
  };

  return {
    onInput: () => params.onInput(),
    onKeydown: (event) => {
      if (params.isDisabled()) return;
      params.getController()?.handleKeydown?.(event);
    },
    onBlur: () => {
      params.onBlurEmit();
      closePanelFromBlur();
    },
    onFocus: () => params.onFocusEmit(),
    onCompositionStart: () => params.setComposing(true),
    onCompositionEnd: () => {
      params.setComposing(false);
      params.onInput();
    },
    onScroll: () => params.getController()?.updateCaretPosition?.(),
    onSelectionChange: () => params.getController()?.updateCaretPosition?.(),
    onPaste: (event) => params.onPaste(event),
  };
}

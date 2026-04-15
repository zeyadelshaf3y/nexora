/**
 * Host/editor class hooks used by app-level styling.
 */
export const NXR_MENTION_EDITOR_WRAPPER_CLASS = 'nxr-mention-editor-wrapper';
export const NXR_MENTION_EDITOR_CLASS = 'nxr-mention-editor';

export const NXR_MENTION_DISABLED_CLASS = 'nxr-mention-editor--disabled';

/**
 * Tag name for the internal panel wrapper.
 * Used with `Element.closest()` for blur deferral.
 */
export const NXR_MENTION_PANEL_HOST_SELECTOR = 'nxr-mention-panel-host';

/** Default panel offset in px from caret/anchor. */
export const NXR_MENTION_DEFAULT_PANEL_OFFSET = 8;

/** Default editor aria-label used when consumer does not provide one. */
export const NXR_MENTION_DEFAULT_ARIA_LABEL = 'Mention';

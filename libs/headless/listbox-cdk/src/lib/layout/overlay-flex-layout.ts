/**
 * Flex column primitives for overlay-mounted virtual lists: pane max-height alone does not give
 * flex children a definite block size, so hosts and scroll regions share one utility class.
 */

export const NXR_LISTBOX_CDK_OVERLAY_FLEX_COLUMN_CLASS = 'nxr-listbox-cdk-overlay-flex-column';

export const LISTBOX_CDK_OVERLAY_FLEX_COLUMN_STYLES = `
  .${NXR_LISTBOX_CDK_OVERLAY_FLEX_COLUMN_CLASS} {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-height: 0;
    min-width: 0;
  }
`;

export const BUILTIN_VIRTUAL_PANEL_SHELL_LAYOUT_STYLES = `
  ${LISTBOX_CDK_OVERLAY_FLEX_COLUMN_STYLES}
  .nxr-builtin-virtual-shell {
    box-sizing: border-box;
    max-height: 100%;
  }
  .nxr-builtin-virtual-body {
    box-sizing: border-box;
    overflow: hidden;
  }
  .nxr-builtin-virtual-header,
  .nxr-builtin-virtual-footer {
    flex-shrink: 0;
  }
`;

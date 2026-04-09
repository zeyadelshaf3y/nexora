export const LISTBOX_CDK_VIRTUAL_PANEL_STYLES = `
  .nxr-listbox-cdk-virtual-panel--fill {
    overflow: hidden;
  }
  .nxr-listbox-cdk-viewport {
    display: block;
    width: 100%;
    box-sizing: border-box;
  }
  .nxr-listbox-cdk-viewport--fill {
    flex: 1 1 auto;
    min-height: 0;
    height: 100%;
    max-height: 100%;
  }
  .nxr-listbox-cdk-option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    cursor: default;
    box-sizing: border-box;
    transition: background 0.1s;
    color: var(--nxr-text, inherit);
  }
  .nxr-listbox-cdk-option:hover:not([aria-disabled='true']) {
    background: var(--nxr-bg-subtle, rgba(15, 23, 42, 0.04));
  }
  .nxr-listbox-cdk-option[data-active] {
    background: var(--nxr-primary-subtle, rgba(99, 102, 241, 0.08));
  }
  .nxr-listbox-cdk-option[aria-selected='true'] {
    font-weight: 600;
    color: var(--nxr-primary, #6366f1);
  }
  .nxr-listbox-cdk-option[aria-disabled='true'] {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .nxr-listbox-cdk-empty {
    padding: 0.75rem;
  }
`;

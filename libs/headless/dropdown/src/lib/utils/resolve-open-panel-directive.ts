/**
 * Resolves which panel directive to open: built-in virtual panel vs consumer-projected `*Panel` template.
 */

export function resolveOpenPanelDirective<Panel>(
  useBuiltInVirtualPanel: boolean,
  builtInVirtualPanel: Panel | null | undefined,
  contentProjectedPanel: Panel | null | undefined,
): Panel | undefined {
  return useBuiltInVirtualPanel
    ? (builtInVirtualPanel ?? undefined)
    : (contentProjectedPanel ?? undefined);
}

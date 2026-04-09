/**
 * Builds the overlay pane class list: one library base class plus optional user classes.
 * Used by select, combobox, and menu so `panelClass` merging stays consistent.
 */

export function mergeDropdownPaneClasses(
  basePaneClass: string,
  userPanelClass: string | string[] | undefined,
): string[] {
  // Match prior `userClass ? [userClass].flat()` behavior (falsy string omits user classes).
  if (userPanelClass == null || userPanelClass === '') {
    return [basePaneClass];
  }

  return Array.isArray(userPanelClass)
    ? [basePaneClass, ...userPanelClass]
    : [basePaneClass, userPanelClass];
}

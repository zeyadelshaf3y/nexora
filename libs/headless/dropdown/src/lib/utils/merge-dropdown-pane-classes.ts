/**
 * Builds the overlay pane class list: one library base class plus optional user classes.
 * Used by select, combobox, and menu so `panelClass` merging stays consistent.
 */

function mergeDropdownBaseAndUserClasses(
  baseClass: string,
  userClass: string | string[] | undefined,
): string[] {
  // Match prior `userClass ? [userClass].flat()` behavior (falsy string omits user classes).
  if (userClass == null || userClass === '') {
    return [baseClass];
  }

  return Array.isArray(userClass) ? [baseClass, ...userClass] : [baseClass, userClass];
}

export function mergeDropdownPaneClasses(
  basePaneClass: string,
  userPanelClass: string | string[] | undefined,
): string[] {
  return mergeDropdownBaseAndUserClasses(basePaneClass, userPanelClass);
}

/** Builds the overlay backdrop class list: one library base class plus optional user classes. */
export function mergeDropdownBackdropClasses(
  baseBackdropClass: string,
  userBackdropClass: string | string[] | undefined,
): string[] {
  return mergeDropdownBaseAndUserClasses(baseBackdropClass, userBackdropClass);
}

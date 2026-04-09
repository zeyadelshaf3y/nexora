/**
 * Keys that move the highlight or jump to Home/End.
 * Shared by listbox navigation and typeahead (buffer resets on these keys).
 */
export const LISTBOX_NAV_OR_HOME_END_KEYS: ReadonlySet<string> = new Set([
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
]);

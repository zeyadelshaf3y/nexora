/**
 * Reason an overlay was closed.
 * 'selection' is used when a dropdown closes because the user chose an option (e.g. select, combobox).
 */

export type CloseReason =
  | 'escape'
  | 'backdrop'
  | 'outside'
  | 'programmatic'
  | 'scroll'
  | 'selection';

/** Constants for close reasons. Use these instead of string literals to avoid typos and allow refactors. */
export const CLOSE_REASON_ESCAPE: CloseReason = 'escape';
export const CLOSE_REASON_BACKDROP: CloseReason = 'backdrop';
export const CLOSE_REASON_OUTSIDE: CloseReason = 'outside';
export const CLOSE_REASON_PROGRAMMATIC: CloseReason = 'programmatic';
export const CLOSE_REASON_SCROLL: CloseReason = 'scroll';
export const CLOSE_REASON_SELECTION: CloseReason = 'selection';

/**
 * Public types for the menu primitive.
 */

/** Payload when the user activates a menu item (Enter/click). */
export interface MenuOptionActivatedEvent<T = unknown> {
  readonly option: T;
}

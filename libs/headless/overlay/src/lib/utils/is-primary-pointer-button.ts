/**
 * True when the pointer event is a primary-button press (left click / tap).
 * Non-primary buttons (right, middle, back/forward) must not dismiss overlays.
 *
 * @internal
 */
export function isPrimaryPointerButton(event: PointerEvent): boolean {
  return event.button === 0;
}

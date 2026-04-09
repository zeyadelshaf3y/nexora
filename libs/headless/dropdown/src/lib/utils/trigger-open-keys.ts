/**
 * Handles open-on-key behavior for closed trigger/input elements.
 * Returns true when a key was handled and the caller should stop further processing.
 */
export function handleClosedTriggerOpenKey(
  event: KeyboardEvent,
  openKeys: ReadonlySet<string>,
  open: () => void,
): boolean {
  if (!openKeys.has(event.key)) return false;
  event.preventDefault();
  open();

  return true;
}

/**
 * Whether a pointerdown on the drawer pane should start a drag gesture.
 * Skips interactive descendants so buttons, links, and inputs keep working.
 */

const DRAG_INTERACTIVE_SELECTOR = [
  'button',
  'a[href]',
  'input',
  'textarea',
  'select',
  'option',
  'label',
  '[contenteditable="true"]',
  '[contenteditable=""]',
  '[role="button"]',
  '[role="link"]',
  '[role="textbox"]',
  '[role="combobox"]',
  '[role="listbox"]',
  '[role="menuitem"]',
  '[role="tab"]',
  '[role="slider"]',
  '[role="spinbutton"]',
  '[role="switch"]',
  '[role="checkbox"]',
  '[role="radio"]',
].join(',');

export function shouldInitiateDrawerDrag(event: PointerEvent): boolean {
  const target = event.target;

  if (!(target instanceof Element)) return true;

  if (target.closest('.nxr-drawer-drag-handle')) return true;

  return !target.closest(DRAG_INTERACTIVE_SELECTOR);
}

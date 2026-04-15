/**
 * Detects focus targets that behave as text fields so listbox keyboard rules can defer to them
 * (e.g. skip Home/End when focus is inside a combobox input).
 */

const TEXT_INPUT_TYPES: ReadonlySet<string> = new Set([
  'text',
  'search',
  'url',
  'tel',
  'email',
  'password',
  'number',
]);

/** True when `target` is a textarea or an input whose `type` is a text-like field. */
export function isTextInputEventTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;

  if (target instanceof HTMLTextAreaElement) return true;

  return target instanceof HTMLInputElement && TEXT_INPUT_TYPES.has(target.type);
}

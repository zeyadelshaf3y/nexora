/**
 * After a listbox is attached in an overlay, scroll the active option into view on the next
 * microtask so layout/virtual viewport geometry has settled (used by select/combobox).
 */

/** Minimal surface — implemented by {@link ListboxDirective}. */
export interface ListboxScrollActiveCapable {
  scrollActiveIntoView(): void;
}

export function scheduleListboxScrollActiveOnNextMicrotask(
  listbox: ListboxScrollActiveCapable,
): void {
  queueMicrotask(() => listbox.scrollActiveIntoView());
}

/**
 * Builds `onListboxReady` for portaled listbox hosts (select/combobox): stores the listbox ref
 * and scrolls the active option on the next microtask after layout settles.
 */
export function bindListboxReadyWithActiveScroll<T extends ListboxScrollActiveCapable>(
  setListboxRef: (listbox: T) => void,
): (listbox: T) => void {
  return (listbox) => {
    setListboxRef(listbox);
    scheduleListboxScrollActiveOnNextMicrotask(listbox);
  };
}

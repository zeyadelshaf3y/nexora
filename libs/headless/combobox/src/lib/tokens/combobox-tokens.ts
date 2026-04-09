/**
 * DI token and controller interface for combobox.
 * Minimal readonly-focused contract for directives and template ref API.
 */

import { InjectionToken, type Signal } from '@angular/core';

/** Controller exposed via exportAs and template ref. */
export interface ComboboxController {
  readonly isOpen: Signal<boolean>;
  readonly isDisabled: Signal<boolean>;
  readonly required: Signal<boolean>;
  readonly value: Signal<unknown>;
  /**
   * Current selection as an array. Multi mode: value as array; single mode: [value] or [].
   * Use this for rendering chips/tags or iterating selected items.
   */
  readonly selectedValues: Signal<readonly unknown[]>;
  readonly search: Signal<string>;
  readonly displayValue: Signal<string>;
  readonly hasValue: Signal<boolean>;
  readonly listboxId: Signal<string | null>;
  readonly activeOptionId: Signal<string | null>;
  readonly placeholder: Signal<string>;

  /** Built-in CDK virtual list enabled (`virtualScroll` + `virtualItems`). */
  readonly virtualScroll: Signal<boolean>;
  /** Empty-state string passed to the virtual panel when the list is empty. */
  readonly virtualEmptyMessage: Signal<string>;

  /** Whether the panel opens when the input receives focus. Default true. */
  openPanelOnFocus(): boolean;

  /**
   * Returns true when the next focus/click on the input should not open the panel
   * (e.g. after outside click or after clear button click). Clears the flag.
   */
  takeFocusRestore(): boolean;

  /** Call when clear button is clicked so the next input focus/click does not open the panel. */
  skipNextOpen(): void;

  open(): Promise<boolean>;
  close(reason?: unknown): void;
  toggle(): void;

  select(valueOrValues: unknown | readonly unknown[]): void;
  unselect(value: unknown): void;
  reset(defaultValue?: unknown): void;

  setSearchQuery(query: string, options?: { openPanel?: boolean }): void;
  clearSearchQuery(options?: { openPanel?: boolean }): void;

  /**
   * Leaves display/search state: single sets isEditing false (full list on next open);
   * multi clears inputValue. Call on blur when closed or from reset/clear.
   */
  syncSearchToValue(): void;

  /**
   * Programmatic disable (in addition to `[disabled]` and form disabled). Pair with {@link enable}.
   * If the panel is open, it closes with reason `programmatic` first.
   */
  disable(): void;
  enable(): void;
  focusInput(): void;
  markAsTouched(): void;
  isSelected(item: unknown): boolean;
  handleInputKeydown(event: KeyboardEvent): void;
}

export const NXR_COMBOBOX = new InjectionToken<ComboboxController>('NXR_COMBOBOX');

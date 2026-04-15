/**
 * Internal DI token and controller interface for parent–child communication.
 *
 * `SelectController` is the minimal, readonly-focused contract that
 * `SelectTriggerDirective` uses to read ARIA state and delegate events.
 * It intentionally does NOT expose overlay refs, listbox refs, CVA internals,
 * or any other implementation details of `SelectComponent`.
 */

import { InjectionToken, type Signal } from '@angular/core';

/** Readonly controller that the trigger directive and consumers use via template ref / viewChild. */
export interface SelectController {
  /** Whether the dropdown panel is currently open. */
  readonly isOpen: Signal<boolean>;

  /** Whether the select is disabled (input or form). */
  readonly isDisabled: Signal<boolean>;

  /** Whether the select is required (sets aria-required on trigger). */
  readonly required: Signal<boolean>;

  /** Internal listbox element ID when open; `null` when closed. */
  readonly listboxId: Signal<string | null>;

  /** Active (highlighted) option element ID when open; `null` otherwise. */
  readonly activeOptionId: Signal<string | null>;

  /** Display string for the trigger (placeholder when empty, else label(s) from accessors). */
  readonly displayValue: Signal<string>;

  /** Whether there is a current selection (single: value != null, multi: array length > 0). */
  readonly hasValue: Signal<boolean>;

  /**
   * Current selection as an array. Multi mode: value as array; single mode: [value] or [].
   * Use for rendering chips/tags or iterating selected items.
   */
  readonly selectedValues: Signal<readonly unknown[]>;

  /** Built-in CDK virtual list enabled (`virtualScroll` + `virtualItems`). */
  readonly virtualScroll: Signal<boolean>;
  /** Empty-state string passed to the virtual panel when the list is empty. */
  readonly virtualEmptyMessage: Signal<string>;

  /** Open the dropdown. Returns false if already open, disabled, or attach failed. */
  open(): Promise<boolean>;

  /** Close the dropdown. No-op when already closed. */
  close(): void;

  /** Toggle open/close. Disabled guard is inside the component. */
  toggle(): void;

  /**
   * Reset selection to empty (single: null, multi: []).
   * Updates the bound value/CVA and closes the panel if open.
   */
  reset(): void;

  /** Focus the trigger element. Use after reset() or when scrolling to the select. */
  focusTrigger(): void;

  /**
   * Programmatic disable (in addition to `[disabled]` and form disabled).
   * If the panel is open, it closes with reason `programmatic` first.
   */
  disable(): void;

  /** Re-enable after {@link disable}. */
  enable(): void;

  /** Whether the given option is currently selected. */
  isSelected(item: unknown): boolean;

  /** Handle a keydown event on the trigger element. */
  handleTriggerKeydown(event: KeyboardEvent): void;
}

/**
 * Token used by `SelectTriggerDirective` (and `SelectPanelDirective`) to
 * inject the parent `SelectComponent`.  Provided by `SelectComponent` via
 * `useExisting: forwardRef(() => SelectComponent)`.
 */
export const NXR_SELECT = new InjectionToken<SelectController>('NXR_SELECT');

/**
 * DI token and controller interface for parent–child communication.
 *
 * MenuController is the minimal contract that MenuTriggerDirective and
 * consumers (via template ref #menu="nxrMenu" or viewChild) use for
 * ARIA state and event delegation.
 */

import { InjectionToken, type Signal } from '@angular/core';

/** Readonly controller for the trigger directive and consumers via template ref / viewChild. */
export interface MenuController {
  readonly isOpen: Signal<boolean>;
  readonly isDisabled: Signal<boolean>;
  readonly listboxId: Signal<string | null>;
  readonly activeOptionId: Signal<string | null>;
  open(): Promise<boolean>;
  close(): void;
  toggle(): void;
  focusTrigger(): void;
  /**
   * Programmatic disable (in addition to `[disabled]`). Pair with {@link enable}.
   * If the panel is open, it closes with reason `programmatic` first.
   */
  disable(): void;
  /** Re-enable after {@link disable}. */
  enable(): void;
  handleTriggerKeydown(event: KeyboardEvent): void;
}

export const NXR_MENU = new InjectionToken<MenuController>('NXR_MENU');

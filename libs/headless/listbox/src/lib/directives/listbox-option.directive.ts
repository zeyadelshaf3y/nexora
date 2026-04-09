/**
 * Listbox option directive: registers with parent listbox, exposes ARIA state, handles click activation.
 */

import { computed, Directive, effect, ElementRef, inject, input } from '@angular/core';
import type { OnDestroy } from '@angular/core';

import { NXR_LISTBOX_CONTROLLER } from '../types';
import type { NxrListboxController } from '../types';

@Directive({
  selector: '[nxrListboxOption]',
  host: {
    '[attr.role]': 'role()',
    '[attr.id]': 'optionId()',
    '[attr.aria-selected]': 'ariaSelected()',
    '[attr.aria-disabled]': 'ariaDisabled()',
    '[attr.data-active]': 'dataActive()',
    '(mousedown)': 'onMousedown($event)',
    '(click)': 'onClick($event)',
  },
})
export class ListboxOptionDirective<T = unknown> implements OnDestroy {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly controller = inject(NXR_LISTBOX_CONTROLLER, {
    optional: true,
  }) as NxrListboxController<T> | null;

  readonly nxrListboxOption = input.required<T>();

  /** Tracks the item that was registered so unregistration is always correct. */
  private registeredItem: T | null = null;

  readonly role = computed(() => this.controller?.getRole() ?? null);

  readonly optionId = computed(() => this.controller?.getOptionId(this.nxrListboxOption()) ?? null);

  readonly ariaSelected = computed(() => {
    if (!this.controller || this.controller.getRole() === 'menuitem') {
      return null;
    }

    return this.controller.isSelected(this.nxrListboxOption());
  });

  readonly ariaDisabled = computed(() => {
    if (!this.controller) {
      return null;
    }

    return this.controller.isDisabled(this.nxrListboxOption()) || null;
  });

  readonly dataActive = computed(() => {
    if (!this.controller) {
      return null;
    }

    return this.controller.isActive(this.nxrListboxOption()) ? '' : null;
  });

  constructor() {
    effect(() => {
      const item = this.nxrListboxOption();
      if (!this.controller) return;

      if (this.registeredItem !== null && this.registeredItem !== item) {
        this.controller.unregisterOption(this.registeredItem);
      }
      if (this.registeredItem !== item) {
        this.controller.registerOption(item, this.elementRef.nativeElement);
      }
      this.registeredItem = item;
      this.controller.refreshOption(item);
    });
  }

  ngOnDestroy(): void {
    if (this.registeredItem != null && this.controller) {
      this.controller.unregisterOption(this.registeredItem);
      this.registeredItem = null;
    }
  }

  onMousedown(event: Event): void {
    const item = this.nxrListboxOption();
    this.runOptionInteraction(item, event, (ctrl) => ctrl.setActiveOption(item));
  }

  onClick(event: Event): void {
    const item = this.nxrListboxOption();
    this.runOptionInteraction(item, event, (ctrl) => ctrl.activateOption(item));
  }

  /** Runs the action only when controller is present and the option is not disabled. */
  private runOptionInteraction(
    item: T,
    event: Event,
    action: (controller: NxrListboxController<T>) => void,
  ): void {
    if (!this.controller) return;
    if (this.controller.isDisabled(item)) {
      event.preventDefault();

      return;
    }
    action(this.controller);
  }
}

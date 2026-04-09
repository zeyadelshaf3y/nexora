/**
 * Pure helpers for {@link PopoverTriggerDirective} — portal creation, scroll strategy, close policy, ARIA.
 */

import type { TemplateRef, Type, ViewContainerRef } from '@angular/core';
import {
  CloseOnScrollStrategy,
  ComponentPortal,
  isComponent,
  NoopScrollStrategy,
  RepositionScrollStrategy,
  TemplatePortal,
  type ClosePolicy,
  type Portal,
} from '@nexora-ui/overlay';

export function createPopoverContentPortal(
  content: TemplateRef<unknown> | Type<unknown>,
  vcr: ViewContainerRef,
): Portal {
  return isComponent(content)
    ? new ComponentPortal(content, vcr)
    : new TemplatePortal(content, vcr);
}

export function resolvePopoverScrollStrategy(
  closeOnScroll: boolean,
  scrollStrategy: 'noop' | 'reposition' | 'close',
): CloseOnScrollStrategy | RepositionScrollStrategy | NoopScrollStrategy {
  if (closeOnScroll) return new CloseOnScrollStrategy();
  if (scrollStrategy === 'reposition') return new RepositionScrollStrategy();
  if (scrollStrategy === 'close') return new CloseOnScrollStrategy();

  return new NoopScrollStrategy();
}

export function getPopoverDefaultClosePolicy(hasBackdrop: boolean): Partial<ClosePolicy> {
  return {
    outside: 'top',
    escape: 'top',
    backdrop: hasBackdrop ? 'self' : 'none',
  };
}

/** Maps pane `role` to `aria-haspopup` on the trigger (`true` for non-popup roles). */
export function resolvePopoverAriaHasPopup(role: string): string {
  switch (role) {
    case 'menu':
    case 'listbox':
    case 'tree':
    case 'grid':
    case 'dialog':
      return role;
    default:
      return 'true';
  }
}

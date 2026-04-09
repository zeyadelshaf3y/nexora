/**
 * Pure/small helpers for {@link TooltipTriggerDirective} — content portal, scroll strategy, close policy.
 *
 * Popover uses a parallel split (`popover-trigger-overlay-helpers`, `popover-trigger-anchored-params`,
 * `popover-trigger-user-actions`). Further deduplication with tooltip would mean shared overlay-level
 * abstractions; keep behavior locked with tests before extracting more.
 */

import { Injector, type ViewContainerRef } from '@angular/core';
import { ComponentPortal, NoopScrollStrategy, RepositionScrollStrategy } from '@nexora-ui/overlay';

import {
  TOOLTIP_SHOW_ARROW,
  TOOLTIP_TEXT,
  TooltipContentHostComponent,
} from '../host/tooltip-content-host.component';

export function createTooltipContentHostPortal(
  vcr: ViewContainerRef,
  parentInjector: Injector,
  text: string,
  displayArrow: boolean,
): ComponentPortal<TooltipContentHostComponent> {
  const injector = Injector.create({
    parent: parentInjector,
    providers: [
      { provide: TOOLTIP_TEXT, useValue: text },
      { provide: TOOLTIP_SHOW_ARROW, useValue: displayArrow },
    ],
  });

  return new ComponentPortal(TooltipContentHostComponent, vcr, injector);
}

export function resolveTooltipScrollStrategy(
  scrollStrategy: 'noop' | 'reposition',
): NoopScrollStrategy | RepositionScrollStrategy {
  return scrollStrategy === 'reposition'
    ? new RepositionScrollStrategy()
    : new NoopScrollStrategy();
}

/** Default anchored overlay close policy for tooltips (Escape bubbles; no outside/backdrop close). */
export const TOOLTIP_OVERLAY_CLOSE_POLICY = {
  escape: 'top',
  outside: 'none',
  backdrop: 'none',
} as const;

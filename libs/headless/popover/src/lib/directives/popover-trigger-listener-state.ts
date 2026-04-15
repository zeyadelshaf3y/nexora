import type { PopoverFocusCloseCoordinator } from '../internal';

import {
  attachPopoverFocusPaneListener,
  attachPopoverOutsideClickListener,
} from './popover-trigger-close-listeners';

export type PopoverTriggerListenerState = {
  focusPaneCleanup: (() => void) | null;
  outsideClickCleanup: (() => void) | null;
};

export type PopoverFocusPaneListenerParams = Parameters<typeof attachPopoverFocusPaneListener>[0];
export type PopoverOutsideClickListenerParams = Parameters<
  typeof attachPopoverOutsideClickListener
>[0];

/** Mutable holder for listener teardown callbacks owned by a trigger instance. */
export function createPopoverTriggerListenerState(): PopoverTriggerListenerState {
  return {
    focusPaneCleanup: null,
    outsideClickCleanup: null,
  };
}

export function replacePopoverFocusPaneListener(
  state: PopoverTriggerListenerState,
  params: PopoverFocusPaneListenerParams,
): void {
  clearPopoverFocusPaneListener(state);
  state.focusPaneCleanup = attachPopoverFocusPaneListener(params);
}

export function clearPopoverFocusPaneListener(state: PopoverTriggerListenerState): void {
  state.focusPaneCleanup?.();
  state.focusPaneCleanup = null;
}

export function replacePopoverOutsideClickListener(
  state: PopoverTriggerListenerState,
  params: PopoverOutsideClickListenerParams,
): void {
  clearPopoverOutsideClickListener(state, params.focusClose);
  state.outsideClickCleanup = attachPopoverOutsideClickListener(params);
}

export function clearPopoverOutsideClickListener(
  state: PopoverTriggerListenerState,
  focusClose: Pick<PopoverFocusCloseCoordinator, 'clearPointerDown'>,
): void {
  state.outsideClickCleanup?.();
  state.outsideClickCleanup = null;
  focusClose.clearPointerDown();
}

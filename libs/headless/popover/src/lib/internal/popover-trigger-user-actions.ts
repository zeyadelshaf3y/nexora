import {
  CLOSE_REASON_PROGRAMMATIC,
  handleAnchoredHoverLeave,
  runWithOpenDelay,
  type HoverBridge,
  type OverlayRef,
  type TriggerDelay,
} from '@nexora-ui/overlay';

import type { PopoverTrigger } from '../types/popover-trigger-types';

import type { PopoverFocusCloseCoordinator } from './popover-focus-close-coordinator';
import type { PopoverOpenLifecycleState } from './popover-open-lifecycle-state';

/** Minimal surface for pointer/focus handlers extracted from PopoverTriggerDirective. */
export interface PopoverTriggerHost {
  triggerIncludes(t: PopoverTrigger): boolean;
  nxrPopoverDisabled(): boolean;
  nxrPopoverOpenDelay(): number;
  nxrPopoverAllowContentHover(): boolean;
  getOverlayRef(): OverlayRef | null;
  open(trigger: PopoverTrigger): void;
  close(): void;
  getOpenedBy(): ReturnType<PopoverOpenLifecycleState['getOpenedBy']>;
  readonly openDelay: TriggerDelay;
  readonly focusClose: PopoverFocusCloseCoordinator;
  scheduleFocusCloseCheck(): void;
  getHoverCloseDelay(): number;
  getAnchorElement(): HTMLElement;
  /** Current nested-overlay flag (read fresh; used by hover-leave bridge). */
  getIsNestedOverlay(): boolean;
  getHoverBridge(): HoverBridge | null;
}

export function popoverHandleClick(host: PopoverTriggerHost): void {
  if (!host.triggerIncludes('click') || host.nxrPopoverDisabled()) return;

  const ref = host.getOverlayRef();
  if (ref) {
    ref.close(CLOSE_REASON_PROGRAMMATIC);

    return;
  }
  host.open('click');
}

export function popoverHandleFocus(host: PopoverTriggerHost): void {
  if (!host.triggerIncludes('focus') || host.nxrPopoverDisabled()) return;

  host.openDelay.cancel();
  host.focusClose.cancel();
  const delay = host.nxrPopoverOpenDelay();

  if (delay > 0 && !host.getOverlayRef()) {
    host.openDelay.schedule(delay, () => {
      if (!host.getOverlayRef()) host.open('focus');
    });
  } else if (!host.getOverlayRef()) {
    host.open('focus');
  }
}

export function popoverHandleBlur(host: PopoverTriggerHost): void {
  if (!host.triggerIncludes('focus') || host.getOpenedBy() !== 'focus') return;

  host.openDelay.cancel();
  if (!host.getOverlayRef()) return;

  host.scheduleFocusCloseCheck();
}

export function popoverHandleMouseEnter(host: PopoverTriggerHost): void {
  if (!host.triggerIncludes('hover') || host.nxrPopoverDisabled()) return;

  host.openDelay.cancel();
  host.getHoverBridge()?.cancelClose();
  if (host.getOverlayRef()) return;
  runWithOpenDelay(
    host.nxrPopoverOpenDelay(),
    () => {
      if (!host.getOverlayRef()) host.open('hover');
    },
    host.openDelay,
  );
}

export function popoverHandleMouseLeave(host: PopoverTriggerHost, event: MouseEvent): void {
  handleAnchoredHoverLeave(event, {
    openDelay: host.openDelay,
    isHoverTrigger: () => host.triggerIncludes('hover'),
    openedBy: host.getOpenedBy(),
    overlayRef: host.getOverlayRef(),
    getTriggerElement: () => host.getAnchorElement(),
    getPane: () => host.getOverlayRef()?.getPaneElement() ?? null,
    allowContentHover: host.nxrPopoverAllowContentHover(),
    isNestedOverlay: host.getIsNestedOverlay(),
    getCloseDelay: () => host.getHoverCloseDelay(),
    hoverBridge: host.getHoverBridge(),
    close: () => host.close(),
  });
}

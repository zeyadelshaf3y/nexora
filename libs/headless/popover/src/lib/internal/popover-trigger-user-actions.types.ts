import type { HoverBridge, OverlayRef, TriggerDelay } from '@nexora-ui/overlay';

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

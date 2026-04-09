export {
  type CloseReason,
  CLOSE_REASON_PROGRAMMATIC,
  CLOSE_REASON_SCROLL,
  CLOSE_REASON_SELECTION,
  CLOSE_REASON_OUTSIDE,
} from './lib/ref/close-reason';
export { type ClosePolicy, DEFAULT_CLOSE_POLICY, mergeClosePolicy } from './lib/ref/close-policy';
export type { OverlayRef } from './lib/ref/overlay-ref';
export type {
  ArrowSize,
  OverlayConfig,
  BeforeOpenCallback,
  BeforeCloseCallback,
  PanelDimensionOptions,
  PanelStylingOptions,
  ViewportBoundaries,
} from './lib/ref/overlay-config';

export type { Portal } from './lib/portal/portal';
export { TemplatePortal } from './lib/portal/template-portal';
export { ComponentPortal } from './lib/portal/component-portal';

export type {
  ArrowSide,
  Placement,
  PositionContext,
  PositionResult,
  PositionStrategy,
} from './lib/position/position-strategy';
export { GlobalCenterStrategy } from './lib/position/global-center-strategy';
export { AnchoredStrategy, type AnchoredStrategyOptions } from './lib/position/anchored-strategy';
export {
  createAnchoredOverlayConfig,
  type CreateAnchoredOverlayConfigParams,
} from './lib/ref/create-anchored-overlay-config';
export type { BaseAnchoredPresetParams } from './lib/ref/anchored-preset-params';
export {
  composeBeforeCloseCallbacks,
  composeBeforeOpenCallbacks,
} from './lib/ref/compose-before-callbacks';
export {
  createDropdownAnchoredConfig,
  type CreateDropdownAnchoredConfigParams,
} from './lib/ref/create-dropdown-anchored-config';
export {
  createMenuAnchoredConfig,
  type CreateMenuAnchoredConfigParams,
} from './lib/ref/create-menu-anchored-config';
export type { DialogPlacement } from './lib/position/dialog-strategy';
export { DialogStrategy } from './lib/position/dialog-strategy';
export type { DrawerPlacement } from './lib/position/drawer-strategy';
export { DrawerStrategy } from './lib/position/drawer-strategy';

export type { ScrollStrategy } from './lib/scroll/scroll-strategy';
export { NoopScrollStrategy } from './lib/scroll/noop-scroll-strategy';
export { RepositionScrollStrategy } from './lib/scroll/reposition-scroll-strategy';
export { BlockScrollStrategy } from './lib/scroll/block-scroll-strategy';
export { CloseOnScrollStrategy } from './lib/scroll/close-on-scroll-strategy';

export type { FocusStrategy } from './lib/focus/focus-strategy';
export { DefaultFocusStrategy } from './lib/focus/default-focus-strategy';
export { NoopFocusStrategy } from './lib/focus/noop-focus-strategy';

export {
  ARROW_HOST_STYLES,
  BASE_Z_INDEX,
  DEFAULT_ARROW_HEIGHT,
  DEFAULT_ARROW_WIDTH,
  DEFAULT_CLOSE_ANIMATION_MS,
  DEFAULT_OPEN_DELAY_MS,
  DEFAULT_HOVER_CLOSE_DELAY_MS,
  DEFAULT_FOCUS_CLOSE_DELAY_MS,
  DEFAULT_VIEWPORT_PADDING,
  WARMUP_SKIP_DELAY_MS,
} from './lib/defaults/constants';
export { OVERLAY_BASE_Z_INDEX } from './lib/defaults/overlay-z-index';
export {
  DATA_ATTR_OVERLAY,
  DATA_ATTR_POPOVER_BRIDGE,
  DATA_ATTR_TOOLTIP_BRIDGE,
  OVERLAY_KIND_BACKDROP,
  OVERLAY_KIND_CONTAINER,
  OVERLAY_KIND_PANE,
  OVERLAY_KIND_VIEW_HOST,
  OVERLAY_SELECTOR_PANE,
  PANE_ID_PREFIX_POPOVER,
  PANE_ID_PREFIX_TOOLTIP,
} from './lib/defaults/overlay-attributes';

export type {
  ComponentOutputRef,
  ContentOpenOptionsBase,
  DialogOpenOptions,
  DrawerOpenOptions,
  ExtractInputKeys,
  ExtractOutputKeys,
  InputValueType,
  OpenInputs,
  OpenInputsFor,
  OpenOptionsForComponent,
  OpenOptionsForTemplate,
  OpenOutputHandler,
  OpenOutputHandlerFor,
  OpenOutputs,
  OpenOutputsFor,
  OutputEmittedType,
  OverlayPanelOptions,
} from './lib/types/open-types';
export type { OverlayOpenConfig } from './lib/services/overlay.service';
export { OverlayService } from './lib/services/overlay.service';
export { DialogService } from './lib/services/dialog.service';
export { DrawerService } from './lib/services/drawer.service';
export { OverlayTriggerDirective } from './lib/directives/overlay-trigger.directive';
export { OverlayViewContainerDirective } from './lib/directives/overlay-view-container.directive';
export { OverlayArrowDirective } from './lib/directives/overlay-arrow.directive';
export { getContainingOverlayRef, CloseDialogDirective, CloseDrawerDirective } from './lib/close';

export type { GapRect, HoverBridgeConfig } from './lib/hover/hover-bridge';
export {
  createHoverBridgeAndAttach,
  HoverBridge,
  isInsideOverlayPane,
  isInsideOverlayPaneOrBridge,
  computeGapRect,
  shouldSkipHoverClose,
} from './lib/hover/hover-bridge';

export {
  createTriggerDelay,
  runWithOpenDelay,
  type RunWithOpenDelayOptions,
  type TriggerDelay,
} from './lib/utils/trigger-delay';
export {
  handleAnchoredHoverLeave,
  type AnchoredHoverLeaveContext,
} from './lib/utils/anchored-hover-leave';
export {
  setupAnchoredOverlayOpenedState,
  type AnchoredOverlayOpenedStateOptions,
} from './lib/utils/anchored-overlay-opened-state';
export {
  createOutsideClickListener,
  type OutsideClickOptions,
} from './lib/utils/outside-click-listener';
export { triggerIncludes } from './lib/utils/trigger-includes';
/** Type guard for component vs template content; public surface for popover/tooltip-style APIs. */
export { isComponent } from './lib/utils/apply-component-bindings';
/**
 * One-shot `afterClosed()` helpers (RxJS only — no `DestroyRef` / `takeUntilDestroyed` in this entry).
 * For directive teardown with `DestroyRef`, use `afterClosedOnceUntilDestroyed` from `@nexora-ui/overlay/internal`.
 */
export { afterClosedOnce, subscribeOnceAfterClosed } from './lib/utils/subscribe-once-after-closed';

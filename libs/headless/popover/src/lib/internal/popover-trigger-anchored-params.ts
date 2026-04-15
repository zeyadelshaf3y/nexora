import {
  DefaultFocusStrategy,
  getContainingOverlayRef,
  type BeforeCloseCallback,
  type BeforeOpenCallback,
  type ClosePolicy,
  type CreateAnchoredOverlayConfigParams,
  type Placement,
  type ViewportBoundaries,
} from '@nexora-ui/overlay';

import {
  getPopoverDefaultClosePolicy,
  resolvePopoverScrollStrategy,
} from './popover-trigger-overlay-helpers';

/** Inputs needed to build {@link CreateAnchoredOverlayConfigParams} for the popover trigger. */
export interface PopoverAnchoredOverlayInputs {
  readonly placement: Placement;
  readonly offset: number;
  readonly clampToViewport: boolean;
  readonly preferredPlacementOnly: boolean;
  readonly hasBackdrop: boolean;
  readonly closePolicy: Partial<ClosePolicy> | undefined;
  readonly closeOnScroll: boolean;
  readonly scrollStrategy: 'noop' | 'reposition' | 'close';
  readonly maintainInViewport: boolean;
  readonly boundaries: ViewportBoundaries | undefined;
  readonly closeAnimationDurationMs: number;
  readonly panelClass: string | string[] | undefined;
  readonly panelStyle: Record<string, string> | undefined;
  readonly backdropClass: string | string[] | undefined;
  readonly backdropStyle: Record<string, string> | undefined;
  readonly arrowSize: { width: number; height: number } | undefined;
  readonly beforeOpen: BeforeOpenCallback | undefined;
  readonly beforeClose: BeforeCloseCallback | undefined;
  readonly matchAnchorWidth: boolean;
  readonly width: string | undefined;
  readonly height: string | undefined;
  readonly minWidth: string | undefined;
  readonly maxWidth: string | undefined;
  readonly minHeight: string | undefined;
  readonly maxHeight: string | undefined;
}

export function resolvePopoverPanelWidth(
  anchor: HTMLElement,
  inputs: Pick<PopoverAnchoredOverlayInputs, 'matchAnchorWidth' | 'width'>,
): string | undefined {
  return inputs.matchAnchorWidth ? `${anchor.offsetWidth}px` : inputs.width;
}

/**
 * Builds anchored overlay params for {@link createAnchoredOverlayConfig} from popover trigger state.
 */
export function buildPopoverAnchoredOverlayParams(
  anchor: HTMLElement,
  inputs: PopoverAnchoredOverlayInputs,
): CreateAnchoredOverlayConfigParams {
  return {
    anchor,
    placement: inputs.placement,
    offset: inputs.offset,
    clampToViewport: inputs.clampToViewport,
    preferredPlacementOnly: inputs.preferredPlacementOnly,
    hasBackdrop: inputs.hasBackdrop,
    closePolicy: inputs.closePolicy ?? getPopoverDefaultClosePolicy(inputs.hasBackdrop),
    scrollStrategy: resolvePopoverScrollStrategy(inputs.closeOnScroll, inputs.scrollStrategy),
    maintainInViewport: inputs.maintainInViewport,
    boundaries: inputs.boundaries,
    focusStrategy: new DefaultFocusStrategy(),
    closeAnimationDurationMs: inputs.closeAnimationDurationMs,
    parentRef: getContainingOverlayRef(anchor) ?? undefined,
    panelClass: inputs.panelClass,
    panelStyle: inputs.panelStyle,
    backdropClass: inputs.backdropClass,
    backdropStyle: inputs.backdropStyle,
    arrowSize: inputs.arrowSize,
    beforeOpen: inputs.beforeOpen,
    beforeClose: inputs.beforeClose,
    width: resolvePopoverPanelWidth(anchor, inputs),
    height: inputs.height,
    minWidth: inputs.minWidth,
    maxWidth: inputs.maxWidth,
    minHeight: inputs.minHeight,
    maxHeight: inputs.maxHeight,
  };
}

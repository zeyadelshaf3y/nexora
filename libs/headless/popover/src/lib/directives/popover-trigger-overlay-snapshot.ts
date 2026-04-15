import type { PopoverAnchoredOverlayInputs } from '../internal';

export function buildPopoverOverlaySnapshot(params: {
  placement: PopoverAnchoredOverlayInputs['placement'];
  offset: PopoverAnchoredOverlayInputs['offset'];
  clampToViewport: PopoverAnchoredOverlayInputs['clampToViewport'];
  preferredPlacementOnly: PopoverAnchoredOverlayInputs['preferredPlacementOnly'];
  hasBackdrop: PopoverAnchoredOverlayInputs['hasBackdrop'];
  closePolicy: PopoverAnchoredOverlayInputs['closePolicy'];
  closeOnScroll: PopoverAnchoredOverlayInputs['closeOnScroll'];
  scrollStrategy: PopoverAnchoredOverlayInputs['scrollStrategy'];
  maintainInViewport: PopoverAnchoredOverlayInputs['maintainInViewport'];
  boundaries: PopoverAnchoredOverlayInputs['boundaries'];
  closeAnimationDurationMs: PopoverAnchoredOverlayInputs['closeAnimationDurationMs'];
  panelClass: PopoverAnchoredOverlayInputs['panelClass'];
  panelStyle: PopoverAnchoredOverlayInputs['panelStyle'];
  backdropClass: PopoverAnchoredOverlayInputs['backdropClass'];
  backdropStyle: PopoverAnchoredOverlayInputs['backdropStyle'];
  arrowSize: PopoverAnchoredOverlayInputs['arrowSize'];
  beforeOpen: PopoverAnchoredOverlayInputs['beforeOpen'];
  beforeClose: PopoverAnchoredOverlayInputs['beforeClose'];
  matchAnchorWidth: PopoverAnchoredOverlayInputs['matchAnchorWidth'];
  width: PopoverAnchoredOverlayInputs['width'];
  height: PopoverAnchoredOverlayInputs['height'];
  minWidth: PopoverAnchoredOverlayInputs['minWidth'];
  maxWidth: PopoverAnchoredOverlayInputs['maxWidth'];
  minHeight: PopoverAnchoredOverlayInputs['minHeight'];
  maxHeight: PopoverAnchoredOverlayInputs['maxHeight'];
}): PopoverAnchoredOverlayInputs {
  return {
    placement: params.placement,
    offset: params.offset,
    clampToViewport: params.clampToViewport,
    preferredPlacementOnly: params.preferredPlacementOnly,
    hasBackdrop: params.hasBackdrop,
    closePolicy: params.closePolicy,
    closeOnScroll: params.closeOnScroll,
    scrollStrategy: params.scrollStrategy,
    maintainInViewport: params.maintainInViewport,
    boundaries: params.boundaries,
    closeAnimationDurationMs: params.closeAnimationDurationMs,
    panelClass: params.panelClass,
    panelStyle: params.panelStyle,
    backdropClass: params.backdropClass,
    backdropStyle: params.backdropStyle,
    arrowSize: params.arrowSize,
    beforeOpen: params.beforeOpen,
    beforeClose: params.beforeClose,
    matchAnchorWidth: params.matchAnchorWidth,
    width: params.width,
    height: params.height,
    minWidth: params.minWidth,
    maxWidth: params.maxWidth,
    minHeight: params.minHeight,
    maxHeight: params.maxHeight,
  };
}

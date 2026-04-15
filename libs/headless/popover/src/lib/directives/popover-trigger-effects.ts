import { resolvePopoverAriaHasPopup, type PopoverExternalAnchorState } from '../internal';

export function handlePopoverExternalAnchorEffect(params: {
  externalAnchorState: PopoverExternalAnchorState;
  anchor: HTMLElement | null;
  triggerKey: string;
  isOverlayOpen: boolean;
  closeOverlay: () => void;
  attachListeners: (externalAnchor: HTMLElement) => () => void;
  hoverEnabled: boolean;
  disabled: boolean;
  isAnchorHovered: (externalAnchor: HTMLElement) => boolean;
  onOpenHoveredAnchor: () => void;
}): void {
  const { openHoveredAnchorNow } = params.externalAnchorState.handleChange({
    anchor: params.anchor,
    triggerKey: params.triggerKey,
    isOverlayOpen: params.isOverlayOpen,
    closeOverlay: params.closeOverlay,
    attachListeners: params.attachListeners,
    hoverEnabled: params.hoverEnabled,
    disabled: params.disabled,
    isAnchorHovered: params.isAnchorHovered,
  });

  if (openHoveredAnchorNow) params.onOpenHoveredAnchor();
}

export function syncPopoverExternalAnchorAriaEffect(params: {
  externalAnchorState: PopoverExternalAnchorState;
  anchor: HTMLElement | null;
  isOpen: boolean;
  paneId: string | null;
}): void {
  if (!params.anchor) return;

  params.externalAnchorState.syncAria(params.anchor, params.isOpen, params.paneId);
}

export function syncPopoverAriaHasPopupEffect(params: {
  role: string;
  setAriaHasPopup: (value: string) => void;
}): void {
  params.setAriaHasPopup(resolvePopoverAriaHasPopup(params.role));
}

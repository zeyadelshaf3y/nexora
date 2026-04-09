import type { CloseReason } from '@nexora-ui/overlay';
import { CLOSE_REASON_OUTSIDE, CLOSE_REASON_SELECTION } from '@nexora-ui/overlay';

interface CanOpenDropdownParams {
  readonly isOverlayOpen: boolean;
  readonly isDisabled: boolean;
  readonly hasAnchor: boolean;
  readonly hasPanel: boolean;
}

export function canOpenDropdown(params: CanOpenDropdownParams): boolean {
  const { isOverlayOpen, isDisabled, hasAnchor, hasPanel } = params;
  if (isBlockedFromOpening(isOverlayOpen, isDisabled)) return false;

  return hasAnchor && hasPanel;
}

function isBlockedFromOpening(isOverlayOpen: boolean, isDisabled: boolean): boolean {
  return isOverlayOpen || isDisabled;
}

interface ApplyOpenedTransitionParams {
  readonly setOpen: (isOpen: boolean) => void;
  readonly emitOpened: () => void;
  readonly afterOpened?: () => void;
}

export function applyOpenedTransition(params: ApplyOpenedTransitionParams): void {
  const { setOpen, emitOpened, afterOpened } = params;
  setOpen(true);
  emitOpened();
  afterOpened?.();
}

interface ApplyClosedTransitionParams {
  readonly clearListbox: () => void;
  readonly setOpen: (isOpen: boolean) => void;
  readonly emitClosed: (reason: CloseReason | undefined) => void;
  readonly reason: CloseReason | undefined;
  readonly afterClosed?: (reason: CloseReason | undefined) => void;
  readonly markTouched?: () => void;
}

export function applyClosedTransition(params: ApplyClosedTransitionParams): void {
  const { clearListbox, setOpen, emitClosed, reason, afterClosed, markTouched } = params;
  clearListbox();
  setOpen(false);
  afterClosed?.(reason);
  emitClosed(reason);
  markTouched?.();
}

export function shouldQueueSkipNextOpenOnFocus(
  reason: CloseReason | undefined,
  closedViaToggle: boolean,
): boolean {
  return !closedViaToggle && !isOutsideCloseReason(reason);
}

export function shouldRefocusAfterSelectionClose(reason: CloseReason | undefined): boolean {
  return isSelectionCloseReason(reason);
}

function isOutsideCloseReason(reason: CloseReason | undefined): boolean {
  return reason === CLOSE_REASON_OUTSIDE;
}

function isSelectionCloseReason(reason: CloseReason | undefined): boolean {
  return reason === CLOSE_REASON_SELECTION;
}

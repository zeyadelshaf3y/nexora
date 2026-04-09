/**
 * Appends/removes overlay pane and backdrop for global vs host-scoped (dashboard) layouts.
 * Host-scoped: backdrop lives under the content host; pane is appended to the global overlay container.
 */

/** Tracks temporary `position: relative` on the content host for scoped overlays. */
export interface OverlayHostDomState {
  previousHostPosition: string | null;
  hostPositionMutated: boolean;
}

export function createOverlayHostDomState(): OverlayHostDomState {
  return { previousHostPosition: null, hostPositionMutated: false };
}

export function appendOverlayPaneAndBackdrop(args: {
  /**
   * Resolved host: content element when `hostScoped`, otherwise the global overlay container
   * (same as `globalOverlayContainer` in the non-scoped case).
   */
  mountTarget: HTMLElement;
  globalOverlayContainer: HTMLElement;
  pane: HTMLElement;
  backdrop: HTMLElement | null;
  hostScoped: boolean;
  state: OverlayHostDomState;
}): void {
  const { mountTarget, globalOverlayContainer, pane, backdrop, hostScoped, state } = args;

  if (hostScoped) {
    state.previousHostPosition = mountTarget.style.position;
    if (mountTarget.style.position !== 'relative') {
      mountTarget.style.position = 'relative';
      state.hostPositionMutated = true;
    } else {
      state.hostPositionMutated = false;
    }

    if (backdrop) mountTarget.appendChild(backdrop);

    globalOverlayContainer.appendChild(pane);
  } else {
    if (backdrop) mountTarget.appendChild(backdrop);

    mountTarget.appendChild(pane);
  }
}

export function removeOverlayPaneAndBackdrop(args: {
  mountTarget: HTMLElement;
  pane: HTMLElement;
  backdrop: HTMLElement | null;
  hostScoped: boolean;
  state: OverlayHostDomState;
}): void {
  const { mountTarget, pane, backdrop, hostScoped, state } = args;

  if (backdrop?.parentNode === mountTarget) mountTarget.removeChild(backdrop);

  const paneParent = pane.parentNode;

  if (paneParent) paneParent.removeChild(pane);

  if (hostScoped) {
    if (state.hostPositionMutated) {
      mountTarget.style.position = state.previousHostPosition ?? '';
    }

    state.hostPositionMutated = false;
    state.previousHostPosition = null;
  }
}

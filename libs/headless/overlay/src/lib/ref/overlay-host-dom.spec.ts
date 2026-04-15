import {
  appendOverlayPaneAndBackdrop,
  createOverlayHostDomState,
  removeOverlayPaneAndBackdrop,
} from './overlay-host-dom';

describe('appendOverlayPaneAndBackdrop / removeOverlayPaneAndBackdrop', () => {
  it('appends backdrop and pane to the same target when not host-scoped', () => {
    const mountTarget = document.createElement('div');
    const pane = document.createElement('div');
    const backdrop = document.createElement('div');
    const state = createOverlayHostDomState();

    appendOverlayPaneAndBackdrop({
      mountTarget,
      globalOverlayContainer: mountTarget,
      pane,
      backdrop,
      hostScoped: false,
      state,
    });

    expect(mountTarget.contains(backdrop)).toBe(true);
    expect(mountTarget.contains(pane)).toBe(true);
    expect(state.hostPositionMutated).toBe(false);

    removeOverlayPaneAndBackdrop({
      mountTarget,
      pane,
      backdrop,
      hostScoped: false,
      state,
    });

    expect(mountTarget.contains(backdrop)).toBe(false);
    expect(mountTarget.contains(pane)).toBe(false);
  });

  it('host-scoped: backdrop on content host, pane on global container; restores host position', () => {
    const contentHost = document.createElement('div');
    contentHost.style.position = 'absolute';
    const globalContainer = document.createElement('div');
    const pane = document.createElement('div');
    const backdrop = document.createElement('div');
    const state = createOverlayHostDomState();

    appendOverlayPaneAndBackdrop({
      mountTarget: contentHost,
      globalOverlayContainer: globalContainer,
      pane,
      backdrop,
      hostScoped: true,
      state,
    });

    expect(contentHost.contains(backdrop)).toBe(true);
    expect(globalContainer.contains(pane)).toBe(true);
    expect(contentHost.style.position).toBe('relative');
    expect(state.hostPositionMutated).toBe(true);

    removeOverlayPaneAndBackdrop({
      mountTarget: contentHost,
      pane,
      backdrop,
      hostScoped: true,
      state,
    });

    expect(contentHost.style.position).toBe('absolute');
    expect(state.previousHostPosition).toBeNull();
    expect(state.hostPositionMutated).toBe(false);
  });

  it('host-scoped with already-relative host does not flag mutation', () => {
    const contentHost = document.createElement('div');
    contentHost.style.position = 'relative';
    const globalContainer = document.createElement('div');
    const state = createOverlayHostDomState();

    appendOverlayPaneAndBackdrop({
      mountTarget: contentHost,
      globalOverlayContainer: globalContainer,
      pane: document.createElement('div'),
      backdrop: document.createElement('div'),
      hostScoped: true,
      state,
    });

    expect(state.hostPositionMutated).toBe(false);
  });
});

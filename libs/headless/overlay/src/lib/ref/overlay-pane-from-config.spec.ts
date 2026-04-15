import {
  applyOverlayPaneA11yFromConfig,
  applyOverlayPaneSizingFromConfig,
} from './overlay-pane-from-config';

describe('applyOverlayPaneA11yFromConfig', () => {
  it('defaults role and aria-modal when hasBackdrop is true', () => {
    const pane = document.createElement('div');
    applyOverlayPaneA11yFromConfig(pane, { hasBackdrop: true });
    expect(pane.getAttribute('role')).toBe('dialog');
    expect(pane.getAttribute('aria-modal')).toBe('true');
  });

  it('does not set role when no backdrop and no explicit ariaRole', () => {
    const pane = document.createElement('div');
    applyOverlayPaneA11yFromConfig(pane, { hasBackdrop: false });
    expect(pane.getAttribute('role')).toBeNull();
  });

  it('respects explicit aria overrides', () => {
    const pane = document.createElement('div');
    applyOverlayPaneA11yFromConfig(pane, {
      hasBackdrop: true,
      ariaRole: 'alertdialog',
      ariaModal: false,
      ariaLabel: 'Test',
      ariaLabelledBy: 'lbl',
    });
    expect(pane.getAttribute('role')).toBe('alertdialog');
    expect(pane.getAttribute('aria-modal')).toBe('false');
    expect(pane.getAttribute('aria-label')).toBe('Test');
    expect(pane.getAttribute('aria-labelledby')).toBe('lbl');
  });
});

describe('applyOverlayPaneSizingFromConfig', () => {
  it('skips max-* when host is set', () => {
    const pane = document.createElement('div');
    applyOverlayPaneSizingFromConfig(
      pane,
      { host: document.createElement('div'), width: '10px' },
      () => new DOMRect(0, 0, 100, 100),
    );
    expect(pane.style.width).toBe('10px');
    expect(pane.style.maxWidth).toBe('');
  });

  it('caps max dimensions to viewport via injectable getViewportRect', () => {
    const pane = document.createElement('div');
    applyOverlayPaneSizingFromConfig(
      pane,
      { maxWidth: '90%', maxHeight: '80vh' },
      () => new DOMRect(0, 0, 400, 300),
    );
    expect(pane.style.maxWidth).toBe('min(90%, 400px)');
    expect(pane.style.maxHeight).toBe('min(80vh, 300px)');
  });

  it('applies boundaries to viewport before max-*', () => {
    const pane = document.createElement('div');
    applyOverlayPaneSizingFromConfig(
      pane,
      { boundaries: { left: 10, right: 10, top: 0, bottom: 0 } },
      () => new DOMRect(0, 0, 500, 400),
    );
    expect(pane.style.maxWidth).toBe('480px');
  });
});

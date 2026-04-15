import { describe, expect, it, vi } from 'vitest';

import {
  clearTooltipPaneInstantAnimationStyles,
  prepareTooltipPaneForHandoffClose,
} from './tooltip-handoff-pane-styles';

describe('prepareTooltipPaneForHandoffClose', () => {
  it('sets zero close duration and strips pane animation', () => {
    const pane = document.createElement('div');
    pane.style.transition = 'opacity 1s';
    const setClose = vi.fn();
    prepareTooltipPaneForHandoffClose({
      setCloseAnimationDurationMs: setClose,
      getPaneElement: () => pane,
    });
    expect(setClose).toHaveBeenCalledWith(0);
    expect(pane.style.transition).toBe('none');
    expect(pane.style.animation).toBe('none');
  });
});

describe('clearTooltipPaneInstantAnimationStyles', () => {
  it('removes transition and animation when pane exists', () => {
    const pane = document.createElement('div');
    pane.style.transition = 'none';
    pane.style.animation = 'none';
    clearTooltipPaneInstantAnimationStyles(pane);
    expect(pane.style.transition).toBe('');
    expect(pane.style.animation).toBe('');
  });
});

import { describe, expect, it } from 'vitest';

import {
  resolveDrawerDragDismissVector,
  resolveDrawerDragDismissVectorFromPane,
  resolveDrawerDragHandleEdge,
} from './drawer-drag-dismiss-vector';

describe('resolveDrawerDragDismissVector', () => {
  it('returns vertical dismiss for top and bottom', () => {
    expect(resolveDrawerDragDismissVector('top', 'ltr')).toEqual({ axis: 'y', dismissSign: -1 });
    expect(resolveDrawerDragDismissVector('bottom', 'ltr')).toEqual({ axis: 'y', dismissSign: 1 });
  });

  it('returns horizontal dismiss for start/end in LTR', () => {
    expect(resolveDrawerDragDismissVector('start', 'ltr')).toEqual({ axis: 'x', dismissSign: -1 });
    expect(resolveDrawerDragDismissVector('end', 'ltr')).toEqual({ axis: 'x', dismissSign: 1 });
  });

  it('flips start/end dismiss sign in RTL', () => {
    expect(resolveDrawerDragDismissVector('start', 'rtl')).toEqual({ axis: 'x', dismissSign: 1 });
    expect(resolveDrawerDragDismissVector('end', 'rtl')).toEqual({ axis: 'x', dismissSign: -1 });
  });
});

describe('resolveDrawerDragHandleEdge', () => {
  it('maps placement to the dismiss-adjacent handle edge', () => {
    expect(resolveDrawerDragHandleEdge('top')).toBe('block-end');
    expect(resolveDrawerDragHandleEdge('bottom')).toBe('block-start');
    expect(resolveDrawerDragHandleEdge('start')).toBe('inline-end');
    expect(resolveDrawerDragHandleEdge('end')).toBe('inline-start');
  });
});

describe('resolveDrawerDragDismissVectorFromPane', () => {
  it('reads placement from data-placement on pane', () => {
    const pane = document.createElement('div');
    pane.setAttribute('data-placement', 'drawer-end');

    expect(resolveDrawerDragDismissVectorFromPane(pane)).toEqual({ axis: 'x', dismissSign: 1 });
  });

  it('returns null for non-drawer panes', () => {
    const pane = document.createElement('div');
    pane.setAttribute('data-placement', 'dialog-center');

    expect(resolveDrawerDragDismissVectorFromPane(pane)).toBeNull();
  });
});

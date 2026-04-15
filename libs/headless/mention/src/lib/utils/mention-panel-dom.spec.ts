import { describe, it, expect } from 'vitest';

import { NXR_MENTION_OVERLAY_PANE_CLASS } from '../constants/mention-overlay-constants';

import {
  isElementWithinMentionSuggestionUi,
  targetNeedsPointerDefaultForFocus,
} from './mention-panel-dom';

describe('mention-panel-dom', () => {
  it('targetNeedsPointerDefaultForFocus is true for text input', () => {
    const input = document.createElement('input');
    input.type = 'text';
    expect(targetNeedsPointerDefaultForFocus(input)).toBe(true);
  });

  it('targetNeedsPointerDefaultForFocus is false for plain div', () => {
    expect(targetNeedsPointerDefaultForFocus(document.createElement('div'))).toBe(false);
  });

  it('isElementWithinMentionSuggestionUi detects panel host', () => {
    const host = document.createElement('nxr-mention-panel-host');
    const opt = document.createElement('div');
    host.appendChild(opt);
    document.body.appendChild(host);
    try {
      expect(isElementWithinMentionSuggestionUi(opt, NXR_MENTION_OVERLAY_PANE_CLASS)).toBe(true);
    } finally {
      host.remove();
    }
  });

  it('isElementWithinMentionSuggestionUi detects overlay pane class', () => {
    const pane = document.createElement('div');
    pane.className = NXR_MENTION_OVERLAY_PANE_CLASS;
    const inner = document.createElement('span');
    pane.appendChild(inner);
    document.body.appendChild(pane);
    try {
      expect(isElementWithinMentionSuggestionUi(inner, NXR_MENTION_OVERLAY_PANE_CLASS)).toBe(true);
    } finally {
      pane.remove();
    }
  });
});

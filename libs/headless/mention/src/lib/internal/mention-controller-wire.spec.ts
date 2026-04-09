import { describe, expect, it } from 'vitest';

import type { MentionControllerWire } from './mention-controller-wire';
import { isSameMentionControllerWire } from './mention-controller-wire';

function baseWire(): MentionControllerWire {
  return {
    el: document.createElement('div'),
    triggers: [],
    panelTpl: {} as MentionControllerWire['panelTpl'],
    placement: 'bottom-start',
    offset: 8,
    debounceMs: 0,
    loadingDebounceMs: 120,
    minLoadingMs: 120,
    moveCaret: false,
    panelClass: undefined,
    panelStyle: undefined,
    closeMs: 150,
    beforeOpen: undefined,
    beforeClose: undefined,
    chipClass: undefined,
  };
}

describe('isSameMentionControllerWire', () => {
  it('treats trigger arrays with same entry references as equivalent', () => {
    const trigger = { trigger: '@', getItems: () => [], displayWith: () => '' };
    const prev: MentionControllerWire = {
      ...baseWire(),
      triggers: [trigger],
    };
    const next: MentionControllerWire = {
      ...prev,
      triggers: [trigger],
    };

    expect(isSameMentionControllerWire(prev, next, true, true)).toBe(true);
  });

  it('detects changed trigger entry references', () => {
    const prev: MentionControllerWire = {
      ...baseWire(),
      triggers: [{ trigger: '@', getItems: () => [], displayWith: () => '' }],
    };
    const next: MentionControllerWire = {
      ...prev,
      triggers: [{ trigger: '@', getItems: () => [], displayWith: () => '' }],
    };

    expect(isSameMentionControllerWire(prev, next, true, true)).toBe(false);
  });

  it('treats equal panelClass arrays as equivalent', () => {
    const prev: MentionControllerWire = {
      ...baseWire(),
      panelClass: ['mention-pane', 'theme-dark'],
    };
    const next: MentionControllerWire = {
      ...prev,
      panelClass: ['mention-pane', 'theme-dark'],
    };

    expect(isSameMentionControllerWire(prev, next, true, true)).toBe(true);
  });

  it('detects panelClass order/contents changes', () => {
    const prev: MentionControllerWire = {
      ...baseWire(),
      panelClass: ['mention-pane', 'theme-dark'],
    };
    const next: MentionControllerWire = {
      ...prev,
      panelClass: ['theme-dark', 'mention-pane'],
    };

    expect(isSameMentionControllerWire(prev, next, true, true)).toBe(false);
  });

  it('treats equal panelStyle objects as equivalent (shallow)', () => {
    const prev: MentionControllerWire = {
      ...baseWire(),
      panelStyle: { maxWidth: '24rem', borderRadius: '8px' },
    };
    const next: MentionControllerWire = {
      ...prev,
      panelStyle: { maxWidth: '24rem', borderRadius: '8px' },
    };

    expect(isSameMentionControllerWire(prev, next, true, true)).toBe(true);
  });

  it('detects panelStyle changes', () => {
    const prev: MentionControllerWire = {
      ...baseWire(),
      panelStyle: { maxWidth: '24rem', borderRadius: '8px' },
    };
    const next: MentionControllerWire = {
      ...prev,
      panelStyle: { maxWidth: '24rem', borderRadius: '4px' },
    };

    expect(isSameMentionControllerWire(prev, next, true, true)).toBe(false);
  });
});

import { Injector } from '@angular/core';
import { describe, expect, it } from 'vitest';

import type { MentionController } from './mention-controller.types';
import { createMentionPanelOutletInjector } from './mention-panel-outlet-injector';
import { NXR_MENTION_CONTROLLER } from './mention-panel-tokens';

describe('createMentionPanelOutletInjector', () => {
  it('provides NXR_MENTION_CONTROLLER for portaled panel templates', () => {
    const controller = {
      usesHoverPointerHighlight: () => true,
      setActiveIndex: () => undefined,
    } as MentionController<unknown>;

    const inj = createMentionPanelOutletInjector(Injector.NULL, controller);

    expect(inj.get(NXR_MENTION_CONTROLLER)).toBe(controller);
  });
});

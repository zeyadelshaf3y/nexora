import { Injector, type TemplateRef, type ViewContainerRef } from '@angular/core';
import { describe, expect, it } from 'vitest';

import type { MentionController } from './mention-controller.types';
import { NXR_MENTION_CONTROLLER, NXR_MENTION_PANEL_TEMPLATE } from './mention-panel-host.component';
import { createMentionPanelInjector, createMentionPanelPortal } from './mention-panel-portal';

describe('createMentionPanelInjector', () => {
  const parent = Injector.NULL;
  const controller = {} as MentionController<unknown>;
  const tpl = {} as TemplateRef<unknown>;

  it('provides controller and panel template', () => {
    const inj = createMentionPanelInjector(parent, controller, tpl);
    expect(inj.get(NXR_MENTION_CONTROLLER)).toBe(controller);
    expect(inj.get(NXR_MENTION_PANEL_TEMPLATE)).toBe(tpl);
  });
});

describe('createMentionPanelPortal', () => {
  it('returns a ComponentPortal', () => {
    const inj = Injector.NULL;
    const vcr = {} as ViewContainerRef;
    const portal = createMentionPanelPortal(vcr, inj);
    expect(portal.constructor.name).toBe('ComponentPortal');
  });
});

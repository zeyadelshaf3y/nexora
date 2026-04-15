import { Injector, type TemplateRef, type ViewContainerRef } from '@angular/core';
import { ComponentPortal } from '@nexora-ui/overlay';

import type { MentionController } from './mention-controller.types';
import {
  MentionPanelHostComponent,
  NXR_MENTION_CONTROLLER,
  NXR_MENTION_PANEL_TEMPLATE,
} from './mention-panel-host.component';

export function createMentionPanelInjector(
  parentInjector: Injector,
  controller: MentionController<unknown>,
  panelTemplateRef: TemplateRef<unknown>,
): Injector {
  return Injector.create({
    parent: parentInjector,
    providers: [
      { provide: NXR_MENTION_CONTROLLER, useValue: controller },
      { provide: NXR_MENTION_PANEL_TEMPLATE, useValue: panelTemplateRef },
    ],
  });
}

export function createMentionPanelPortal(
  viewContainerRef: ViewContainerRef,
  injector: Injector,
): ComponentPortal<unknown> {
  return new ComponentPortal(MentionPanelHostComponent as never, viewContainerRef, injector);
}

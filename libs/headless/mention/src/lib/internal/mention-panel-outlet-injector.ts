import { Injector, type Provider } from '@angular/core';

import type { MentionController } from './mention-controller.types';
import { NXR_MENTION_CONTROLLER } from './mention-panel-tokens';

/**
 * Injector for `ngTemplateOutletInjector` on {@link MentionPanelHostComponent} so panel
 * directives (e.g. `nxrMentionOption`) resolve {@link NXR_MENTION_CONTROLLER}.
 */
export function createMentionPanelOutletInjector(
  parent: Injector,
  controller: MentionController<unknown>,
  ...additionalProviders: Provider[]
): Injector {
  return Injector.create({
    parent,
    providers: [{ provide: NXR_MENTION_CONTROLLER, useValue: controller }, ...additionalProviders],
  });
}

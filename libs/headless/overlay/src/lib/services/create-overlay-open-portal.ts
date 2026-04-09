import type { Injector, TemplateRef, Type, ViewContainerRef } from '@angular/core';

import { ComponentPortal } from '../portal/component-portal';
import { TemplatePortal } from '../portal/template-portal';
import type { OverlayRef } from '../ref/overlay-ref';
import { isComponent } from '../utils/apply-component-bindings';

/**
 * Builds the portal used by {@link OverlayService.open} — template vs component, with optional injector factory.
 */
export function createOverlayOpenPortal(
  content: TemplateRef<unknown> | Type<unknown>,
  vcr: ViewContainerRef,
  injectorOrFactory: Injector | ((ref: OverlayRef) => Injector) | undefined,
  ref: OverlayRef,
): ComponentPortal<unknown> | TemplatePortal {
  if (!isComponent(content)) {
    return new TemplatePortal(content, vcr);
  }

  return new ComponentPortal(
    content,
    vcr,
    typeof injectorOrFactory === 'function' ? injectorOrFactory(ref) : injectorOrFactory,
  );
}

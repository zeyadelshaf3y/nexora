import { Injector, type TemplateRef, type Type, type ViewContainerRef } from '@angular/core';

import { ComponentPortal } from '../portal/component-portal';
import { TemplatePortal } from '../portal/template-portal';
import type { OverlayRef } from '../ref/overlay-ref';
import { OVERLAY_REF } from '../ref/overlay-ref-token';
import { isComponent } from '../utils/apply-component-bindings';

/**
 * Builds the portal used by {@link OverlayService.open} — template vs component.
 *
 * For component content, the {@link OVERLAY_REF} token is always provided so the opened component
 * can inject the ref and control its overlay. The injector parent is the user-supplied
 * `injectorOrFactory` when given, otherwise the `ViewContainerRef`'s own injector — so ordinary
 * opener/component-tree providers still resolve when no custom injector is passed.
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

  const userInjector =
    typeof injectorOrFactory === 'function' ? injectorOrFactory(ref) : injectorOrFactory;

  const injector = Injector.create({
    providers: [{ provide: OVERLAY_REF, useValue: ref }],
    parent: userInjector ?? vcr.injector,
  });

  return new ComponentPortal(content, vcr, injector);
}

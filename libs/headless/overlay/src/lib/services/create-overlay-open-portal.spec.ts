import { InjectionToken, Injector, type TemplateRef, type ViewContainerRef } from '@angular/core';
import { describe, expect, it, vi } from 'vitest';

import type { ComponentPortal } from '../portal/component-portal';
import { TemplatePortal } from '../portal/template-portal';
import type { OverlayRef } from '../ref/overlay-ref';
import { OVERLAY_REF } from '../ref/overlay-ref-token';

import { createOverlayOpenPortal } from './create-overlay-open-portal';

/** Reads the private injector ComponentPortal stores so we can assert what it provides. */
function getPortalInjector(portal: ComponentPortal<unknown>): Injector {
  return (portal as unknown as { injector: Injector }).injector;
}

describe('createOverlayOpenPortal', () => {
  const vcr = {} as ViewContainerRef;
  const overlayRef = { id: 'test-ref' } as OverlayRef;

  it('returns TemplatePortal for template content', () => {
    const tpl = {} as TemplateRef<unknown>;
    const portal = createOverlayOpenPortal(tpl, vcr, undefined, overlayRef);
    expect(portal).toBeInstanceOf(TemplatePortal);
  });

  it('returns ComponentPortal for component content', () => {
    class Panel {}
    const portal = createOverlayOpenPortal(Panel, vcr, undefined, overlayRef);
    expect(portal.constructor.name).toBe('ComponentPortal');
  });

  it('provides OVERLAY_REF to component content with no user injector', () => {
    class Panel {}
    const portal = createOverlayOpenPortal(
      Panel,
      vcr,
      undefined,
      overlayRef,
    ) as ComponentPortal<unknown>;
    expect(getPortalInjector(portal).get(OVERLAY_REF)).toBe(overlayRef);
  });

  it('falls back to the ViewContainerRef injector as parent when no user injector is passed', () => {
    class Panel {}
    const VCR_TOKEN = new InjectionToken<string>('VCR_TOKEN');
    const vcrInjector = Injector.create({
      providers: [{ provide: VCR_TOKEN, useValue: 'from-vcr' }],
    });
    const vcrWithInjector = { injector: vcrInjector } as unknown as ViewContainerRef;

    const portal = createOverlayOpenPortal(
      Panel,
      vcrWithInjector,
      undefined,
      overlayRef,
    ) as ComponentPortal<unknown>;

    const injector = getPortalInjector(portal);
    expect(injector.get(OVERLAY_REF)).toBe(overlayRef);
    expect(injector.get(VCR_TOKEN)).toBe('from-vcr');
  });

  it('resolves injector from factory with overlay ref and chains it as parent', () => {
    class Panel {}
    const USER_TOKEN = new InjectionToken<string>('USER_TOKEN');
    const factory = vi.fn((r: OverlayRef) => {
      expect(r).toBe(overlayRef);
      return Injector.create({ providers: [{ provide: USER_TOKEN, useValue: 'from-user' }] });
    });

    const portal = createOverlayOpenPortal(
      Panel,
      vcr,
      factory,
      overlayRef,
    ) as ComponentPortal<unknown>;

    expect(factory).toHaveBeenCalledTimes(1);
    const injector = getPortalInjector(portal);
    expect(injector.get(OVERLAY_REF)).toBe(overlayRef);
    expect(injector.get(USER_TOKEN)).toBe('from-user');
  });
});

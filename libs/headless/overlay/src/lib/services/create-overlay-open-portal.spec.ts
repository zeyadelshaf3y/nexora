import { Injector, type TemplateRef, type ViewContainerRef } from '@angular/core';
import { describe, expect, it, vi } from 'vitest';

import { TemplatePortal } from '../portal/template-portal';
import type { OverlayRef } from '../ref/overlay-ref';

import { createOverlayOpenPortal } from './create-overlay-open-portal';

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

  it('resolves injector from factory with overlay ref', () => {
    class Panel {}
    const child = Injector.NULL;
    const factory = vi.fn((r: OverlayRef) => {
      expect(r).toBe(overlayRef);
      return child;
    });
    createOverlayOpenPortal(Panel, vcr, factory, overlayRef);
    expect(factory).toHaveBeenCalledTimes(1);
  });
});

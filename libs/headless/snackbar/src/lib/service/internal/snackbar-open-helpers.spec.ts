import { Injector, type TemplateRef, type ViewContainerRef } from '@angular/core';
import { of } from 'rxjs';
import { describe, expect, it } from 'vitest';

import {
  SNACKBAR_CONTENT_CONTEXT,
  SNACKBAR_CONTENT_TEMPLATE,
  SNACKBAR_REF,
} from '../../ref/snackbar-tokens';

import {
  createSnackbarContentPortal,
  createSnackbarOpenInjector,
  SNACKBAR_OVERLAY_CLOSE_POLICY,
} from './snackbar-open-helpers';

describe('SNACKBAR_OVERLAY_CLOSE_POLICY', () => {
  it('disables modal-style close paths', () => {
    expect(SNACKBAR_OVERLAY_CLOSE_POLICY).toMatchObject({
      outside: 'none',
      escape: 'none',
      backdrop: 'none',
    });
  });
});

describe('createSnackbarOpenInjector', () => {
  const mockRef = {
    close: () => {},
    reposition: () => {},
    afterClosed: () => of(undefined),
    getPaneElement: () => null,
  };

  it('provides SNACKBAR_REF', () => {
    class Panel {}
    const parent = Injector.NULL;
    const inj = createSnackbarOpenInjector(Panel, { injector: parent }, mockRef);
    expect(inj.get(SNACKBAR_REF)).toBe(mockRef);
  });

  it('provides template tokens for TemplateRef content', () => {
    const tpl = {} as TemplateRef<unknown>;
    const parent = Injector.NULL;
    const inj = createSnackbarOpenInjector(tpl, { injector: parent, data: { x: 1 } }, mockRef);
    expect(inj.get(SNACKBAR_CONTENT_TEMPLATE)).toBe(tpl);
    expect(inj.get(SNACKBAR_CONTENT_CONTEXT)).toEqual({ x: 1 });
  });

  it('omits template tokens for component content', () => {
    class Panel {}
    const parent = Injector.NULL;
    const inj = createSnackbarOpenInjector(Panel, { injector: parent }, mockRef);
    expect(() => inj.get(SNACKBAR_CONTENT_TEMPLATE)).toThrow();
    expect(() => inj.get(SNACKBAR_CONTENT_CONTEXT)).toThrow();
  });
});

describe('createSnackbarContentPortal', () => {
  const vcr = {} as ViewContainerRef;
  const inj = Injector.NULL;

  it('returns ComponentPortal for component content', () => {
    class Panel {}
    expect(createSnackbarContentPortal(Panel, vcr, inj).constructor.name).toBe('ComponentPortal');
  });

  it('returns ComponentPortal for template content (host wrapper)', () => {
    const tpl = {} as TemplateRef<unknown>;
    expect(createSnackbarContentPortal(tpl, vcr, inj).constructor.name).toBe('ComponentPortal');
  });
});

import { Injector, ViewContainerRef } from '@angular/core';
import { describe, expect, it } from 'vitest';

import { resolveViewContainerRefFromExplicitOptions } from './resolve-view-container-ref';

describe('resolveViewContainerRefFromExplicitOptions', () => {
  it('returns viewContainerRef when set', () => {
    const vcr = {} as ViewContainerRef;
    expect(resolveViewContainerRefFromExplicitOptions({ viewContainerRef: vcr }, () => null)).toBe(
      vcr,
    );
  });

  it('returns VCR from injector when viewContainerRef is unset', () => {
    const vcr = {} as ViewContainerRef;
    const injector = Injector.create({
      providers: [{ provide: ViewContainerRef, useValue: vcr }],
    });
    expect(resolveViewContainerRefFromExplicitOptions({ injector }, () => null)).toBe(vcr);
  });

  it('calls fallback when no explicit source', () => {
    const fb = {} as ViewContainerRef;
    expect(resolveViewContainerRefFromExplicitOptions({}, () => fb)).toBe(fb);
  });

  it('prefers viewContainerRef over injector', () => {
    const primary = {} as ViewContainerRef;
    const secondary = {} as ViewContainerRef;
    const injector = Injector.create({
      providers: [{ provide: ViewContainerRef, useValue: secondary }],
    });
    expect(
      resolveViewContainerRefFromExplicitOptions(
        { viewContainerRef: primary, injector },
        () => null,
      ),
    ).toBe(primary);
  });
});

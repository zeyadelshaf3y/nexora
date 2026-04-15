import { Injector, type ViewContainerRef } from '@angular/core';
import { describe, expect, it } from 'vitest';

import {
  createTooltipContentHostPortal,
  resolveTooltipScrollStrategy,
  TOOLTIP_OVERLAY_CLOSE_POLICY,
} from './tooltip-trigger-overlay-helpers';

describe('createTooltipContentHostPortal', () => {
  it('returns a ComponentPortal', () => {
    const vcr = {} as ViewContainerRef;
    const parent = Injector.NULL;
    const portal = createTooltipContentHostPortal(vcr, parent, 'Hello', true);
    expect(portal.constructor.name).toBe('ComponentPortal');
  });
});

describe('resolveTooltipScrollStrategy', () => {
  it('returns RepositionScrollStrategy for reposition', () => {
    expect(resolveTooltipScrollStrategy('reposition').constructor.name).toBe(
      'RepositionScrollStrategy',
    );
  });

  it('returns NoopScrollStrategy for noop', () => {
    expect(resolveTooltipScrollStrategy('noop').constructor.name).toBe('NoopScrollStrategy');
  });
});

describe('TOOLTIP_OVERLAY_CLOSE_POLICY', () => {
  it('keeps tooltips non-modal for outside/backdrop', () => {
    expect(TOOLTIP_OVERLAY_CLOSE_POLICY).toMatchObject({
      escape: 'top',
      outside: 'none',
      backdrop: 'none',
    });
  });
});

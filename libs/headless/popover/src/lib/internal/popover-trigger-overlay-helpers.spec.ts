import { type TemplateRef, type Type, type ViewContainerRef } from '@angular/core';
import { describe, expect, it } from 'vitest';

import {
  createPopoverContentPortal,
  getPopoverDefaultClosePolicy,
  resolvePopoverAriaHasPopup,
  resolvePopoverScrollStrategy,
} from './popover-trigger-overlay-helpers';

describe('createPopoverContentPortal', () => {
  const vcr = {} as ViewContainerRef;

  it('returns TemplatePortal for template content', () => {
    expect(createPopoverContentPortal({} as TemplateRef<unknown>, vcr).constructor.name).toBe(
      'TemplatePortal',
    );
  });

  it('returns ComponentPortal for component content', () => {
    class Panel {}
    expect(createPopoverContentPortal(Panel as Type<unknown>, vcr).constructor.name).toBe(
      'ComponentPortal',
    );
  });
});

describe('resolvePopoverScrollStrategy', () => {
  it('returns CloseOnScrollStrategy when closeOnScroll is true', () => {
    const s = resolvePopoverScrollStrategy(true, 'noop');
    expect(s.constructor.name).toBe('CloseOnScrollStrategy');
  });

  it('returns RepositionScrollStrategy for reposition', () => {
    const s = resolvePopoverScrollStrategy(false, 'reposition');
    expect(s.constructor.name).toBe('RepositionScrollStrategy');
  });

  it('returns CloseOnScrollStrategy for close strategy', () => {
    const s = resolvePopoverScrollStrategy(false, 'close');
    expect(s.constructor.name).toBe('CloseOnScrollStrategy');
  });

  it('returns NoopScrollStrategy for noop', () => {
    const s = resolvePopoverScrollStrategy(false, 'noop');
    expect(s.constructor.name).toBe('NoopScrollStrategy');
  });
});

describe('getPopoverDefaultClosePolicy', () => {
  it('sets backdrop self when hasBackdrop', () => {
    expect(getPopoverDefaultClosePolicy(true)).toMatchObject({
      outside: 'top',
      escape: 'top',
      backdrop: 'self',
    });
  });

  it('sets backdrop none when no backdrop', () => {
    expect(getPopoverDefaultClosePolicy(false).backdrop).toBe('none');
  });
});

describe('resolvePopoverAriaHasPopup', () => {
  it('returns known popup roles verbatim', () => {
    expect(resolvePopoverAriaHasPopup('menu')).toBe('menu');
    expect(resolvePopoverAriaHasPopup('listbox')).toBe('listbox');
    expect(resolvePopoverAriaHasPopup('dialog')).toBe('dialog');
  });

  it('returns true for other roles', () => {
    expect(resolvePopoverAriaHasPopup('tooltip')).toBe('true');
  });
});

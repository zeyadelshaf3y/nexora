import { describe, expect, it } from 'vitest';

import { DefaultFocusStrategy } from '../focus/default-focus-strategy';
import { NoopFocusStrategy } from '../focus/noop-focus-strategy';
import { NoopScrollStrategy } from '../scroll/noop-scroll-strategy';
import { RepositionScrollStrategy } from '../scroll/reposition-scroll-strategy';

import {
  resolvePanelOverlayFocusStrategy,
  resolvePanelOverlayHasBackdrop,
  resolvePanelOverlayScrollStrategy,
} from './panel-overlay-modal-defaults';

describe('resolvePanelOverlayScrollStrategy', () => {
  it('returns explicit scrollStrategy when set', () => {
    const custom = new RepositionScrollStrategy();
    expect(resolvePanelOverlayScrollStrategy({ scrollStrategy: custom })).toBe(custom);
  });

  it('returns BlockScrollStrategy when hasBackdrop is true or undefined', () => {
    expect(resolvePanelOverlayScrollStrategy({ hasBackdrop: true }).constructor.name).toBe(
      'BlockScrollStrategy',
    );
    expect(resolvePanelOverlayScrollStrategy({}).constructor.name).toBe('BlockScrollStrategy');
    expect(resolvePanelOverlayScrollStrategy(undefined).constructor.name).toBe(
      'BlockScrollStrategy',
    );
  });

  it('returns NoopScrollStrategy when hasBackdrop is false', () => {
    const s = resolvePanelOverlayScrollStrategy({ hasBackdrop: false });
    expect(s).toBeInstanceOf(NoopScrollStrategy);
  });
});

describe('resolvePanelOverlayFocusStrategy', () => {
  it('returns explicit focusStrategy when set', () => {
    const custom = new NoopFocusStrategy();
    expect(resolvePanelOverlayFocusStrategy({ focusStrategy: custom })).toBe(custom);
  });

  it('returns DefaultFocusStrategy by default', () => {
    expect(resolvePanelOverlayFocusStrategy({})).toBeInstanceOf(DefaultFocusStrategy);
    expect(resolvePanelOverlayFocusStrategy(undefined)).toBeInstanceOf(DefaultFocusStrategy);
  });
});

describe('resolvePanelOverlayHasBackdrop', () => {
  it('defaults to true', () => {
    expect(resolvePanelOverlayHasBackdrop({})).toBe(true);
    expect(resolvePanelOverlayHasBackdrop(undefined)).toBe(true);
  });

  it('respects false', () => {
    expect(resolvePanelOverlayHasBackdrop({ hasBackdrop: false })).toBe(false);
  });
});

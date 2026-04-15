import { NoopScrollStrategy } from '@nexora-ui/overlay';

import type { DropdownRefOptions } from './dropdown-ref-options';
import {
  buildDropdownOverlayConfig,
  resolveDropdownOverlayOptions,
} from './dropdown-ref-overlay-config';

function minimalOptions(overrides: Partial<DropdownRefOptions> = {}): DropdownRefOptions {
  return {
    getAnchor: () => document.createElement('button'),
    overlay: {} as DropdownRefOptions['overlay'],
    ...overrides,
  };
}

describe('resolveDropdownOverlayOptions', () => {
  it('defaults placement to bottom for dropdown preset', () => {
    const r = resolveDropdownOverlayOptions(minimalOptions());
    expect(r.preset).toBe('dropdown');
    expect(r.placement).toBe('bottom');
  });

  it('defaults placement to bottom-start for menu preset', () => {
    const r = resolveDropdownOverlayOptions(minimalOptions({ configPreset: () => 'menu' }));

    expect(r.preset).toBe('menu');
    expect(r.placement).toBe('bottom-start');
  });
});

describe('buildDropdownOverlayConfig', () => {
  it('uses createMenuAnchoredConfig when preset is menu', () => {
    const anchor = document.createElement('button');
    Object.defineProperty(anchor, 'offsetWidth', { value: 120, configurable: true });

    const resolved = resolveDropdownOverlayOptions(
      minimalOptions({
        configPreset: () => 'menu',
        scrollStrategy: () => 'noop',
        closeAnimationDurationMs: () => 0,
      }),
    );

    const config = buildDropdownOverlayConfig(anchor, resolved);
    expect(config).toBeDefined();
    expect(config.positionStrategy).toBeDefined();
  });

  it('uses createDropdownAnchoredConfig when preset is dropdown', () => {
    const anchor = document.createElement('button');
    Object.defineProperty(anchor, 'offsetWidth', { value: 80, configurable: true });

    const resolved = resolveDropdownOverlayOptions(
      minimalOptions({
        scrollStrategy: () => 'noop',
        closeAnimationDurationMs: () => 0,
        maxHeight: () => '10rem',
      }),
    );

    const config = buildDropdownOverlayConfig(anchor, resolved);
    expect(config).toBeDefined();
    expect(config.maxHeight).toBe('10rem');
    expect(config.scrollStrategy).toBeInstanceOf(NoopScrollStrategy);
  });
});

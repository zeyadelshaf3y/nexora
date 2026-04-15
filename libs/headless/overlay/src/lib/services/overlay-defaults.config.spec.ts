import {
  mergeOverlayClassValue,
  mergeOverlayStyleValue,
  type OverlayClassMergeMode,
  type OverlayStyleMergeMode,
  resolveOverlayBackdropClassValue,
  resolveOverlayBackdropClassWithBase,
  resolveOverlayBackdropStyleValue,
} from './overlay-defaults.config';

describe('mergeOverlayClassValue', () => {
  it('replace mode prefers instance class when provided', () => {
    const mode: OverlayClassMergeMode = 'replace';
    expect(mergeOverlayClassValue('defaults', 'instance', mode)).toBe('instance');
  });

  it('replace mode falls back to defaults class when instance is absent', () => {
    const mode: OverlayClassMergeMode = 'replace';
    expect(mergeOverlayClassValue('defaults', undefined, mode)).toBe('defaults');
  });

  it('append mode combines defaults and instance classes', () => {
    const mode: OverlayClassMergeMode = 'append';
    expect(mergeOverlayClassValue(['defaults-a'], ['instance-b'], mode)).toEqual([
      'defaults-a',
      'instance-b',
    ]);
  });
});

describe('mergeOverlayStyleValue', () => {
  it('replace mode prefers instance style when provided', () => {
    const mode: OverlayStyleMergeMode = 'replace';
    expect(mergeOverlayStyleValue({ color: 'red' }, { color: 'blue' }, mode)).toEqual({
      color: 'blue',
    });
  });

  it('merge mode combines defaults and instance styles (instance wins key conflicts)', () => {
    const mode: OverlayStyleMergeMode = 'merge';
    expect(
      mergeOverlayStyleValue({ color: 'red', opacity: '0.7' }, { color: 'blue' }, mode),
    ).toEqual({ color: 'blue', opacity: '0.7' });
  });
});

describe('resolveOverlayBackdropClassValue', () => {
  it('resolves defaults + instance + alias backdrop classes', () => {
    expect(
      resolveOverlayBackdropClassValue({
        defaultsBackdropClass: 'defaults',
        instanceBackdropClass: 'instance',
        defaultsNxrBackdropClass: 'global-nxr',
        instanceNxrBackdropClass: 'instance-nxr',
        classMergeMode: 'append',
      }),
    ).toEqual(['defaults', 'instance', 'global-nxr', 'instance-nxr']);
  });
});

describe('resolveOverlayBackdropStyleValue', () => {
  it('resolves defaults + instance + alias backdrop styles', () => {
    expect(
      resolveOverlayBackdropStyleValue({
        defaultsBackdropStyle: { opacity: '0.5' },
        instanceBackdropStyle: { opacity: '0.7' },
        defaultsNxrBackdropStyles: { backdropFilter: 'blur(4px)' },
        instanceNxrBackdropStyles: { pointerEvents: 'auto' },
        styleMergeMode: 'merge',
      }),
    ).toEqual({
      opacity: '0.7',
      backdropFilter: 'blur(4px)',
      pointerEvents: 'auto',
    });
  });
});

describe('resolveOverlayBackdropClassWithBase', () => {
  it('always includes the base backdrop class and appends merged values', () => {
    expect(
      resolveOverlayBackdropClassWithBase({
        baseBackdropClass: 'base',
        defaultsBackdropClass: 'defaults',
        instanceBackdropClass: 'instance',
        defaultsNxrBackdropClass: 'global-nxr',
        instanceNxrBackdropClass: 'instance-nxr',
        classMergeMode: 'append',
      }),
    ).toEqual(['base', 'defaults', 'instance', 'global-nxr', 'instance-nxr']);
  });
});

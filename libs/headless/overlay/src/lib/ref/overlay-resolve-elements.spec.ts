import {
  overlayHasAnchorOption,
  overlayHasHostOption,
  resolveOverlayHost,
  resolveOverlayLazyElement,
  resolveOverlayLazyElementOrNull,
} from './overlay-resolve-elements';

describe('overlayHasAnchorOption', () => {
  it('is false without anchor', () => {
    expect(overlayHasAnchorOption({})).toBe(false);
  });

  it('is true when anchor is set', () => {
    expect(overlayHasAnchorOption({ anchor: document.createElement('button') })).toBe(true);
  });
});

describe('overlayHasHostOption', () => {
  it('is false without host', () => {
    expect(overlayHasHostOption({})).toBe(false);
  });

  it('is true when host is set', () => {
    expect(overlayHasHostOption({ host: document.createElement('div') })).toBe(true);
  });
});

describe('resolveOverlayHost', () => {
  it('returns global container when host is unset', () => {
    const global = document.createElement('div');
    expect(resolveOverlayHost(undefined, global)).toBe(global);
  });

  it('resolves element or callback', () => {
    const global = document.createElement('div');
    const host = document.createElement('section');
    expect(resolveOverlayHost(host, global)).toBe(host);
    expect(resolveOverlayHost(() => host, global)).toBe(host);
  });
});

describe('resolveOverlayLazyElement', () => {
  it('returns undefined when unset', () => {
    expect(resolveOverlayLazyElement(undefined)).toBeUndefined();
  });

  it('resolves element or callback', () => {
    const el = document.createElement('span');
    expect(resolveOverlayLazyElement(el)).toBe(el);
    expect(resolveOverlayLazyElement(() => el)).toBe(el);
  });
});

describe('resolveOverlayLazyElementOrNull', () => {
  it('returns null when unset', () => {
    expect(resolveOverlayLazyElementOrNull(undefined)).toBeNull();
  });

  it('resolves element or callback', () => {
    const el = document.createElement('span');
    expect(resolveOverlayLazyElementOrNull(el)).toBe(el);
    expect(resolveOverlayLazyElementOrNull(() => el)).toBe(el);
  });
});

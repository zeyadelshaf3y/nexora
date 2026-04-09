import { getResolvedDir } from './get-resolved-dir';

describe('getResolvedDir', () => {
  it('returns ltr when element has no dir and document has no dir', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    expect(getResolvedDir(el)).toBe('ltr');
    document.body.removeChild(el);
  });

  it('returns rtl when element has dir="rtl"', () => {
    const el = document.createElement('div');
    el.setAttribute('dir', 'rtl');
    document.body.appendChild(el);
    expect(getResolvedDir(el)).toBe('rtl');
    document.body.removeChild(el);
  });

  it('returns rtl when ancestor has dir="rtl"', () => {
    const parent = document.createElement('div');
    parent.setAttribute('dir', 'rtl');
    const child = document.createElement('span');
    parent.appendChild(child);
    document.body.appendChild(parent);
    expect(getResolvedDir(child)).toBe('rtl');
    document.body.removeChild(parent);
  });

  it('returns ltr when element has dir="ltr"', () => {
    const el = document.createElement('div');
    el.setAttribute('dir', 'ltr');
    document.body.appendChild(el);
    expect(getResolvedDir(el)).toBe('ltr');
    document.body.removeChild(el);
  });

  it('uses document element when element is undefined', () => {
    expect(getResolvedDir(undefined)).toBe('ltr');
  });

  it('uses document element when element is null', () => {
    expect(getResolvedDir(null)).toBe('ltr');
  });
});

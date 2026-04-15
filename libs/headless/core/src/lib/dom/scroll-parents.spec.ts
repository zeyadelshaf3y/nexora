import { scrollParents } from './scroll-parents';

describe('scrollParents', () => {
  it('returns empty array for null', () => {
    expect(scrollParents(null)).toEqual([]);
  });

  it('returns empty array for undefined', () => {
    expect(scrollParents(undefined)).toEqual([]);
  });

  it('returns empty array for a detached element with no parent', () => {
    const el = document.createElement('div');
    expect(scrollParents(el)).toEqual([]);
  });

  it('detects a scrollable parent', () => {
    const parent = document.createElement('div');
    parent.style.overflow = 'auto';
    const child = document.createElement('div');
    parent.appendChild(child);
    document.body.appendChild(parent);

    const result = scrollParents(child);
    expect(result).toContain(parent);

    document.body.removeChild(parent);
  });

  it('does not include non-scrollable parents', () => {
    const outer = document.createElement('div');
    outer.style.overflow = 'visible';
    const inner = document.createElement('div');
    outer.appendChild(inner);
    document.body.appendChild(outer);

    const result = scrollParents(inner);
    expect(result).not.toContain(outer);

    document.body.removeChild(outer);
  });
});

import { contains } from './contains';

describe('contains', () => {
  it('returns false when container is null', () => {
    expect(contains(null, document.body)).toBe(false);
  });

  it('returns false when node is null', () => {
    expect(contains(document.body, null)).toBe(false);
  });

  it('returns true when container equals node', () => {
    const el = document.createElement('div');
    expect(contains(el, el)).toBe(true);
  });

  it('returns true when container is an ancestor of node', () => {
    const parent = document.createElement('div');
    const child = document.createElement('span');
    parent.appendChild(child);
    expect(contains(parent, child)).toBe(true);
  });

  it('returns false when container does not contain node', () => {
    const a = document.createElement('div');
    const b = document.createElement('div');
    expect(contains(a, b)).toBe(false);
  });
});

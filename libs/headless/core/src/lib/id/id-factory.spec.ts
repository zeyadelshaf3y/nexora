import { idFactory } from './id-factory';

describe('idFactory', () => {
  it('returns createId directly when no prefix is given', () => {
    const nextId = idFactory();
    const id = nextId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('prefixes generated ids with the given prefix', () => {
    const nextId = idFactory('popover-panel');
    const id = nextId();
    expect(id.startsWith('popover-panel-')).toBe(true);
  });

  it('produces unique ids from the same factory', () => {
    const nextId = idFactory('test');
    const a = nextId();
    const b = nextId();
    expect(a).not.toBe(b);
  });
});

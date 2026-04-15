import { getGlobal } from './get-global';

describe('getGlobal', () => {
  it('returns the window object in a browser-like environment', () => {
    expect(getGlobal()).toBe(window);
  });
});

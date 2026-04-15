import { canUseDOM } from './can-use-dom';

describe('canUseDOM', () => {
  it('returns true in a browser-like environment', () => {
    expect(canUseDOM()).toBe(true);
  });
});

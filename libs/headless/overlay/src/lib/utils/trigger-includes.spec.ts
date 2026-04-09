import { triggerIncludes } from './trigger-includes';

describe('triggerIncludes', () => {
  it('returns true when value is the same as trigger', () => {
    expect(triggerIncludes('hover', 'hover')).toBe(true);
    expect(triggerIncludes('click', 'click')).toBe(true);
  });

  it('returns false when value is different from trigger', () => {
    expect(triggerIncludes('hover', 'focus')).toBe(false);
    expect(triggerIncludes('click', 'hover')).toBe(false);
  });

  it('returns true when trigger is in array', () => {
    expect(triggerIncludes(['hover', 'focus'], 'hover')).toBe(true);
    expect(triggerIncludes(['hover', 'focus'], 'focus')).toBe(true);
  });

  it('returns false when trigger is not in array', () => {
    expect(triggerIncludes(['hover', 'focus'], 'click')).toBe(false);
  });
});

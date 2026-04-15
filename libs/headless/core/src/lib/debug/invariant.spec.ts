import { invariant } from './invariant';

describe('invariant', () => {
  it('does not throw when condition is truthy', () => {
    expect(() => invariant(true, 'ok')).not.toThrow();
    expect(() => invariant(1, 'ok')).not.toThrow();
    expect(() => invariant('non-empty', 'ok')).not.toThrow();
    expect(() => invariant({}, 'ok')).not.toThrow();
  });

  it('throws an Error with [nexora] prefix when condition is falsy', () => {
    expect(() => invariant(false, 'something broke')).toThrow('[nexora] something broke');
  });

  it('throws for null condition', () => {
    expect(() => invariant(null, 'null check')).toThrow('[nexora] null check');
  });

  it('throws for undefined condition', () => {
    expect(() => invariant(undefined, 'undefined check')).toThrow('[nexora] undefined check');
  });

  it('throws for 0 condition', () => {
    expect(() => invariant(0, 'zero')).toThrow('[nexora] zero');
  });

  it('throws for empty string condition', () => {
    expect(() => invariant('', 'empty')).toThrow('[nexora] empty');
  });
});

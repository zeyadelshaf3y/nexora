import { mergeClosePolicy } from './close-policy';

describe('mergeClosePolicy', () => {
  it('returns default policy when partial is undefined', () => {
    const result = mergeClosePolicy(undefined);
    expect(result).toEqual({
      escape: 'top',
      outside: 'top',
      backdrop: 'self',
    });
  });

  it('merges partial overrides with defaults', () => {
    const result = mergeClosePolicy({ escape: 'none' });
    expect(result.escape).toBe('none');
    expect(result.outside).toBe('top');
    expect(result.backdrop).toBe('self');
  });

  it('treats backdrop as none when hasBackdrop is false', () => {
    const result = mergeClosePolicy(undefined, false);
    expect(result.backdrop).toBe('none');
  });
});

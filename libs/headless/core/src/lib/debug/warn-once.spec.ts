import { warnOnce } from './warn-once';

describe('warnOnce', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('logs a warning with [nexora] prefix', () => {
    warnOnce('test-key-1', 'some warning');
    expect(warnSpy).toHaveBeenCalledWith('[nexora] some warning');
  });

  it('only warns once per key', () => {
    warnOnce('test-key-2', 'first');
    warnOnce('test-key-2', 'second');
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('warns separately for different keys', () => {
    warnOnce('test-key-3', 'msg A');
    warnOnce('test-key-4', 'msg B');
    expect(warnSpy).toHaveBeenCalledTimes(2);
  });
});

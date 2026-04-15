import { MentionSessionCheckScheduler } from './mention-session-check-scheduler';

describe('MentionSessionCheckScheduler', () => {
  it('runs immediately when coalescing is disabled', () => {
    const run = vi.fn();
    const scheduler = new MentionSessionCheckScheduler<string>((payload) => run(payload));

    scheduler.schedule(false, 'now');

    expect(run).toHaveBeenCalledTimes(1);
    expect(run).toHaveBeenCalledWith('now');
  });

  it('coalesces bursts and flushes latest payload', async () => {
    const run = vi.fn();
    const scheduler = new MentionSessionCheckScheduler<string>((payload) => run(payload));

    scheduler.schedule(true, 'first');
    scheduler.schedule(true, 'second');
    scheduler.schedule(true, 'latest');
    await Promise.resolve();

    expect(run).toHaveBeenCalledTimes(1);
    expect(run).toHaveBeenCalledWith('latest');
  });

  it('reset drops pending payload', async () => {
    const run = vi.fn();
    const scheduler = new MentionSessionCheckScheduler<string>((payload) => run(payload));

    scheduler.schedule(true, 'pending');
    scheduler.reset();
    await Promise.resolve();

    expect(run).toHaveBeenCalledTimes(1);
    expect(run).toHaveBeenCalledWith(undefined);
  });
});

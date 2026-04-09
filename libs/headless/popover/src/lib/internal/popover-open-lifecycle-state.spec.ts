import { ATTACH_RESOLUTION, PopoverOpenLifecycleState } from './popover-open-lifecycle-state';

describe('PopoverOpenLifecycleState', () => {
  it('gates opening by destroy/opening/existing-overlay conditions', () => {
    const state = new PopoverOpenLifecycleState();
    expect(state.canStartOpen(false)).toBe(true);

    state.startOpen('click');
    expect(state.canStartOpen(false)).toBe(false);
    expect(state.resolveAttach(true, false)).toBe(ATTACH_RESOLUTION.READY);
    expect(state.canStartOpen(true)).toBe(false);
  });

  it('returns destroyed and clears openedBy when destroyed before attach resolves', () => {
    const state = new PopoverOpenLifecycleState();
    state.startOpen('hover');
    state.markDestroyed();

    expect(state.resolveAttach(true, false)).toBe(ATTACH_RESOLUTION.DESTROYED);
    expect(state.getOpenedBy()).toBeNull();
  });

  it('returns not-opened and already-open branches', () => {
    const state = new PopoverOpenLifecycleState();
    state.startOpen('focus');
    expect(state.resolveAttach(false, false)).toBe(ATTACH_RESOLUTION.NOT_OPENED);
    expect(state.getOpenedBy()).toBeNull();

    state.startOpen('click');
    expect(state.resolveAttach(true, true)).toBe(ATTACH_RESOLUTION.ALREADY_OPEN);
    expect(state.getOpenedBy()).toBeNull();
  });
});

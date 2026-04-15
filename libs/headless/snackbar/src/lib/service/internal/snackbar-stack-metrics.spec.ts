import { SnackbarStackMetrics } from './snackbar-stack-metrics';

describe('SnackbarStackMetrics', () => {
  it('tracks and untracks pane heights by ref', () => {
    const metrics = new SnackbarStackMetrics<object>();
    const ref = {};
    const pane = document.createElement('div');
    Object.defineProperty(pane, 'offsetHeight', { value: 42, configurable: true });

    metrics.trackPane(ref, pane);
    expect(metrics.getHeight(ref)).toBe(42);

    metrics.untrackPane(ref);
    expect(metrics.getHeight(ref)).toBeUndefined();
  });
});

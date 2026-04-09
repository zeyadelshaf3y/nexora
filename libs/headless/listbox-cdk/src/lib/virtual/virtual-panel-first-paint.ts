import { type Injector, afterNextRender } from '@angular/core';

export type VirtualPanelFirstPaintOptions = {
  /** CDK `checkViewportSize` (or equivalent) so the virtual strategy sees non-zero geometry. */
  measure: () => void;
  /** Runs after each `measure` in this sequence and again after the trailing `requestAnimationFrame` (e.g. sync scroll to `initialSelectedIndex`). */
  afterMeasure?: () => void;
};

/**
 * Schedules measurement after the first stable render, then optionally re-measures on the next frame.
 * Portaled CDK viewports often read 0×0 on the first tick; without this, virtual rows never appear.
 */
export function afterVirtualPanelFirstPaint(
  injector: Injector,
  options: VirtualPanelFirstPaintOptions,
): void {
  const { measure, afterMeasure } = options;
  afterNextRender(
    () => {
      measure();
      if (afterMeasure) {
        afterMeasure();
        requestAnimationFrame(() => {
          measure();
          afterMeasure();
        });
      } else {
        requestAnimationFrame(() => measure());
      }
    },
    { injector },
  );
}

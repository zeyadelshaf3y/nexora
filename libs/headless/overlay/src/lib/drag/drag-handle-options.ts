/** Optional behavior when registering a drag handle on the dismiss core or snap handler. */
export interface DragHandleRegisterOptions {
  /**
   * When set, pointerdown is ignored unless this returns true.
   * Used by `dragFrom: 'pane'` to skip interactive descendants.
   */
  readonly shouldInitiateDrag?: (event: PointerEvent) => boolean;
}

/** Shared drag-to-close configuration (drawer v1; snackbar future). */
export interface DrawerSnapConfig {
  /**
   * Size along the expand axis when the drawer opens (height for top/bottom, width for start/end).
   * Example: `'200px'`, `'40vh'`.
   */
  readonly initialSize: string;
  /**
   * Max size when expanded via drag. Defaults to viewport fill along the axis (respecting max-* caps).
   * Example: `'60vh'`, `'min(400px, 80vw)'` is not parsed — use explicit px/vh/vw.
   */
  readonly expandedSize?: string;
}

export interface DragToCloseConfig {
  /** Fraction of pane size along dismiss axis (0–1). Default: 0.25 */
  readonly threshold?: number;
  /** Min velocity (px/ms) along dismiss axis to close. Default: 0.4 */
  readonly minVelocity?: number;
  /**
   * Enables mobile-style snap: open at `initialSize`, drag to expand, partial dismiss snaps back,
   * full dismiss closes. Requires `nxrDrawerDragHandle`.
   */
  readonly snap?: DrawerSnapConfig;
}

export interface ResolvedDragToCloseConfig {
  readonly threshold: number;
  readonly minVelocity: number;
  readonly snap?: DrawerSnapConfig;
}

export const DEFAULT_DRAG_TO_CLOSE_THRESHOLD = 0.25;
export const DEFAULT_DRAG_TO_CLOSE_MIN_VELOCITY = 0.4;

/** Resolves open-option `dragToClose` to config, or null when disabled. */
export function resolveDragToCloseConfig(
  value: boolean | DragToCloseConfig | undefined,
): ResolvedDragToCloseConfig | null {
  if (!value) return null;

  const resolved =
    value === true
      ? {
          threshold: DEFAULT_DRAG_TO_CLOSE_THRESHOLD,
          minVelocity: DEFAULT_DRAG_TO_CLOSE_MIN_VELOCITY,
        }
      : {
          threshold: value.threshold ?? DEFAULT_DRAG_TO_CLOSE_THRESHOLD,
          minVelocity: value.minVelocity ?? DEFAULT_DRAG_TO_CLOSE_MIN_VELOCITY,
        };

  return {
    threshold: clampThreshold(resolved.threshold),
    minVelocity: Math.max(0, resolved.minVelocity),
    ...(value !== true && value.snap ? { snap: value.snap } : {}),
  };
}

function clampThreshold(threshold: number): number {
  if (threshold <= 0) return DEFAULT_DRAG_TO_CLOSE_THRESHOLD;
  if (threshold >= 1) return 1;

  return threshold;
}

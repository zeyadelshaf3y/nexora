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

export type DrawerDragFrom = 'handle' | 'pane';

export interface DragToCloseConfig {
  /** Fraction of pane size along dismiss axis (0–1). Default: 0.25 */
  readonly threshold?: number;
  /** Min velocity (px/ms) along dismiss axis to close. Default: 0.4 */
  readonly minVelocity?: number;
  /**
   * Where drag may start.
   *
   * - `'handle'` (default): requires `nxrDrawerDragHandle` in content. Recommended for touch and
   *   scrollable drawers.
   * - `'pane'`: drag from anywhere on the drawer except interactive elements. Best for pointer/mouse
   *   on non-scrollable content; does not coexist reliably with touch scrolling inside the pane.
   */
  readonly dragFrom?: DrawerDragFrom;
  /**
   * Enables mobile-style snap: open at `initialSize`, drag to expand, partial dismiss snaps back,
   * full dismiss closes. Works with `dragFrom: 'handle'` or `'pane'`.
   */
  readonly snap?: DrawerSnapConfig;
}

export interface ResolvedDragToCloseConfig {
  readonly threshold: number;
  readonly minVelocity: number;
  readonly dragFrom: DrawerDragFrom;
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
          dragFrom: 'handle' as const,
        }
      : {
          threshold: value.threshold ?? DEFAULT_DRAG_TO_CLOSE_THRESHOLD,
          minVelocity: value.minVelocity ?? DEFAULT_DRAG_TO_CLOSE_MIN_VELOCITY,
          dragFrom: value.dragFrom ?? ('handle' as const),
        };

  return {
    threshold: clampThreshold(resolved.threshold),
    minVelocity: Math.max(0, resolved.minVelocity),
    dragFrom: resolved.dragFrom,
    ...(value !== true && value.snap ? { snap: value.snap } : {}),
  };
}

function clampThreshold(threshold: number): number {
  if (threshold <= 0) return DEFAULT_DRAG_TO_CLOSE_THRESHOLD;
  if (threshold >= 1) return 1;

  return threshold;
}

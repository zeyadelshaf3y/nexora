/**
 * Central overlay defaults. Single source of truth for magic numbers used across
 * overlay, tooltip, popover, and snackbar so behavior stays consistent.
 * @internal
 */

/** Default arrow width (px). Typical border-based triangle. */
export const DEFAULT_ARROW_WIDTH = 12;
/** Default arrow height (px). */
export const DEFAULT_ARROW_HEIGHT = 6;

/** Default duration (ms) to wait for close transition before detaching. */
export const DEFAULT_CLOSE_ANIMATION_MS = 300;

/** Base z-index for the overlay stack; topmost overlay gets this + stack depth. */
export const BASE_Z_INDEX = 1000;

/** Default open delay (ms) for tooltip. Popover uses 0 by default. */
export const DEFAULT_OPEN_DELAY_MS = 200;
/** Default hover-close delay (ms) when no explicit close delay is set. */
export const DEFAULT_HOVER_CLOSE_DELAY_MS = 100;
/** Default focus-close delay (ms) for popover when no explicit close delay is set. */
export const DEFAULT_FOCUS_CLOSE_DELAY_MS = 150;
/** Default viewport-edge padding (px) for snackbar and similar. */
export const DEFAULT_VIEWPORT_PADDING = 16;
/** Duration (ms) after a tooltip closes during which the next tooltip skips open delay (warmup). */
export const WARMUP_SKIP_DELAY_MS = 1000;

/**
 * Shared CSS for the arrow host element (tooltip/popover). Use with class "nxr-overlay-arrow-host".
 * Dimensions use CSS variables so consumers can override; default matches DEFAULT_ARROW_*.
 */
export const ARROW_HOST_STYLES = `
  .nxr-overlay-arrow-host {
    width: var(--nxr-arrow-width, 12px);
    height: var(--nxr-arrow-height, 6px);
    clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
    box-sizing: border-box;
  }
`;

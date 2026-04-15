/**
 * Data attribute and values used to mark overlay DOM nodes.
 * Use these for setting attributes and building selectors (e.g. in tests or for closest()).
 */

export const DATA_ATTR_OVERLAY = 'data-nxr-overlay';

export const OVERLAY_KIND_CONTAINER = 'container';
export const OVERLAY_KIND_PANE = 'pane';
export const OVERLAY_KIND_BACKDROP = 'backdrop';
export const OVERLAY_KIND_VIEW_HOST = 'view-host';

export const DATA_ATTR_STATE = 'data-state';
export const OVERLAY_STATE_OPEN = 'open';

export const DATA_ATTR_SCOPE = 'data-scope';

/** Selector for overlay pane elements. Use with querySelector, closest, etc. */
export const OVERLAY_SELECTOR_PANE = `[${DATA_ATTR_OVERLAY}="${OVERLAY_KIND_PANE}"]`;

/** Data attribute for generic hover-bridge element. */
export const DATA_ATTR_HOVER_BRIDGE = 'data-nxr-hover-bridge';
/** Data attribute for popover hover-bridge. Use when attaching bridge in popover trigger. */
export const DATA_ATTR_POPOVER_BRIDGE = 'data-nxr-popover-bridge';
/** Data attribute for tooltip hover-bridge. Use when attaching bridge in tooltip trigger. */
export const DATA_ATTR_TOOLTIP_BRIDGE = 'data-nxr-tooltip-bridge';

/** Selector for hover-bridge elements (any variant). Used to keep parent open when cursor is over a nested bridge. */
export const OVERLAY_SELECTOR_BRIDGE = `[${DATA_ATTR_HOVER_BRIDGE}], [${DATA_ATTR_POPOVER_BRIDGE}], [${DATA_ATTR_TOOLTIP_BRIDGE}]`;

/** Pane id prefix for popover (used in aria-controls and pane id). */
export const PANE_ID_PREFIX_POPOVER = 'nxr-popover-pane';
/** Pane id prefix for tooltip (used in aria-describedby and pane id). */
export const PANE_ID_PREFIX_TOOLTIP = 'nxr-tooltip';

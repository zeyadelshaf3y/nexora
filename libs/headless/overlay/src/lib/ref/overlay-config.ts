import type { FocusStrategy } from '../focus/focus-strategy';
import type { PositionStrategy } from '../position/position-strategy';
import type { ScrollStrategy } from '../scroll/scroll-strategy';

import type { ClosePolicy } from './close-policy';
import type { CloseReason } from './close-reason';
import type { OverlayRef } from './overlay-ref';

/** Called before opening. Return false (or Promise resolving to false) to prevent opening. */
export type BeforeOpenCallback = () => boolean | undefined | Promise<boolean | undefined>;

/** Called before closing. Return false (or Promise resolving to false) to prevent closing. */
export type BeforeCloseCallback = (
  reason: CloseReason,
) => boolean | undefined | Promise<boolean | undefined>;

/* ────────────────────────────────────────────────────────────────────────── */
/*  Panel dimension & styling primitives                                     */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * Pane size constraints shared by {@link OverlayConfig} and the service-level
 * open-option interfaces (`DialogOpenOptions`, `DrawerOpenOptions`).
 *
 * The engine always caps max dimensions to `100vw`/`100vh`. When values are
 * provided, they are wrapped in `min(value, 100vw/100vh)`. When omitted,
 * the viewport cap (`100vw`/`100vh`) is applied as the default.
 */
export interface PanelDimensionOptions {
  /** Explicit pane width (e.g. `'400px'`, `'80vw'`). Default: auto (content-based). */
  readonly width?: string;
  /** Explicit pane height (e.g. `'300px'`, `'60vh'`). Default: auto (content-based). */
  readonly height?: string;
  /** Minimum pane width (e.g. `'200px'`). */
  readonly minWidth?: string;
  /** Minimum pane height (e.g. `'100px'`). */
  readonly minHeight?: string;
  /** Maximum pane width. Always viewport-capped at `100vw`. */
  readonly maxWidth?: string;
  /** Maximum pane height. Always viewport-capped at `100vh`. */
  readonly maxHeight?: string;
}

/**
 * CSS class / inline style options for the overlay pane and backdrop.
 *
 * Prefer `panelClass` / `backdropClass` for styling; use `panelStyle` /
 * `backdropStyle` only for one-off inline overrides.
 */
export interface PanelStylingOptions {
  /**
   * CSS class(es) for the overlay pane. Pane also has `.nxr-overlay-pane` and
   * `data-placement` (e.g. `"dialog-center"`, `"drawer-end"`) for targeting.
   */
  readonly panelClass?: string | string[];
  /** CSS class(es) for the backdrop. Backdrop has `.nxr-overlay-backdrop`. */
  readonly backdropClass?: string | string[];
  /** Alias for `backdropClass` used by component/directive-level APIs (`nxrBackdropClass`). */
  readonly nxrBackdropClass?: string | string[];
  /** Inline styles for the pane. Prefer `panelClass` for full control. */
  readonly panelStyle?: Record<string, string>;
  /** Inline styles for the backdrop. Prefer `backdropClass` for full control. */
  readonly backdropStyle?: Record<string, string>;
  /** Alias for `backdropStyle` used by component/directive-level APIs (`nxrBackdropStyles`). */
  readonly nxrBackdropStyles?: Record<string, string>;
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  OverlayConfig                                                            */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * Immutable configuration for creating an overlay.
 * Passed to {@link OverlayService.create} or used when opening via dialog/drawer services.
 */
export interface OverlayConfig extends PanelDimensionOptions, PanelStylingOptions {
  /** Optional; auto-generated if omitted; must be unique when provided. */
  readonly id?: string;
  /** When set, scopeId defaults to parentRef.scopeId. */
  readonly parentRef?: OverlayRef;
  /** Explicit scope; if absent, derived from parentRef?.scopeId ?? 'global'. */
  readonly scopeId?: string;
  /** When closed by non-escape triggers: close only this or all in scope. */
  readonly closeScope?: 'top-only' | 'all-in-scope';
  /** Merged with DEFAULT_CLOSE_POLICY. */
  readonly closePolicy?: Partial<ClosePolicy>;
  /** How the overlay is positioned (e.g. center, anchored to trigger). */
  readonly positionStrategy: PositionStrategy;
  /** How document scroll is handled while open (e.g. block, noop). */
  readonly scrollStrategy: ScrollStrategy;
  /** Focus behavior on open/close (e.g. trap, restore). */
  readonly focusStrategy: FocusStrategy;
  /** Whether to show a backdrop. */
  readonly hasBackdrop?: boolean;
  /**
   * ARIA role for the pane (e.g. `'dialog'`, `'alertdialog'`, `'menu'`).
   * When omitted and hasBackdrop is true, defaults to `'dialog'` for modal overlays.
   */
  readonly ariaRole?: string;
  /**
   * Whether the overlay is modal (aria-modal). When true, screen readers treat content outside as inert.
   * When omitted and hasBackdrop is true, defaults to true.
   */
  readonly ariaModal?: boolean;
  /**
   * Overlay pane (and backdrop) attached here instead of global container.
   * When set, positioning viewport = this element's rect (dialog stays inside it).
   * Use for dashboards so the dialog opens in the content area, not over header/sidebar.
   */
  readonly host?: HTMLElement | (() => HTMLElement);
  /**
   * Element that counts as "inside" for outside-click: clicks inside this element do not close the overlay.
   * Use the dashboard root (header + sidebar + content) so clicks on header/sidebar do not close a dialog
   * that is scoped to the content area via {@link host}.
   */
  readonly outsideClickBoundary?: HTMLElement | (() => HTMLElement);
  /** Anchor element for position strategies (e.g. AnchoredStrategy). */
  readonly anchor?: HTMLElement | (() => HTMLElement);
  /**
   * When set, the pane's transform-origin is set to this element's center
   * before the enter animation, so a scale-up appears to grow from the trigger.
   */
  readonly transformOriginElement?: HTMLElement | (() => HTMLElement);
  /**
   * When set, this overlay uses this z-index instead of the stack default (base + order).
   * Use to force a specific overlay above others. The global base is set via
   * {@link OVERLAY_BASE_Z_INDEX} so all overlays sit above app chrome (e.g. header/sidebar).
   */
  readonly zIndex?: number;
  /**
   * Duration in ms to wait for close animation before detaching. `0` = instant.
   * Default: `300`.
   */
  readonly closeAnimationDurationMs?: number;
  /** Called before attaching. Return `false` to prevent opening. */
  readonly beforeOpen?: BeforeOpenCallback;
  /** Called before closing. Return `false` to prevent closing. */
  readonly beforeClose?: BeforeCloseCallback;
  /**
   * Arrow dimensions (px) for anchored overlays. Omit to use default 12×6.
   * Only applied when the position strategy returns `arrowOffset`.
   */
  readonly arrowSize?: ArrowSize;
  /**
   * Accessible label for the overlay pane. Applied as `aria-label` attribute.
   * Use when the overlay content does not contain a visible heading.
   */
  readonly ariaLabel?: string;
  /**
   * ID of the element that labels the overlay pane. Applied as `aria-labelledby` attribute.
   * Use when a visible heading already exists inside the overlay content.
   */
  readonly ariaLabelledBy?: string;
  /**
   * Only for reposition scroll strategy. When true (default), keep the panel in the viewport
   * (reposition/flip). When false, let the panel follow the trigger off-screen.
   */
  readonly maintainInViewport?: boolean;
  /**
   * Viewport inset in px. Panel max dimensions are capped to (viewport - boundaries).
   * E.g. maxHeight = viewport.height - (top ?? 0) - (bottom ?? 0).
   */
  readonly boundaries?: ViewportBoundaries;
}

export interface ArrowSize {
  readonly width: number;
  readonly height: number;
}

/**
 * Viewport inset in px. Effective viewport = viewport rect minus these insets.
 * Used to cap panel max dimensions (e.g. maxHeight = viewport.height - top - bottom).
 */
export interface ViewportBoundaries {
  readonly top?: number;
  readonly right?: number;
  readonly bottom?: number;
  readonly left?: number;
}

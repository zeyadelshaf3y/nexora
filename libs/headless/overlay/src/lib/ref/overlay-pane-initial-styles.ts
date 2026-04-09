import type { OverlayConfig } from './overlay-config';
import {
  applyOverlayPaneA11yFromConfig,
  applyOverlayPaneSizingFromConfig,
} from './overlay-pane-from-config';
import {
  addClasses,
  applyStyles,
  BACKDROP_CLASS,
  BACKDROP_ENTERING_CLASS,
  PANE_CLASS,
  PANE_ENTERING_CLASS,
} from './overlay-pane-styling';
import { overlayHasHostOption } from './overlay-resolve-elements';

/**
 * Initial pane and backdrop classes and inline styles when the overlay is created.
 *
 * The pane is the outer wrapper for all user content. The engine applies:
 *  1. CSS classes — entering state class + consumer's `panelClass`
 *  2. Sizing constraints — `width`, `height`, `min*`, `max*` as inline styles
 *  3. Viewport caps — `max-width` and `max-height` are always set. Consumer values
 *     are wrapped in CSS `min(value, 100vw/100vh)`. When omitted, `100vw`/`100vh`
 *     is the default. For anchored overlays, {@link runOverlayPositionCycle}
 *     further refines `max-height` based on actual available viewport space.
 *  4. `panelStyle` — applied **last** as inline styles so it can override anything
 *
 * The engine intentionally does **not** set `overflow` or `display`. As a headless
 * library, layout and overflow are the consumer's responsibility via `panelClass` CSS.
 * Use `panelStyle` for inline overrides when CSS class specificity isn't enough.
 */
export function applyInitialOverlayPaneAndBackdropStyles(
  pane: HTMLElement,
  backdrop: HTMLElement | null,
  config: OverlayConfig,
): void {
  pane.classList.add(PANE_CLASS, PANE_ENTERING_CLASS);

  addClasses(pane, config.panelClass);

  applyOverlayPaneA11yFromConfig(pane, config);

  if (backdrop) {
    backdrop.classList.add(BACKDROP_CLASS, BACKDROP_ENTERING_CLASS);
    addClasses(backdrop, config.backdropClass);
    applyStyles(backdrop, config.backdropStyle);

    if (overlayHasHostOption(config)) {
      backdrop.style.position = 'absolute';
      backdrop.style.inset = '0';
      backdrop.style.zIndex = '0';
    }
  }

  if (overlayHasHostOption(config)) pane.style.zIndex = '1';

  applyOverlayPaneSizingFromConfig(pane, config);
  applyStyles(pane, config.panelStyle);
}

import type { Injector, ViewContainerRef } from '@angular/core';

import type { SnackbarPlacement } from '../position/snackbar-placement';

/** Shared sizing and behavior options for snackbars. */
interface SnackbarOpenOptionsCommon {
  /**
   * When set, snackbars are positioned inside this element (e.g. dashboard content area).
   * Positioning viewport = this element's rect; snackbars appear at the edge of the host instead of the full window.
   */
  host?: HTMLElement | (() => HTMLElement);
  /** Where to show the snackbar. Default `'bottom-end'`. */
  placement?: SnackbarPlacement;
  /**
   * Auto-close after this many ms. Set to `0` to disable (stays until user closes).
   * Default: `4000`.
   */
  duration?: number;
  viewContainerRef?: ViewContainerRef;
  injector?: Injector;
  /** CSS class(es) for the pane. */
  panelClass?: string | string[];
  panelStyle?: Record<string, string>;
  /**
   * Explicit panel width (e.g. `'320px'`). Default: auto (content-based).
   * Use `maxWidth` or `panelClass` to cap width to the viewport.
   */
  width?: string;
  /** Maximum panel width (e.g. `'400px'`). Capped by viewport. */
  maxWidth?: string;
  /** Gap between stacked snackbars at the same placement. Default: `8`. */
  stackGap?: number;
  /** Padding from viewport edge. Default: `16`. */
  padding?: number;
  /**
   * Ms to wait for close animation before detaching. `0` = instant.
   * Default: `0`.
   */
  closeAnimationDurationMs?: number;
  /**
   * When set, only one snackbar per groupId is shown (replace-by-group).
   * Omit to allow stacking.
   */
  groupId?: string;
  /** Accessible label for the snackbar pane. Applied as `aria-label`. */
  ariaLabel?: string;
  /** ID of the element that labels the snackbar pane. Applied as `aria-labelledby`. */
  ariaLabelledBy?: string;
}

/** Options when opening a snackbar with a component. */
export interface SnackbarOpenOptionsForComponent extends SnackbarOpenOptionsCommon {
  /** Inputs to pass to the component. */
  inputs?: Record<string, unknown>;
  /** Outputs to subscribe to. */
  outputs?: Record<string, (value: unknown) => void>;
}

/** Options when opening a snackbar with a template. */
export interface SnackbarOpenOptionsForTemplate extends SnackbarOpenOptionsCommon {
  /** Context for the template (e.g. `{ message, $implicit: ... }`). */
  data?: Record<string, unknown>;
}

export type SnackbarOpenOptions = SnackbarOpenOptionsForComponent & SnackbarOpenOptionsForTemplate;

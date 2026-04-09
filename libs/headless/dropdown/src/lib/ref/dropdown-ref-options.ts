/**
 * Option types for {@link DropdownRef}. Kept separate from overlay config helpers
 * so resolution/build logic can import them without circular dependencies.
 */

import type { DestroyRef } from '@angular/core';
import type {
  ArrowSize,
  BeforeCloseCallback,
  BeforeOpenCallback,
  CloseReason,
  OverlayService,
  Placement,
  ViewportBoundaries,
} from '@nexora-ui/overlay';

import type { DropdownScrollStrategy } from '../constants/dropdown-constants';
import type { DropdownOption } from '../utils/resolve-option';

/** Config preset: 'dropdown' uses vertical fallbacks; 'menu' uses bottom-start and full 12-position fallbacks. */
export type DropdownConfigPreset = 'dropdown' | 'menu';

export interface DropdownRefOptions {
  /** Returns the trigger/anchor element. Called when opening and for positioning. */
  readonly getAnchor: () => HTMLElement | null;
  /**
   * Optional. When set, focus is restored to this element on close instead of the anchor.
   * Use for combobox so focus returns to the input while the panel can be anchored to the host.
   */
  readonly getFocusRestoreTarget?: () => HTMLElement | null;
  /** Overlay service to create overlays. */
  readonly overlay: OverlayService;
  /**
   * Config preset. When 'menu', uses createMenuAnchoredConfig (placement default bottom-start, full fallbacks).
   * When 'dropdown' or omitted, uses createDropdownAnchoredConfig (placement default bottom, vertical fallbacks).
   */
  readonly configPreset?: DropdownOption<DropdownConfigPreset>;
  /** Preferred placement. Default: 'bottom' for dropdown preset, 'bottom-start' for menu preset. */
  readonly placement?: DropdownOption<Placement>;
  /** Gap in px between trigger and panel. Default: DEFAULT_OFFSET. */
  readonly offset?: DropdownOption<number>;
  /** Panel width matches trigger when true. Default: true. */
  readonly matchTriggerWidth?: DropdownOption<boolean>;
  /** Scroll behavior while open. Default: 'noop'. */
  readonly scrollStrategy?: DropdownOption<DropdownScrollStrategy>;
  /** Close animation duration (ms). Default: DEFAULT_CLOSE_ANIMATION_MS. */
  readonly closeAnimationDurationMs?: DropdownOption<number>;
  /** Max height for the panel (e.g. '16rem'). Default: DEFAULT_MAX_HEIGHT. */
  readonly maxHeight?: DropdownOption<string>;
  /** Whether to show a backdrop. Default: false. */
  readonly hasBackdrop?: DropdownOption<boolean>;
  /** CSS class(es) for the pane. */
  readonly panelClass?: DropdownOption<string | string[] | undefined>;
  /** CSS class(es) for the backdrop. */
  readonly backdropClass?: DropdownOption<string | string[] | undefined>;
  /** Inline styles for the pane. */
  readonly panelStyle?: DropdownOption<Record<string, string> | undefined>;
  /** Inline styles for the backdrop. */
  readonly backdropStyle?: DropdownOption<Record<string, string> | undefined>;
  /** Called before opening. Return false to prevent. */
  readonly beforeOpen?: DropdownOption<BeforeOpenCallback | undefined>;
  /** Called before closing. Return false to prevent. */
  readonly beforeClose?: DropdownOption<BeforeCloseCallback | undefined>;
  /** Arrow dimensions (px). When set (e.g. for menu with displayArrow), the overlay shows an arrow. */
  readonly arrowSize?: DropdownOption<ArrowSize | undefined>;
  /** Called after the panel has opened. */
  readonly onOpened?: () => void;
  /** Called after the panel has closed (with reason). */
  readonly onClosed?: (reason: CloseReason | undefined) => void;
  /** When set, afterClosed subscription is cleaned up automatically when the injector context is destroyed. */
  readonly destroyRef?: DestroyRef;
  /** Only for reposition scroll strategy. When true (default), keep panel in viewport. When undefined, use default. */
  readonly maintainInViewport?: DropdownOption<boolean | undefined>;
  /** Viewport inset in px for panel max dimensions. */
  readonly boundaries?: DropdownOption<ViewportBoundaries | undefined>;
}

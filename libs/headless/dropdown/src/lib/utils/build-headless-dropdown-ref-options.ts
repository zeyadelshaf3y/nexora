/**
 * Shared {@link DropdownRefOptions} factory for headless anchored panels (select, combobox, menu).
 * Merges a stable base pane class with user `panelClass` and, when `useVirtualPanel` is true,
 * applies virtual-list pane styles; otherwise passes `panelStyle` through unchanged.
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
import type { DropdownConfigPreset, DropdownRefOptions } from '../ref/dropdown-ref-options';

import { createListboxVirtualDropdownPanelStyle } from './create-listbox-virtual-dropdown-panel-style';
import {
  mergeDropdownBackdropClasses,
  mergeDropdownPaneClasses,
} from './merge-dropdown-pane-classes';
import type { DropdownOption } from './resolve-option';

export interface HeadlessDropdownRefOptionsInput {
  readonly overlay: OverlayService;
  readonly destroyRef: DestroyRef;
  readonly getAnchor: () => HTMLElement | null;
  /**
   * When set, focus restores here on close instead of the anchor (e.g. combobox input while
   * anchor may be the host).
   */
  readonly getFocusRestoreTarget?: () => HTMLElement | null;
  readonly placement: () => Placement;
  readonly offset: () => number;
  readonly matchTriggerWidth: () => boolean;
  readonly scrollStrategy: () => DropdownScrollStrategy;
  readonly maintainInViewport: () => boolean;
  /** When omitted (e.g. menu), `DropdownRef` uses overlay defaults for viewport insets. */
  readonly boundaries?: () => ViewportBoundaries | undefined;
  readonly closeAnimationDurationMs: () => number;
  readonly maxHeight: () => string;
  readonly hasBackdrop: () => boolean;
  /** Stable first segment for `panelClass`, e.g. `nxr-select-pane` or `nxr-combobox-pane`. */
  readonly basePaneClass: string;
  /** Stable first segment for `backdropClass`, e.g. `nxr-select-backdrop`. */
  readonly baseBackdropClass: string;
  readonly panelClass: () => string | string[] | undefined;
  readonly backdropClass: () => string | string[] | undefined;
  readonly panelStyle: () => Record<string, string> | undefined;
  readonly backdropStyle: () => Record<string, string> | undefined;
  readonly beforeOpen: () => BeforeOpenCallback | undefined;
  readonly beforeClose: () => BeforeCloseCallback | undefined;
  readonly useVirtualPanel: () => boolean;
  /** When set (e.g. `'menu'`), forwarded to {@link DropdownRefOptions.configPreset}. */
  readonly configPreset?: DropdownOption<DropdownConfigPreset>;
  /** When set, forwarded to {@link DropdownRefOptions.arrowSize} (menu arrow). */
  readonly arrowSize?: DropdownOption<ArrowSize | undefined>;
  readonly onOpened: () => void;
  readonly onClosed: (reason: CloseReason | undefined) => void;
}

export function buildHeadlessDropdownRefOptions(
  input: HeadlessDropdownRefOptionsInput,
): DropdownRefOptions {
  const opts: DropdownRefOptions = {
    getAnchor: input.getAnchor,
    overlay: input.overlay,
    destroyRef: input.destroyRef,
    placement: input.placement,
    offset: input.offset,
    matchTriggerWidth: input.matchTriggerWidth,
    scrollStrategy: input.scrollStrategy,
    maintainInViewport: input.maintainInViewport,
    closeAnimationDurationMs: input.closeAnimationDurationMs,
    maxHeight: input.maxHeight,
    hasBackdrop: input.hasBackdrop,
    panelClass: () => mergeDropdownPaneClasses(input.basePaneClass, input.panelClass()),
    backdropClass: () =>
      mergeDropdownBackdropClasses(input.baseBackdropClass, input.backdropClass()),
    panelStyle: createListboxVirtualDropdownPanelStyle({
      useVirtualPanel: input.useVirtualPanel,
      panelStyle: input.panelStyle,
      maxHeight: input.maxHeight,
    }),
    backdropStyle: input.backdropStyle,
    beforeOpen: input.beforeOpen,
    beforeClose: input.beforeClose,
    onOpened: input.onOpened,
    onClosed: input.onClosed,
    ...(input.boundaries !== undefined ? { boundaries: input.boundaries } : {}),
    ...(input.getFocusRestoreTarget != null
      ? { getFocusRestoreTarget: input.getFocusRestoreTarget }
      : {}),
    ...(input.configPreset !== undefined ? { configPreset: input.configPreset } : {}),
    ...(input.arrowSize !== undefined ? { arrowSize: input.arrowSize } : {}),
  };

  return opts;
}

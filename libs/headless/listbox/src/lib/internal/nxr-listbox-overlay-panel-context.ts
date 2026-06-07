/**
 * Context for {@link NxrListboxOverlayPanelHostComponent}, used when a listbox is rendered
 * inside an overlay (e.g. select, combobox). Library authors provide this token in the portal injector.
 */

import { InjectionToken, type Signal, type TemplateRef } from '@angular/core';

import type { ListboxAccessors, ListboxInitialHighlight, NxrListboxController } from '../types';
import type { ListboxScrollActiveCapable } from '../utils/listbox-schedule-initial-scroll';

/** Listbox instance passed to overlay `onListboxReady` (typically {@link ListboxDirective}). */
export type NxrListboxReadyInstance<T = unknown> = NxrListboxController<T> &
  ListboxScrollActiveCapable;

/**
 * Reactive panel context: listbox bindings, option template, and callbacks to the root control.
 */
export interface NxrListboxOverlayPanelContext<T = unknown> {
  readonly template: TemplateRef<unknown>;
  /**
   * When true, scrolling happens inside a descendant (e.g. CDK virtual viewport), not on the
   * `[nxrListbox]` host: that element gets `overflow: hidden` so only the inner viewport scrolls.
   * Give the viewport a **definite height** (e.g. `viewportMaxHeight` on `nxr-listbox-cdk-virtual-panel`).
   * Set by combobox/select for built-in virtual panels.
   *
   * If you embed your own CDK viewport in a custom `*Panel` template, set this to `true` as well
   * or you may see **two scrollbars** (listbox + viewport).
   */
  readonly childOwnsScroll?: boolean;
  /**
   * Optional fixed header rendered above the scrollable listbox, outside the scroll container.
   * Only used on the **non-virtual** path. For the built-in virtual panel use
   * `nxrSelectVirtualHeader` / `nxrComboboxVirtualHeader` instead.
   */
  readonly headerTemplate?: TemplateRef<unknown> | null;
  /**
   * Optional fixed footer rendered below the scrollable listbox, outside the scroll container.
   * Only used on the **non-virtual** path. For the built-in virtual panel use
   * `nxrSelectVirtualFooter` / `nxrComboboxVirtualFooter` instead.
   */
  readonly footerTemplate?: TemplateRef<unknown> | null;
  readonly value: Signal<T | null | readonly T[]>;
  readonly multi: Signal<boolean>;
  readonly accessors: Signal<ListboxAccessors<T> | undefined>;
  readonly compareWith: Signal<((a: unknown, b: unknown) => boolean) | undefined>;
  readonly initialHighlight: Signal<ListboxInitialHighlight>;
  readonly onValueChange: (v: T | null | readonly T[]) => void;
  readonly onListboxReady: (listbox: ListboxScrollActiveCapable) => void;
}

export const NXR_LISTBOX_OVERLAY_PANEL_CONTEXT = new InjectionToken<NxrListboxOverlayPanelContext>(
  'NXR_LISTBOX_OVERLAY_PANEL_CONTEXT',
);

/**
 * Context for {@link NxrListboxOverlayPanelHostComponent}, used when a listbox is rendered
 * inside an overlay (e.g. select, combobox). Library authors provide this token in the portal injector.
 */

import { InjectionToken, type Signal, type TemplateRef } from '@angular/core';

import type { ListboxDirective } from '../directives/listbox.directive';
import type { ListboxAccessors, ListboxInitialHighlight } from '../types';

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
  readonly value: Signal<T | null | readonly T[]>;
  readonly multi: Signal<boolean>;
  readonly accessors: Signal<ListboxAccessors<T> | undefined>;
  readonly compareWith: Signal<((a: unknown, b: unknown) => boolean) | undefined>;
  readonly initialHighlight: Signal<ListboxInitialHighlight>;
  readonly onValueChange: (v: T | null | readonly T[]) => void;
  readonly onListboxReady: (listbox: ListboxDirective<T>) => void;
}

export const NXR_LISTBOX_OVERLAY_PANEL_CONTEXT = new InjectionToken<NxrListboxOverlayPanelContext>(
  'NXR_LISTBOX_OVERLAY_PANEL_CONTEXT',
);

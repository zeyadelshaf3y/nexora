/**
 * Builds {@link NxrListboxOverlayPanelContext} for {@link createListboxOverlayPanelPortal}.
 */

import type { Signal, TemplateRef } from '@angular/core';
import type { ListboxAccessors, ListboxInitialHighlight } from '@nexora-ui/listbox';
import type { ListboxDirective } from '@nexora-ui/listbox/internal';

import type { SelectPanelDirective } from '../directives/select-panel.directive';
import type { SelectAccessors } from '../types/select-types';

/**
 * Local context shape for listbox overlay panels used by select.
 * Kept local to avoid type-identity coupling across secondary entry points.
 */
interface SelectOverlayPanelContext<T = unknown> {
  readonly template: TemplateRef<unknown>;
  readonly childOwnsScroll?: boolean;
  readonly value: Signal<T | null | readonly T[]>;
  readonly multi: Signal<boolean>;
  readonly accessors: Signal<ListboxAccessors<T> | undefined>;
  readonly compareWith: Signal<((a: unknown, b: unknown) => boolean) | undefined>;
  readonly initialHighlight: Signal<ListboxInitialHighlight>;
  readonly onValueChange: (v: T | null | readonly T[]) => void;
  readonly onListboxReady: (listbox: ListboxDirective<T>) => void;
}

export function buildSelectOverlayPanelContext<T>(args: {
  readonly panel: SelectPanelDirective;
  readonly childOwnsScroll: boolean;
  readonly value: Signal<T | null | readonly T[]>;
  readonly multi: Signal<boolean>;
  readonly accessors: Signal<SelectAccessors<T> | undefined>;
  readonly compareWith: Signal<((a: unknown, b: unknown) => boolean) | undefined>;
  readonly initialHighlight: Signal<ListboxInitialHighlight>;
  readonly onValueChange: (v: T | null | readonly T[]) => void;
  readonly onListboxReady: (listbox: ListboxDirective<T>) => void;
}): SelectOverlayPanelContext<T> {
  return {
    template: args.panel.templateRef,
    childOwnsScroll: args.childOwnsScroll,
    value: args.value,
    multi: args.multi,
    accessors: args.accessors,
    compareWith: args.compareWith,
    initialHighlight: args.initialHighlight,
    onValueChange: args.onValueChange,
    onListboxReady: args.onListboxReady,
  };
}

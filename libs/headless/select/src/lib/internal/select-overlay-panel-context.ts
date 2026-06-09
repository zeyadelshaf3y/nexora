/**
 * Builds {@link NxrListboxOverlayPanelContext} for {@link createListboxOverlayPanelPortal}.
 */

import type { Signal, TemplateRef } from '@angular/core';
import type {
  ListboxAccessors,
  ListboxInitialHighlight,
  ListboxPointerHighlight,
  ListboxScrollActiveCapable,
} from '@nexora-ui/listbox';

import type {
  SelectFooterDirective,
  SelectHeaderDirective,
} from '../directives/select-panel-chrome.directive';
import type { SelectPanelDirective } from '../directives/select-panel.directive';
import type { SelectAccessors } from '../types/select-types';

/**
 * Local context shape for listbox overlay panels used by select.
 * Kept local to avoid type-identity coupling across secondary entry points.
 */
interface SelectOverlayPanelContext<T = unknown> {
  readonly template: TemplateRef<unknown>;
  readonly childOwnsScroll?: boolean;
  readonly headerTemplate?: TemplateRef<unknown> | null;
  readonly footerTemplate?: TemplateRef<unknown> | null;
  readonly value: Signal<T | null | readonly T[]>;
  readonly multi: Signal<boolean>;
  readonly accessors: Signal<ListboxAccessors<T> | undefined>;
  readonly compareWith: Signal<((a: unknown, b: unknown) => boolean) | undefined>;
  readonly initialHighlight: Signal<ListboxInitialHighlight>;
  readonly pointerHighlight: Signal<ListboxPointerHighlight>;
  readonly onValueChange: (v: T | null | readonly T[]) => void;
  readonly onListboxReady: (listbox: ListboxScrollActiveCapable) => void;
}

export function buildSelectOverlayPanelContext<T>(args: {
  readonly panel: SelectPanelDirective;
  readonly childOwnsScroll: boolean;
  readonly header?: SelectHeaderDirective;
  readonly footer?: SelectFooterDirective;
  readonly value: Signal<T | null | readonly T[]>;
  readonly multi: Signal<boolean>;
  readonly accessors: Signal<SelectAccessors<T> | undefined>;
  readonly compareWith: Signal<((a: unknown, b: unknown) => boolean) | undefined>;
  readonly initialHighlight: Signal<ListboxInitialHighlight>;
  readonly pointerHighlight: Signal<ListboxPointerHighlight>;
  readonly onValueChange: (v: T | null | readonly T[]) => void;
  readonly onListboxReady: (listbox: ListboxScrollActiveCapable) => void;
}): SelectOverlayPanelContext<T> {
  return {
    template: args.panel.templateRef,
    childOwnsScroll: args.childOwnsScroll,
    headerTemplate: args.header?.templateRef ?? null,
    footerTemplate: args.footer?.templateRef ?? null,
    value: args.value,
    multi: args.multi,
    accessors: args.accessors,
    compareWith: args.compareWith,
    initialHighlight: args.initialHighlight,
    pointerHighlight: args.pointerHighlight,
    onValueChange: args.onValueChange,
    onListboxReady: args.onListboxReady,
  };
}

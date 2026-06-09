/**
 * Builds {@link ComboboxContext} for {@link createListboxOverlayPanelPortal} from panel + signals.
 */

import type { Signal } from '@angular/core';
import type {
  ListboxInitialHighlight,
  ListboxPointerHighlight,
  ListboxScrollActiveCapable,
} from '@nexora-ui/listbox';

import type {
  ComboboxFooterDirective,
  ComboboxHeaderDirective,
} from '../directives/combobox-panel-chrome.directive';
import type { ComboboxPanelDirective } from '../directives/combobox-panel.directive';
import type { ComboboxAccessors } from '../types/combobox-types';

import type { ComboboxContext } from './combobox-context';

export function buildComboboxOverlayPanelContext<T>(args: {
  readonly panel: ComboboxPanelDirective;
  readonly childOwnsScroll: boolean;
  readonly header?: ComboboxHeaderDirective;
  readonly footer?: ComboboxFooterDirective;
  readonly value: Signal<T | null | readonly T[]>;
  readonly multi: Signal<boolean>;
  readonly accessors: Signal<ComboboxAccessors<T> | undefined>;
  readonly compareWith: Signal<((a: unknown, b: unknown) => boolean) | undefined>;
  readonly initialHighlight: Signal<ListboxInitialHighlight>;
  readonly pointerHighlight: Signal<ListboxPointerHighlight>;
  readonly onValueChange: (v: T | null | readonly T[]) => void;
  readonly onListboxReady: (listbox: ListboxScrollActiveCapable) => void;
}): ComboboxContext<T> {
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

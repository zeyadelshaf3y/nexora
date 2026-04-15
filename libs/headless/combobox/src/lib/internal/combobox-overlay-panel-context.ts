/**
 * Builds {@link ComboboxContext} for {@link createListboxOverlayPanelPortal} from panel + signals.
 */

import type { Signal } from '@angular/core';
import type { ListboxInitialHighlight } from '@nexora-ui/listbox';
import type { ListboxDirective } from '@nexora-ui/listbox/internal';

import type { ComboboxPanelDirective } from '../directives/combobox-panel.directive';
import type { ComboboxAccessors } from '../types/combobox-types';

import type { ComboboxContext } from './combobox-context';

export function buildComboboxOverlayPanelContext<T>(args: {
  readonly panel: ComboboxPanelDirective;
  readonly childOwnsScroll: boolean;
  readonly value: Signal<T | null | readonly T[]>;
  readonly multi: Signal<boolean>;
  readonly accessors: Signal<ComboboxAccessors<T> | undefined>;
  readonly compareWith: Signal<((a: unknown, b: unknown) => boolean) | undefined>;
  readonly initialHighlight: Signal<ListboxInitialHighlight>;
  readonly onValueChange: (v: T | null | readonly T[]) => void;
  readonly onListboxReady: (listbox: ListboxDirective<T>) => void;
}): ComboboxContext<T> {
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

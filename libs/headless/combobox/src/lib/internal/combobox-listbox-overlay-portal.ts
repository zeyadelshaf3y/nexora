/**
 * Listbox overlay portal wiring for {@link ComboboxComponent}.
 */

import type { Injector, InputSignal, ModelSignal, ViewContainerRef } from '@angular/core';
import {
  bindListboxReadyWithActiveScroll,
  type ListboxInitialHighlight,
  type ListboxPointerHighlight,
  type ListboxScrollActiveCapable,
} from '@nexora-ui/listbox';
import type { NxrListboxOverlayPanelHostComponent } from '@nexora-ui/listbox/internal';
import { createListboxOverlayPanelPortal } from '@nexora-ui/listbox-cdk/internal';
import type { ComponentPortal } from '@nexora-ui/overlay';

import type {
  ComboboxFooterDirective,
  ComboboxHeaderDirective,
} from '../directives/combobox-panel-chrome.directive';
import type { ComboboxPanelDirective } from '../directives/combobox-panel.directive';
import type { ComboboxAccessors } from '../types/combobox-types';

import { buildComboboxOverlayPanelContext } from './combobox-overlay-panel-context';

export function createComboboxListboxOverlayPortal<T>(args: {
  readonly vcr: ViewContainerRef;
  readonly injector: Injector;
  readonly panel: ComboboxPanelDirective;
  readonly childOwnsScroll: boolean;
  readonly header?: ComboboxHeaderDirective;
  readonly footer?: ComboboxFooterDirective;
  readonly value: ModelSignal<T | null | readonly T[]>;
  readonly multi: InputSignal<boolean>;
  readonly accessors: InputSignal<ComboboxAccessors<T> | undefined>;
  readonly compareWith: InputSignal<((a: unknown, b: unknown) => boolean) | undefined>;
  readonly initialHighlight: InputSignal<ListboxInitialHighlight>;
  readonly pointerHighlight: InputSignal<ListboxPointerHighlight>;
  readonly onValueChange: (value: T | null | readonly T[]) => void;
  readonly setListboxRef: (listbox: ListboxScrollActiveCapable) => void;
}): ComponentPortal<NxrListboxOverlayPanelHostComponent> {
  return createListboxOverlayPanelPortal(
    args.vcr,
    args.injector,
    buildComboboxOverlayPanelContext({
      panel: args.panel,
      childOwnsScroll: args.childOwnsScroll,
      header: args.header,
      footer: args.footer,
      value: args.value,
      multi: args.multi,
      accessors: args.accessors,
      compareWith: args.compareWith,
      initialHighlight: args.initialHighlight,
      pointerHighlight: args.pointerHighlight,
      onValueChange: args.onValueChange,
      onListboxReady: bindListboxReadyWithActiveScroll(args.setListboxRef),
    }),
  );
}

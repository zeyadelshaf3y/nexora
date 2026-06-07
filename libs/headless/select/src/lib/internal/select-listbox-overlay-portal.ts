/**
 * Listbox overlay portal wiring for {@link SelectComponent}.
 */

import type { Injector, InputSignal, ModelSignal, ViewContainerRef } from '@angular/core';
import {
  bindListboxReadyWithActiveScroll,
  type ListboxInitialHighlight,
  type ListboxScrollActiveCapable,
} from '@nexora-ui/listbox';
import type { NxrListboxOverlayPanelHostComponent } from '@nexora-ui/listbox/internal';
import { createListboxOverlayPanelPortal } from '@nexora-ui/listbox-cdk/internal';
import type { ComponentPortal } from '@nexora-ui/overlay';

import type {
  SelectFooterDirective,
  SelectHeaderDirective,
} from '../directives/select-panel-chrome.directive';
import type { SelectPanelDirective } from '../directives/select-panel.directive';
import type { SelectAccessors } from '../types/select-types';

import { buildSelectOverlayPanelContext } from './select-overlay-panel-context';

export function createSelectListboxOverlayPortal<T>(args: {
  readonly vcr: ViewContainerRef;
  readonly injector: Injector;
  readonly panel: SelectPanelDirective;
  readonly childOwnsScroll: boolean;
  readonly header?: SelectHeaderDirective;
  readonly footer?: SelectFooterDirective;
  readonly value: ModelSignal<T | null | readonly T[]>;
  readonly multi: InputSignal<boolean>;
  readonly accessors: InputSignal<SelectAccessors<T> | undefined>;
  readonly compareWith: InputSignal<((a: unknown, b: unknown) => boolean) | undefined>;
  readonly initialHighlight: InputSignal<ListboxInitialHighlight>;
  readonly onValueChange: (value: T | null | readonly T[]) => void;
  readonly setListboxRef: (listbox: ListboxScrollActiveCapable) => void;
}): ComponentPortal<NxrListboxOverlayPanelHostComponent> {
  return createListboxOverlayPanelPortal(
    args.vcr,
    args.injector,
    buildSelectOverlayPanelContext({
      panel: args.panel,
      childOwnsScroll: args.childOwnsScroll,
      header: args.header,
      footer: args.footer,
      value: args.value,
      multi: args.multi,
      accessors: args.accessors,
      compareWith: args.compareWith,
      initialHighlight: args.initialHighlight,
      onValueChange: args.onValueChange,
      onListboxReady: bindListboxReadyWithActiveScroll(args.setListboxRef),
    }),
  );
}

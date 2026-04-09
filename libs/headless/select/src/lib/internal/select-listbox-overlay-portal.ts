/**
 * Listbox overlay portal wiring for {@link SelectComponent}.
 */

import type { Injector, InputSignal, ModelSignal, ViewContainerRef } from '@angular/core';
import { bindListboxReadyWithActiveScroll, type ListboxInitialHighlight } from '@nexora-ui/listbox';
import type {
  ListboxDirective,
  NxrListboxOverlayPanelHostComponent,
} from '@nexora-ui/listbox/internal';
import { createListboxOverlayPanelPortal } from '@nexora-ui/listbox-cdk/internal';
import type { ComponentPortal } from '@nexora-ui/overlay';

import type { SelectPanelDirective } from '../directives/select-panel.directive';
import type { SelectAccessors } from '../types/select-types';

import { buildSelectOverlayPanelContext } from './select-overlay-panel-context';

export function createSelectListboxOverlayPortal<T>(args: {
  readonly vcr: ViewContainerRef;
  readonly injector: Injector;
  readonly panel: SelectPanelDirective;
  readonly childOwnsScroll: boolean;
  readonly value: ModelSignal<T | null | readonly T[]>;
  readonly multi: InputSignal<boolean>;
  readonly accessors: InputSignal<SelectAccessors<T> | undefined>;
  readonly compareWith: InputSignal<((a: unknown, b: unknown) => boolean) | undefined>;
  readonly initialHighlight: InputSignal<ListboxInitialHighlight>;
  readonly onValueChange: (value: T | null | readonly T[]) => void;
  readonly setListboxRef: (listbox: ListboxDirective<T>) => void;
}): ComponentPortal<NxrListboxOverlayPanelHostComponent> {
  return createListboxOverlayPanelPortal(
    args.vcr,
    args.injector,
    buildSelectOverlayPanelContext({
      panel: args.panel,
      childOwnsScroll: args.childOwnsScroll,
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

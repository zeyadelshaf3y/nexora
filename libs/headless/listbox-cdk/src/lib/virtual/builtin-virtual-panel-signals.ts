import { computed } from '@angular/core';
import type { ListboxAccessors } from '@nexora-ui/listbox';

import { computeBuiltinVirtualSelectedIndex } from './compute-builtin-virtual-selected-index';
import { resolveVirtualLabelFor, resolveVirtualTrackKeyFn } from './virtual-panel-resolve';

export interface BuiltinVirtualPanelSignalsContext<T> {
  virtualScroll(): boolean;
  virtualItems(): readonly T[] | null;
  virtualTrackByKey(): ((item: T) => unknown) | undefined;
  accessors(): ListboxAccessors<T> | undefined;
  value(): T | null | readonly T[];
  multi(): boolean;
  compareWith(): ((a: unknown, b: unknown) => boolean) | undefined;
}

/**
 * Computed signals shared by combobox/select for built-in virtual mode (single implementation).
 */
export function createBuiltinVirtualPanelSignals<T>(ctx: BuiltinVirtualPanelSignalsContext<T>) {
  const useVirtualPanel = computed(() => ctx.virtualScroll() && ctx.virtualItems() != null);
  const virtualLabelFor = computed(() => resolveVirtualLabelFor(ctx.accessors()));
  const virtualTrackKeyFn = computed(() =>
    resolveVirtualTrackKeyFn(ctx.virtualTrackByKey(), ctx.accessors()),
  );
  const virtualSelectedIndex = computed(() =>
    computeBuiltinVirtualSelectedIndex({
      useVirtualPanel: useVirtualPanel(),
      items: ctx.virtualItems(),
      value: ctx.value(),
      multi: ctx.multi(),
      compareWith: ctx.compareWith(),
      accessors: ctx.accessors(),
      trackKeyFn: virtualTrackKeyFn(),
    }),
  );
  return { useVirtualPanel, virtualLabelFor, virtualTrackKeyFn, virtualSelectedIndex } as const;
}

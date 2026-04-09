import { InjectionToken } from '@angular/core';
import type { Signal, TemplateRef } from '@angular/core';
import type { ListboxAccessors, ListboxInitialHighlight } from '@nexora-ui/listbox';
import type { ListboxDirective } from '@nexora-ui/listbox/internal';

/**
 * Panel context passed to the combobox overlay listbox host.
 * Kept local to avoid type-identity coupling across secondary entry points.
 */
export interface ComboboxContext<T = unknown> {
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

/** Optional injection token for combobox panel context. */
export const NXR_COMBOBOX_CONTEXT = new InjectionToken<ComboboxContext>('NXR_COMBOBOX_CONTEXT');

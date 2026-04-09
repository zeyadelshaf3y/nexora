import {
  computeVirtualSelectedIndex,
  type ComputeVirtualSelectedIndexParams,
} from './compute-virtual-selected-index';

export type BuiltinVirtualSelectedIndexParams<T> = Omit<
  ComputeVirtualSelectedIndexParams<T>,
  'items'
> & {
  readonly useVirtualPanel: boolean;
  readonly items: readonly T[] | null | undefined;
};

/** `-1` when built-in virtual mode is off; otherwise delegates to {@link computeVirtualSelectedIndex}. */
export function computeBuiltinVirtualSelectedIndex<T>(
  params: BuiltinVirtualSelectedIndexParams<T>,
): number {
  const { useVirtualPanel, items, value, multi, compareWith, accessors, trackKeyFn } = params;

  if (!useVirtualPanel) return -1;

  return computeVirtualSelectedIndex({
    items: items ?? [],
    value,
    multi,
    compareWith,
    accessors,
    trackKeyFn,
  });
}

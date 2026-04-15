import type { ListboxAccessors } from '@nexora-ui/listbox';

export function resolveVirtualLabelFor<T>(
  accessors: ListboxAccessors<T> | undefined,
): (item: T) => string {
  const label = accessors?.label;
  if (typeof label === 'function') return (item) => label(item);

  return (item) => String(item);
}

/**
 * Row identity for index maps: consumer `virtualTrackByKey`, else `accessors.value`, else reference.
 */
export function resolveVirtualTrackKeyFn<T>(
  customTrackBy: ((item: T) => unknown) | undefined,
  accessors: ListboxAccessors<T> | undefined,
): (item: T) => unknown {
  if (typeof customTrackBy === 'function') return customTrackBy;
  const valueAccessor = accessors?.value;
  if (typeof valueAccessor === 'function') return (item) => valueAccessor(item);

  return (item) => item;
}

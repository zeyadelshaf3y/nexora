/**
 * Flex column pane when the scroll container is a descendant (e.g. CDK virtual viewport).
 * Shallow-merges `user` last. With virtual lists, pass `paneBlockSize` === overlay `maxHeight`:
 * the engine sets `max-height` on the pane but not always `height`, and `%`/flex fill then
 * resolves to 0 for the viewport.
 */
export function mergeVirtualDropdownPaneStyle(
  enabled: boolean,
  user: Record<string, string> | undefined,
  paneBlockSize?: string,
): Record<string, string> | undefined {
  if (!enabled) return user;
  const base: Record<string, string> = {
    display: 'flex',
    'flex-direction': 'column',
    'min-height': '0',
    ...(paneBlockSize
      ? { height: paneBlockSize, 'max-height': paneBlockSize, overflow: 'hidden' }
      : {}),
  };
  return user ? { ...base, ...user } : base;
}

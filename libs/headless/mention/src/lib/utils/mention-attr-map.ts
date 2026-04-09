/**
 * Helpers for `Record<string, string>` attribute maps (e.g. mention chip DOM attrs).
 * Bracket read for `class` satisfies TS index-signature rules; merges use object spread (no in-place mutation).
 */

export function readClassFromAttrMap(
  attrs: Record<string, string> | undefined,
): string | undefined {
  return attrs?.['class']?.trim();
}

/**
 * Config/adapter attrs first, then insertion attrs (later wins on duplicate keys), then merged CSS `class`.
 */
export function mergeMentionAttributeRecords(
  mentionAttrs: Record<string, string> | undefined,
  baseAttrs: Record<string, string> | undefined,
  mergedClass: string | undefined,
): Record<string, string> | undefined {
  const merged: Record<string, string> = {
    ...(mentionAttrs ?? {}),
    ...(baseAttrs ?? {}),
  };

  const withClass = mergedClass
    ? {
        ...merged,
        class: mergedClass,
      }
    : merged;

  return Object.keys(withClass).length > 0 ? withClass : undefined;
}

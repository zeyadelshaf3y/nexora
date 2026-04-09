/**
 * Shared helper for trigger directives (tooltip, popover) to check if a trigger type
 * is included in the directive's trigger input (single value or array).
 * @internal
 */
export function triggerIncludes<T>(value: T | T[], trigger: T): boolean {
  return Array.isArray(value) ? value.includes(trigger) : value === trigger;
}

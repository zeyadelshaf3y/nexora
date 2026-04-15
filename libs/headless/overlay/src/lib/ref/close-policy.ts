/**
 * Read-only policy for when an overlay closes (escape key, outside click, backdrop click).
 *
 * - **escape**: `'top'` = close topmost overlay on Escape; `'none'` = do not close.
 * - **outside**: `'top'` = close top overlay on outside click; `'none'` = do not close (may still notify).
 * - **backdrop**: `'self'` = close this overlay on backdrop click; `'none'` = ignore.
 * - **escapePropagation**: `'stop'` = stop propagation (e.g. dialog); `'bubble'` = bubble (e.g. menu).
 */
export interface ClosePolicy {
  readonly escape: 'top' | 'none';
  readonly outside: 'top' | 'none';
  readonly backdrop: 'self' | 'none';
  readonly escapePropagation?: 'stop' | 'bubble';
}

/** Default close policy: close on escape, outside, and backdrop. */
export const DEFAULT_CLOSE_POLICY: ClosePolicy = {
  escape: 'top',
  outside: 'top',
  backdrop: 'self',
};

/**
 * Merges partial policy with defaults. If hasBackdrop is false, backdrop is treated as 'none'.
 */
export function mergeClosePolicy(
  partial?: Partial<ClosePolicy>,
  hasBackdrop?: boolean,
): ClosePolicy {
  return {
    ...DEFAULT_CLOSE_POLICY,
    ...partial,
    ...(hasBackdrop === false && { backdrop: 'none' as const }),
  };
}

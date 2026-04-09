import { getGlobal } from '../env/get-global';

/**
 * Returns whether the user has requested reduced motion (accessibility preference).
 * SSR-safe: returns false when matchMedia or DOM is not available.
 *
 * @returns true when (prefers-reduced-motion: reduce) matches
 */
export function prefersReducedMotion(): boolean {
  const win = getGlobal();

  if (!win || typeof win.matchMedia !== 'function') return false;

  try {
    return win.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

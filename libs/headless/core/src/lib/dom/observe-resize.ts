import { canUseDOM } from '../env/can-use-dom';

/**
 * Calls the callback when the element is resized (via ResizeObserver).
 * SSR-safe: returns a no-op cleanup when ResizeObserver or DOM is not available.
 *
 * @param element - Element to observe
 * @param callback - Called with the element's new size (ResizeObserverEntry contentRect) when it resizes
 * @returns Cleanup function to disconnect the observer
 */
export function observeResize(
  element: HTMLElement | null | undefined,
  callback: (entry: ResizeObserverEntry) => void,
): () => void {
  if (!canUseDOM() || typeof ResizeObserver === 'undefined' || !element) {
    return () => {};
  }

  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      callback(entry);
    }
  });

  observer.observe(element);

  return () => observer.disconnect();
}

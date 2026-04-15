import { canUseDOM } from '../env/can-use-dom';

/**
 * Event target type that supports addEventListener/removeEventListener.
 */
export type EventTargetLike = Window | Document | HTMLElement | Element | EventTargetLikeObject;

interface EventTargetLikeObject {
  addEventListener: (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ) => void;
  removeEventListener: (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ) => void;
}

function isEventTargetLike(target: unknown): target is EventTarget {
  return !!target && typeof (target as EventTarget).addEventListener === 'function';
}

/**
 * Attaches an event listener and returns a cleanup function that removes it.
 * SSR-safe: returns a no-op cleanup when DOM is not available.
 *
 * @param target - Window, document, or element to listen on
 * @param type - Event type (e.g. 'click', 'keydown', 'scroll')
 * @param listener - Callback or listener object
 * @param options - Optional capture or passive
 * @returns Cleanup function to remove the listener
 */
export function listen(
  target: EventTargetLike | null | undefined,
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions,
): () => void {
  if (!canUseDOM() || !isEventTargetLike(target)) {
    return () => {};
  }

  target.addEventListener(type, listener, options);

  return () => target.removeEventListener(type, listener, options);
}

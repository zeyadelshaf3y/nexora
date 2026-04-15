import type { MentionControllerImpl } from '../internal/mention-controller';
import type { MentionControllerWire } from '../internal/mention-controller-wire';

import type { MentionSessionCheckScheduler } from './mention-session-check-scheduler';

export function resetSessionScheduler<T>(
  scheduler: MentionSessionCheckScheduler<T> | null,
): MentionSessionCheckScheduler<T> | null {
  scheduler?.reset();

  return null;
}

export function clearLastMentionWire<T>(
  wire: MentionControllerWire<T> | null,
): MentionControllerWire<T> | null {
  void wire;

  return null;
}

export function cleanupAdapterUnsubscribe(unsubscribe: (() => void) | null): (() => void) | null {
  if (unsubscribe) unsubscribe();

  return null;
}

export function disposeMentionController<T>(
  controller: MentionControllerImpl<T> | null,
): MentionControllerImpl<T> | null {
  controller?.close?.();
  controller?.dispose?.();

  return null;
}

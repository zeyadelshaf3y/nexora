import type { MentionSession } from '../types/mention-types';

/**
 * Keyboard handling when the mention panel is open (list navigation + select + Escape).
 */
export function handleMentionOpenPanelKeydown<T>(
  event: KeyboardEvent,
  ctx: {
    readonly session: MentionSession<T>;
    readonly items: readonly T[];
    readonly activeIndex: number;
    setActiveIndex(index: number): void;
    select(item: T): void;
    close(): void;
  },
): void {
  const { session, items, activeIndex, setActiveIndex, select, close } = ctx;
  const config = session.triggerConfig;
  const activeItem = items[activeIndex];

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      setActiveIndex(Math.min(activeIndex + 1, items.length - 1));
      break;
    case 'ArrowUp':
      event.preventDefault();
      setActiveIndex(Math.max(activeIndex - 1, 0));
      break;
    case 'Enter': {
      if (config.selectOnEnter !== false && activeItem != null) {
        event.preventDefault();
        select(activeItem);
      }
      break;
    }
    case 'Tab': {
      if (config.selectOnTab === true && activeItem != null) {
        event.preventDefault();
        select(activeItem);
      }
      break;
    }
    case 'Escape':
      event.preventDefault();
      close();
      break;
    default:
      break;
  }
}

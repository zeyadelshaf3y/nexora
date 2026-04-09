import type { MentionChipInteractionEvent } from '../types/mention-types';

import { MentionChipInteractionDispatcher } from './mention-chip-interaction-dispatcher';

export function createMentionChipInteractionDispatcher(params: {
  root: HTMLElement;
  mentionIdAttr: string;
  mentionLabelAttr: string;
  getLeaveDelayMs: () => number;
  emitEnter: (event: MentionChipInteractionEvent) => void;
  emitLeave: (event: MentionChipInteractionEvent) => void;
  emitClick: (event: MentionChipInteractionEvent) => void;
}): MentionChipInteractionDispatcher {
  const dispatcher = new MentionChipInteractionDispatcher({
    root: params.root,
    mentionIdAttr: params.mentionIdAttr,
    mentionLabelAttr: params.mentionLabelAttr,
    getLeaveDelayMs: params.getLeaveDelayMs,
    onEnter: (event) => params.emitEnter(event),
    onLeave: (event) => params.emitLeave(event),
    onChipClick: (event) => params.emitClick(event),
  });

  dispatcher.attach();

  return dispatcher;
}

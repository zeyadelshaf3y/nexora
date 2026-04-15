/**
 * @nexora-ui/mention — headless mention primitive.
 *
 * Contenteditable mention: trigger character opens a suggestion panel at the caret,
 * `getItems` (sync / Promise / Observable, **`readonly T[]`**) supplies options; selection inserts mention spans and closes.
 * Zero opinionated styles; user owns item/loading/empty templates.
 *
 * **Docs:** package README and `docs/MENTION.md` (blur, mobile, panel host).
 */

export { MentionDirective } from './lib/directives/mention.directive';
export { MentionPanelDirective } from './lib/directives/mention-panel.directive';
export type { ArrowSize } from '@nexora-ui/overlay';
export type {
  MentionMatch,
  MentionInsertion,
  MentionItemsResult,
  MentionSession,
  MentionTriggerConfig,
  MentionTriggerPanelOptions,
  MentionPanelState,
  MentionEntity,
  MentionDocument,
  MentionChipInteractionEvent,
  MentionSelectEvent,
  MentionSelectHandler,
  MentionOpenChangeHandler,
  MentionQueryChangeHandler,
  MentionBeforePasteHandler,
  MentionPasteEvent,
  MentionInsertOptions,
} from './lib/types/mention-types';
export type { MentionPanelContext } from './lib/directives/mention-panel.directive';
export { NXR_MENTION_OVERLAY_PANE_CLASS } from './lib/constants/mention-overlay-constants';
export {
  NXR_MENTION_EDITOR_CLASS,
  NXR_MENTION_EDITOR_WRAPPER_CLASS,
  NXR_MENTION_DISABLED_CLASS,
  NXR_MENTION_PANEL_HOST_SELECTOR,
  NXR_MENTION_DEFAULT_PANEL_OFFSET,
  NXR_MENTION_DEFAULT_ARIA_LABEL,
} from './lib/constants/mention-constants';

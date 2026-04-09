/**
 * Public and internal types for the headless mention primitive.
 * Split across `mention-types-core` (model/config) and `mention-types-events` (callbacks/events).
 */

export type {
  MentionAttributes,
  MentionControllerState,
  MentionDocument,
  MentionEntity,
  MentionInsertion,
  MentionItemsResult,
  MentionLinearRange,
  MentionMatch,
  MentionPanelState,
  MentionSession,
  MentionTriggerConfig,
  MentionTriggerPanelOptions,
} from './mention-types-core';

export type {
  MentionBeforePasteHandler,
  MentionChipInteractionEvent,
  MentionInsertOptions,
  MentionOpenChangeHandler,
  MentionPasteEvent,
  MentionQueryChangeHandler,
  MentionSelectEvent,
  MentionSelectHandler,
} from './mention-types-events';

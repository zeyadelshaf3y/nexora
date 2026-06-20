/**
 * Public and internal types for the headless mention primitive.
 * Split across `mention-types-core` (model/config) and `mention-types-events` (callbacks/events).
 */

export type {
  MentionAttributes,
  MentionChipContext,
  MentionControllerState,
  MentionDocument,
  MentionEntity,
  MentionInsertion,
  MentionItemsResult,
  MentionLinearRange,
  MentionMatch,
  MentionPanelState,
  MentionPointerHighlight,
  MentionSession,
  MentionTriggerConfig,
  MentionTriggerPanelOptions,
} from './mention-types-core';

export type {
  MentionAttributesUpdate,
  MentionBeforePasteHandler,
  MentionChipInteractionEvent,
  MentionDataUpdate,
  MentionDocumentUpdater,
  MentionEntityPredicate,
  MentionEntityTarget,
  MentionFocusOptions,
  MentionInsertOptions,
  MentionOpenChangeHandler,
  MentionPasteEvent,
  MentionQueryChangeHandler,
  MentionReplaceOptions,
  MentionSelectEvent,
  MentionSelectHandler,
  MentionUpdateDocumentOptions,
  MentionUpsertOptions,
} from './mention-types-events';

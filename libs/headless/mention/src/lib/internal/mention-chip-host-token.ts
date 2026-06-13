import { InjectionToken } from '@angular/core';

/**
 * Host that owns mention chip rendering. Provided by {@link MentionDirective} so a
 * {@link MentionChipDirective} can notify it when the set of chip templates (or a trigger) changes,
 * without a direct import (which would be circular).
 */
export interface MentionChipTemplatesHost {
  /** Schedule a re-render of already-rendered chips against the current chip templates. */
  notifyChipTemplatesChanged(): void;
}

export const MENTION_CHIP_TEMPLATES_HOST = new InjectionToken<MentionChipTemplatesHost>(
  'MENTION_CHIP_TEMPLATES_HOST',
);

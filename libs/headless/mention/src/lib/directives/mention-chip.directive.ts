/**
 * Marker directive on an `<ng-template>` that supplies a custom visual template for mention chips.
 *
 * Usage:
 * - `<ng-template nxrMentionChip>` — default chip template for every trigger.
 * - `<ng-template nxrMentionChip="@">` — per-trigger override (resolved over the default).
 *
 * The template renders only the inner contents of a chip; the chip span (mention boundary and its
 * canonical `data-mention-text`) is always owned by the library. The template receives a
 * {@link MentionChipContext}.
 */

import { Directive, effect, inject, input, TemplateRef, type OnDestroy } from '@angular/core';

import { MENTION_CHIP_TEMPLATES_HOST } from '../internal/mention-chip-host-token';
import type { MentionChipContext } from '../types/mention-types';

@Directive({
  selector: 'ng-template[nxrMentionChip]',
  standalone: true,
})
export class MentionChipDirective implements OnDestroy {
  readonly templateRef = inject(TemplateRef<MentionChipContext>);
  private readonly host = inject(MENTION_CHIP_TEMPLATES_HOST, { optional: true });

  /**
   * Trigger character this template applies to (e.g. `'@'`, `'#'`). Empty string (the default
   * when the attribute has no value) registers the fallback template used for any trigger that
   * has no specific override.
   */
  readonly trigger = input<string>('', { alias: 'nxrMentionChip' });

  constructor() {
    // Notify the host when this template appears or its trigger changes so already-rendered chips
    // pick it up. The notify is coalesced/deferred by the host, so this never re-enters CD.
    effect(() => {
      this.trigger();
      this.host?.notifyChipTemplatesChanged();
    });
  }

  ngOnDestroy(): void {
    this.host?.notifyChipTemplatesChanged();
  }

  static ngTemplateContextGuard(
    _dir: MentionChipDirective,
    _ctx: unknown,
  ): _ctx is MentionChipContext {
    return true;
  }
}

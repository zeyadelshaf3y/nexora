/**
 * Directive applied to ng-template that provides the mention panel content.
 */

import { Directive, inject, TemplateRef } from '@angular/core';

import type { MentionPanelContext } from '../internal/mention-panel-host.component';

export type { MentionPanelContext };

@Directive({
  selector: 'ng-template[nxrMentionPanel]',
  standalone: true,
})
export class MentionPanelDirective<T = unknown> {
  readonly templateRef = inject(TemplateRef<MentionPanelContext<T>>);
}

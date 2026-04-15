import { Component, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import type { MentionDocument, MentionTriggerConfig } from '../types/mention-types';

import { MentionPanelDirective } from './mention-panel.directive';
import { MentionDirective } from './mention.directive';

@Component({
  standalone: true,
  imports: [MentionDirective, MentionPanelDirective],
  template: `
    <div
      nxrMention
      #mention="nxrMention"
      [nxrMentionTriggers]="triggers"
      nxrMentionChipClass="demo-chip"
      (mentionValueChange)="onValue($event)"
      (mentionDocumentChange)="onDocument($event)"
    >
      <ng-template nxrMentionPanel let-state="state" let-select="select">
        @for (item of state.items; track item.id) {
          <button type="button" (mousedown)="select(item)">{{ item.label }}</button>
        }
      </ng-template>
    </div>
  `,
})
class MentionHostComponent {
  readonly mention = viewChild.required<MentionDirective<{ id: string; label: string }>>('mention');

  readonly triggers: readonly MentionTriggerConfig<{ id: string; label: string }>[] = [
    {
      trigger: '@',
      openOnTrigger: true,
      getItems: () => [{ id: '1', label: 'Alice' }],
      displayWith: (item) => item.label,
    },
  ];

  valueEvents: string[] = [];
  documentEvents: MentionDocument[] = [];

  onValue(value: string): void {
    this.valueEvents.push(value);
  }

  onDocument(doc: MentionDocument): void {
    this.documentEvents.push(doc);
  }
}

describe('MentionDirective', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MentionHostComponent],
    });
  });

  it('dedupes mention value and document emissions for equivalent updates', () => {
    const fixture = TestBed.createComponent(MentionHostComponent);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const mention = host.mention();
    const initialValueEvents = host.valueEvents.length;
    const initialDocumentEvents = host.documentEvents.length;

    const doc: MentionDocument = {
      bodyText: 'Hello Alice',
      mentions: [{ id: 'u1', label: 'Alice', text: 'Alice', start: 6, end: 11 }],
    };

    mention.setDocument(doc);
    mention.setDocument({
      bodyText: 'Hello Alice',
      mentions: [{ id: 'u1', label: 'Alice', text: 'Alice', start: 6, end: 11 }],
    });

    expect(host.valueEvents.length - initialValueEvents).toBe(1);
    expect(host.documentEvents.length - initialDocumentEvents).toBe(0);
  });

  it('applies nxrMentionChipClass to chips restored via setDocument()', () => {
    const fixture = TestBed.createComponent(MentionHostComponent);
    fixture.detectChanges();
    const mention = fixture.componentInstance.mention();

    mention.setDocument({
      bodyText: 'Hello Alice',
      mentions: [
        {
          id: 'u1',
          label: 'Alice',
          text: 'Alice',
          start: 6,
          end: 11,
        },
      ],
    });

    const [chip] = mention.getChipElements();
    expect(chip).toBeTruthy();
    expect(chip.classList.contains('demo-chip')).toBe(true);
  });
});

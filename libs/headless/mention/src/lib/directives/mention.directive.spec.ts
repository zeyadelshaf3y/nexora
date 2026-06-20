import { Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import type {
  MentionChipInteractionEvent,
  MentionDocument,
  MentionTriggerConfig,
} from '../types/mention-types';

import { MentionChipDirective } from './mention-chip.directive';
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
      (mentionChipClick)="onChipClick($event)"
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
      insertWith: (item) => ({
        replacementText: item.label,
        mentionId: item.id,
        mentionLabel: item.label,
        mentionAttributes: { 'data-mention-trigger': '@' },
        mentionData: { kind: 'user', refId: item.id },
      }),
    },
  ];

  valueEvents: string[] = [];
  documentEvents: MentionDocument[] = [];
  chipClicks: MentionChipInteractionEvent[] = [];

  onValue(value: string): void {
    this.valueEvents.push(value);
  }

  onDocument(doc: MentionDocument): void {
    this.documentEvents.push(doc);
  }

  onChipClick(event: MentionChipInteractionEvent): void {
    this.chipClicks.push(event);
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

  it('upserts a mention by id using insert semantics', () => {
    const fixture = TestBed.createComponent(MentionHostComponent);
    fixture.detectChanges();
    const mention = fixture.componentInstance.mention();

    expect(
      mention.upsertMention({ id: 'u1', label: 'Alice' }, { mentionId: 'u1', fallbackAt: 'end' }),
    ).toBe(true);
    expect(mention.getDocument().bodyText).toBe('Alice \n');

    expect(
      mention.upsertMention({ id: 'u1', label: 'Alicia' }, { mentionId: 'u1', fallbackAt: 'end' }),
    ).toBe(true);

    const doc = mention.getDocument();
    expect(doc.bodyText).toBe('Alicia \n');
    expect(doc.mentions.length).toBe(1);
    expect(doc.mentions[0]?.id).toBe('u1');
    expect(doc.mentions[0]?.label).toBe('Alicia');
  });

  it('replaces and removes existing mentions by id', () => {
    const fixture = TestBed.createComponent(MentionHostComponent);
    fixture.detectChanges();
    const mention = fixture.componentInstance.mention();

    mention.setDocument({
      bodyText: 'Hello Alice and Bob',
      mentions: [
        { id: 'u1', label: 'Alice', text: 'Alice', start: 6, end: 11 },
        { id: 'u2', label: 'Bob', text: 'Bob', start: 16, end: 19 },
      ],
    });

    expect(mention.replaceMention('u1', { id: 'u1', label: 'Alicia' })).toBe(true);
    expect(mention.replaceMention('missing', { id: 'u3', label: 'Carol' })).toBe(false);
    expect(mention.removeMention('u2')).toBe(true);

    const doc = mention.getDocument();
    expect(doc.bodyText).toBe('Hello Alicia and ');
    expect(doc.mentions.map((m) => m.id)).toEqual(['u1']);
  });

  it('updates mention attributes in place and emits document changes', () => {
    const fixture = TestBed.createComponent(MentionHostComponent);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const mention = host.mention();

    mention.setDocument({
      bodyText: 'Hello Alice',
      mentions: [
        {
          id: 'u1',
          label: 'Alice',
          text: 'Alice',
          start: 6,
          end: 11,
          attributes: { 'data-initials': 'AS' },
        },
      ],
    });
    const initialDocumentEvents = host.documentEvents.length;

    expect(mention.updateMentionAttributes('u1', { 'data-initials': 'AA' })).toBe(true);

    const chip = mention.getChipElement('u1');
    expect(chip?.getAttribute('data-initials')).toBe('AA');
    expect(chip?.classList.contains('demo-chip')).toBe(true);
    expect(mention.getDocument().mentions[0]?.attributes?.['data-initials']).toBe('AA');
    expect(host.documentEvents.length).toBeGreaterThan(initialDocumentEvents);
  });

  it('selects mention ranges and focuses mention chips', () => {
    const fixture = TestBed.createComponent(MentionHostComponent);
    fixture.detectChanges();
    const mention = fixture.componentInstance.mention();

    mention.setDocument({
      bodyText: 'Hello Alice',
      mentions: [{ id: 'u1', label: 'Alice', text: 'Alice', start: 6, end: 11 }],
    });

    expect(mention.selectMentionRange('u1')).toBe(true);
    expect(mention.focusMention('u1', { select: 'after' })).toBe(true);
  });

  it('targets the correct chip when mentions share an id (matcher by index)', () => {
    const fixture = TestBed.createComponent(MentionHostComponent);
    fixture.detectChanges();
    const mention = fixture.componentInstance.mention();

    mention.setDocument({
      bodyText: 'Hi Alice Alice',
      mentions: [
        { id: 'u1', label: 'Alice', text: 'Alice', start: 3, end: 8 },
        { id: 'u1', label: 'Alice', text: 'Alice', start: 9, end: 14 },
      ],
    });

    expect(mention.updateMentionAttributes((_m, i) => i === 1, { 'data-initials': 'AA' })).toBe(
      true,
    );

    const chips = mention.getChipElements();
    expect(chips.length).toBe(2);
    expect(chips[0]?.getAttribute('data-initials')).toBeNull();
    expect(chips[1]?.getAttribute('data-initials')).toBe('AA');
  });

  it('updateDocument emits by default and can suppress document emission', () => {
    const fixture = TestBed.createComponent(MentionHostComponent);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const mention = host.mention();
    const initialDocumentEvents = host.documentEvents.length;

    mention.updateDocument(() => ({ bodyText: 'Hello', mentions: [] }));
    expect(host.documentEvents.length).toBeGreaterThan(initialDocumentEvents);

    const afterEmittingUpdate = host.documentEvents.length;
    mention.updateDocument(() => ({ bodyText: 'Hello again', mentions: [] }), { emit: false });

    expect(host.documentEvents.length).toBe(afterEmittingUpdate);
    expect(mention.getPlainText()).toBe('Hello again');
  });

  it('insertMention forwards insertWith mentionData to the document', () => {
    const fixture = TestBed.createComponent(MentionHostComponent);
    fixture.detectChanges();
    const mention = fixture.componentInstance.mention();

    expect(mention.insertMention({ id: 'u1', label: 'Alice' }, { at: 'end' })).toBe(true);
    expect(mention.getDocument().mentions[0]?.data).toEqual({ kind: 'user', refId: 'u1' });
  });

  it('round-trips a structured data payload through setDocument/getMentions and re-serialize', () => {
    const fixture = TestBed.createComponent(MentionHostComponent);
    fixture.detectChanges();
    const mention = fixture.componentInstance.mention();

    const data = { kind: 'team', refId: 't1', handle: 'eng' };
    mention.setDocument({
      bodyText: 'Hello Alice',
      mentions: [{ id: 'u1', label: 'Alice', text: 'Alice', start: 6, end: 11, data }],
    });

    expect(mention.getMentions()[0]?.data).toEqual(data);

    // Serialize -> restore -> still present.
    const serialized = mention.getDocument();
    mention.setDocument(serialized);
    expect(mention.getMentions()[0]?.data).toEqual(data);
  });

  it('emits mentionDocumentChange when only data changes, and suppresses an identical update', () => {
    const fixture = TestBed.createComponent(MentionHostComponent);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const mention = host.mention();

    mention.setDocument({
      bodyText: 'Hello Alice',
      mentions: [{ id: 'u1', label: 'Alice', text: 'Alice', start: 6, end: 11, data: { v: 1 } }],
    });
    const baseline = host.documentEvents.length;

    mention.updateDocument((doc) => ({
      ...doc,
      mentions: doc.mentions.map((m) => ({ ...m, data: { v: 2 } })),
    }));
    expect(host.documentEvents.length).toBeGreaterThan(baseline);

    const afterChange = host.documentEvents.length;
    mention.updateDocument((doc) => ({
      ...doc,
      mentions: doc.mentions.map((m) => ({ ...m, data: { v: 2 } })),
    }));
    expect(host.documentEvents.length).toBe(afterChange);
  });

  it('updateMentionData patches the payload in place', () => {
    const fixture = TestBed.createComponent(MentionHostComponent);
    fixture.detectChanges();
    const mention = fixture.componentInstance.mention();

    mention.setDocument({
      bodyText: 'Hello Alice',
      mentions: [{ id: 'u1', label: 'Alice', text: 'Alice', start: 6, end: 11, data: { v: 1 } }],
    });

    expect(mention.updateMentionData('u1', { v: 2, extra: true })).toBe(true);
    expect(mention.getMentions()[0]?.data).toEqual({ v: 2, extra: true });
  });

  it('exposes data on the mentionChipClick interaction event', () => {
    const fixture = TestBed.createComponent(MentionHostComponent);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const mention = host.mention();

    mention.setDocument({
      bodyText: 'Hello Alice',
      mentions: [
        { id: 'u1', label: 'Alice', text: 'Alice', start: 6, end: 11, data: { kind: 'user' } },
      ],
    });

    const chip = mention.getChipElement('u1');
    chip?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(host.chipClicks.at(-1)?.entity.data).toEqual({ kind: 'user' });
  });
});

@Component({
  standalone: true,
  imports: [MentionDirective, MentionPanelDirective, MentionChipDirective],
  template: `
    <div nxrMention #mention="nxrMention" [nxrMentionTriggers]="triggers">
      <ng-template nxrMentionChip let-text="text">
        <span class="default-chip">{{ text }}</span>
      </ng-template>
      <ng-template nxrMentionChip="@" let-mention="mention" let-text="text">
        <span class="user-chip" [attr.data-initials]="mention.attributes?.['data-initials']">{{
          text
        }}</span>
      </ng-template>
      <ng-template nxrMentionPanel let-state="state" let-select="select">
        @for (item of state.items; track item.id) {
          <button type="button" (mousedown)="select(item)">{{ item.label }}</button>
        }
      </ng-template>
    </div>
  `,
})
class ChipTemplateHostComponent {
  readonly mention = viewChild.required<MentionDirective<{ id: string; label: string }>>('mention');

  readonly triggers: readonly MentionTriggerConfig<{ id: string; label: string }>[] = [
    {
      trigger: '@',
      openOnTrigger: true,
      getItems: () => [{ id: '1', label: 'Alice' }],
      displayWith: (item) => item.label,
    },
  ];
}

describe('MentionDirective custom chip templates', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ChipTemplateHostComponent] });
  });

  it('hydrates a restored chip with the per-trigger template', () => {
    const fixture = TestBed.createComponent(ChipTemplateHostComponent);
    fixture.detectChanges();
    const mention = fixture.componentInstance.mention();

    mention.setDocument({
      bodyText: 'Hello @alice',
      mentions: [
        {
          id: 'u1',
          label: 'Alice',
          text: '@alice',
          start: 6,
          end: 12,
          attributes: { 'data-mention-trigger': '@', 'data-initials': 'AS' },
        },
      ],
    });
    fixture.detectChanges();

    const [chip] = mention.getChipElements();
    const rendered = chip.querySelector('.user-chip');
    expect(rendered).toBeTruthy();
    expect(rendered?.getAttribute('data-initials')).toBe('AS');
    expect(rendered?.textContent).toBe('@alice');
    // Canonical model is unaffected by the rich inner DOM.
    expect(mention.getDocument().bodyText).toBe('Hello @alice');
    expect(mention.getDocument().mentions[0]?.text).toBe('@alice');
  });

  it('falls back to the default template when no per-trigger template matches', () => {
    const fixture = TestBed.createComponent(ChipTemplateHostComponent);
    fixture.detectChanges();
    const mention = fixture.componentInstance.mention();

    mention.setDocument({
      bodyText: 'Tag #ng',
      mentions: [
        {
          id: 't1',
          label: 'ng',
          text: '#ng',
          start: 4,
          end: 7,
          attributes: { 'data-mention-trigger': '#' },
        },
      ],
    });
    fixture.detectChanges();

    const [chip] = mention.getChipElements();
    expect(chip.querySelector('.default-chip')).toBeTruthy();
    expect(chip.querySelector('.user-chip')).toBeNull();
  });

  it('does not leak hydration plumbing into the serialized document and re-hydrates on restore', () => {
    const fixture = TestBed.createComponent(ChipTemplateHostComponent);
    fixture.detectChanges();
    const mention = fixture.componentInstance.mention();

    mention.setDocument({
      bodyText: 'Hello @alice',
      mentions: [
        {
          id: 'u1',
          label: 'Alice',
          text: '@alice',
          start: 6,
          end: 12,
          attributes: { 'data-mention-trigger': '@', 'data-initials': 'AS' },
        },
      ],
    });
    fixture.detectChanges();
    expect(mention.getChipElements()[0]?.querySelector('.user-chip')).toBeTruthy();

    const serialized = mention.getDocument();
    const serializedAttrs = serialized.mentions[0]?.attributes ?? {};
    // No internal hydration marker should ride along in the saved document.
    expect(Object.keys(serializedAttrs).some((k) => k.startsWith('data-nxr-chip'))).toBe(false);
    expect(serializedAttrs['data-mention-trigger']).toBe('@');
    expect(serializedAttrs['data-initials']).toBe('AS');

    // Restoring the serialized document re-hydrates the chip with its template.
    mention.setDocument(serialized);
    fixture.detectChanges();
    expect(mention.getChipElements()[0]?.querySelector('.user-chip')).toBeTruthy();
  });

  it('keeps a chip view when the chip is relocated within the editor (line merge)', async () => {
    const fixture = TestBed.createComponent(ChipTemplateHostComponent);
    fixture.detectChanges();
    const mention = fixture.componentInstance.mention();

    mention.setDocument({
      bodyText: 'Hello @alice',
      mentions: [
        {
          id: 'u1',
          label: 'Alice',
          text: '@alice',
          start: 6,
          end: 12,
          attributes: { 'data-mention-trigger': '@', 'data-initials': 'AS' },
        },
      ],
    });
    fixture.detectChanges();

    const [chip] = mention.getChipElements();
    const rendered = chip.querySelector('.user-chip');
    expect(rendered).toBeTruthy();

    // Simulate a line merge: relocate the chip span elsewhere inside the editor root.
    const root = chip.closest('[contenteditable="true"]');
    expect(root).toBeTruthy();
    root?.appendChild(chip);

    // Flush the MutationObserver (microtask delivery in jsdom).
    await new Promise((resolve) => setTimeout(resolve));

    // The relocated chip must still carry its rendered template (not destroyed/blanked).
    expect(chip.isConnected).toBe(true);
    expect(chip.querySelector('.user-chip')).toBe(rendered);
  });

  it('cleans up hydrated chips on chip removal and on destroy without error', () => {
    const fixture = TestBed.createComponent(ChipTemplateHostComponent);
    fixture.detectChanges();
    const mention = fixture.componentInstance.mention();

    mention.setDocument({
      bodyText: 'Hello @alice',
      mentions: [
        {
          id: 'u1',
          label: 'Alice',
          text: '@alice',
          start: 6,
          end: 12,
          attributes: { 'data-mention-trigger': '@', 'data-initials': 'AS' },
        },
      ],
    });
    fixture.detectChanges();
    expect(mention.getChipElements().length).toBe(1);

    // Removing chips via an empty document must not throw (views are destroyed).
    mention.setDocument({ bodyText: '', mentions: [] });
    fixture.detectChanges();
    expect(mention.getChipElements().length).toBe(0);

    expect(() => fixture.destroy()).not.toThrow();
  });

  it('refreshes a custom chip template after attribute updates', () => {
    const fixture = TestBed.createComponent(ChipTemplateHostComponent);
    fixture.detectChanges();
    const mention = fixture.componentInstance.mention();

    mention.setDocument({
      bodyText: 'Hello @alice',
      mentions: [
        {
          id: 'u1',
          label: 'Alice',
          text: '@alice',
          start: 6,
          end: 12,
          attributes: { 'data-mention-trigger': '@', 'data-initials': 'AS' },
        },
      ],
    });
    fixture.detectChanges();

    expect(mention.updateMentionAttributes('u1', { 'data-initials': 'AA' })).toBe(true);
    fixture.detectChanges();

    const rendered = mention.getChipElement('u1')?.querySelector('.user-chip');
    expect(rendered?.getAttribute('data-initials')).toBe('AA');
  });
});

@Component({
  standalone: true,
  imports: [MentionDirective, MentionPanelDirective, MentionChipDirective],
  template: `
    <div nxrMention #mention="nxrMention" [nxrMentionTriggers]="triggers">
      <ng-template [nxrMentionChip]="chipTrigger()" let-text="text">
        <span class="dyn-chip">{{ text }}</span>
      </ng-template>
      <ng-template nxrMentionPanel let-state="state" let-select="select">
        @for (item of state.items; track item.id) {
          <button type="button" (mousedown)="select(item)">{{ item.label }}</button>
        }
      </ng-template>
    </div>
  `,
})
class DynamicChipTemplateHostComponent {
  // Initially the chip template is registered for '#', so an '@' mention has no matching template.
  readonly chipTrigger = signal('#');

  readonly mention = viewChild.required<MentionDirective<{ id: string; label: string }>>('mention');

  readonly triggers: readonly MentionTriggerConfig<{ id: string; label: string }>[] = [
    {
      trigger: '@',
      openOnTrigger: true,
      getItems: () => [{ id: '1', label: 'Alice' }],
      displayWith: (item) => item.label,
    },
  ];
}

describe('MentionDirective dynamic chip templates', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [DynamicChipTemplateHostComponent] });
  });

  it('re-renders existing chips when a chip template trigger changes', async () => {
    const fixture = TestBed.createComponent(DynamicChipTemplateHostComponent);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const mention = host.mention();

    mention.setDocument({
      bodyText: 'Hello @alice',
      mentions: [
        {
          id: 'u1',
          label: 'Alice',
          text: '@alice',
          start: 6,
          end: 12,
          attributes: { 'data-mention-trigger': '@' },
        },
      ],
    });
    fixture.detectChanges();

    // Template only matches '#': the '@' chip keeps its plain-text fallback.
    expect(mention.getChipElements()[0]?.querySelector('.dyn-chip')).toBeNull();
    expect(mention.getChipElements()[0]?.textContent).toBe('@alice');

    // Pointing the template at '@' re-hydrates the already-rendered chip (deferred to a microtask).
    host.chipTrigger.set('@');
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve));

    const rendered = mention.getChipElements()[0]?.querySelector('.dyn-chip');
    expect(rendered).toBeTruthy();
    expect(rendered?.textContent).toBe('@alice');

    // Pointing it away again restores the canonical plain-text fallback.
    host.chipTrigger.set('#');
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve));
    const chip = mention.getChipElements()[0];
    expect(chip?.querySelector('.dyn-chip')).toBeNull();
    expect(chip?.textContent).toBe('@alice');
  });
});

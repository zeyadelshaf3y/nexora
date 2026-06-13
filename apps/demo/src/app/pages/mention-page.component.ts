import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import type {
  MentionChipInteractionEvent,
  MentionDocument,
  MentionPasteEvent,
  MentionTriggerConfig,
} from '@nexora-ui/mention';
import {
  MentionChipDirective,
  MentionDirective,
  MentionFooterDirective,
  MentionHeaderDirective,
  MentionOptionDirective,
  MentionPanelDirective,
  MentionScrollIntoViewDirective,
} from '@nexora-ui/mention';
import { PopoverTriggerDirective } from '@nexora-ui/popover';

interface User {
  readonly id: string;
  readonly username: string;
  readonly displayName: string;
  readonly role?: string;
}

interface Tag {
  readonly id: string;
  readonly slug: string;
  readonly label: string;
}

interface Command {
  readonly id: string;
  readonly name: string;
  readonly description: string;
}

type MentionItem = User | Tag | Command;

const DEMO_USERS: readonly User[] = [
  { id: '1', username: 'alice', displayName: 'Alice Smith', role: 'admin' },
  { id: '2', username: 'bob', displayName: 'Bob Jones', role: 'user' },
  { id: '3', username: 'charlie', displayName: 'Charlie Brown', role: 'user' },
  { id: '4', username: 'diana', displayName: 'Diana Prince', role: 'mod' },
  { id: '5', username: 'eve', displayName: 'Eve Wilson', role: 'user' },
  { id: '6', username: 'frank', displayName: 'Frank Smith', role: 'admin' },
  { id: '7', username: 'george', displayName: 'George Jones', role: 'user' },
  { id: '8', username: 'harry', displayName: 'Harry Potter', role: 'mod' },
  { id: '9', username: 'isaac', displayName: 'Isaac Wilson', role: 'user' },
  { id: '10', username: 'james', displayName: 'James Smith', role: 'admin' },
  { id: '11', username: 'karen', displayName: 'Karen Jones', role: 'user' },
  { id: '12', username: 'larry', displayName: 'Larry Potter', role: 'mod' },
  { id: '13', username: 'mike', displayName: 'Mike Wilson', role: 'user' },
  { id: '14', username: 'nancy', displayName: 'Nancy Smith', role: 'admin' },
  { id: '15', username: 'oliver', displayName: 'Oliver Jones', role: 'user' },
  { id: '16', username: 'paul', displayName: 'Paul Potter', role: 'mod' },
  { id: '17', username: 'quinn', displayName: 'Quinn Wilson', role: 'user' },
  { id: '18', username: 'ryan', displayName: 'Ryan Smith', role: 'admin' },
  { id: '19', username: 'sara', displayName: 'Sara Jones', role: 'user' },
  { id: '20', username: 'taylor', displayName: 'Taylor Potter', role: 'mod' },
  { id: '21', username: 'uwe', displayName: 'Uwe Wilson', role: 'user' },
  { id: '22', username: 'victor', displayName: 'Victor Smith', role: 'admin' },
  { id: '23', username: 'wendy', displayName: 'Wendy Jones', role: 'user' },
  { id: '24', username: 'xavier', displayName: 'Xavier Potter', role: 'mod' },
  { id: '25', username: 'yasmine', displayName: 'Yasmine Wilson', role: 'user' },
  { id: '26', username: 'zach', displayName: 'Zach Smith', role: 'admin' },
  { id: '27', username: 'alice', displayName: 'Alice Smith', role: 'admin' },
  { id: '28', username: 'bob', displayName: 'Bob Jones', role: 'user' },
  { id: '29', username: 'charlie', displayName: 'Charlie Brown', role: 'user' },
  { id: '30', username: 'diana', displayName: 'Diana Prince', role: 'mod' },
  { id: '31', username: 'eve', displayName: 'Eve Wilson', role: 'user' },
];

const DEMO_TAGS: readonly Tag[] = [
  { id: '1', slug: 'angular', label: 'Angular' },
  { id: '2', slug: 'react', label: 'React' },
  { id: '3', slug: 'vue', label: 'Vue' },
  { id: '4', slug: 'nx', label: 'Nx' },
  { id: '5', slug: 'typescript', label: 'TypeScript' },
];

const DEMO_COMMANDS: readonly Command[] = [
  { id: 'ban', name: '/ban', description: 'Ban a user' },
  { id: 'kick', name: '/kick', description: 'Kick a user' },
  { id: 'mute', name: '/mute', description: 'Mute a user' },
  { id: 'pin', name: '/pin', description: 'Pin a message' },
];

const AVATAR_COLORS = [
  '#6366f1',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#8b5cf6',
  '#ef4444',
  '#14b8a6',
] as const;

function userInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const second = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + second).toUpperCase();
}

function userColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length] as string;
}

function filterUsers(query: string): User[] {
  const q = query.toLowerCase().trim();
  if (!q) return DEMO_USERS.slice(0, 5);
  return DEMO_USERS.filter(
    (u) => u.username.toLowerCase().includes(q) || u.displayName.toLowerCase().includes(q),
  );
}

function filterTags(query: string): Tag[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return DEMO_TAGS.filter(
    (t) => t.slug.toLowerCase().includes(q) || t.label.toLowerCase().includes(q),
  );
}

function filterCommands(query: string): Command[] {
  const q = query.toLowerCase().trim();
  if (!q) return DEMO_COMMANDS.slice();
  return DEMO_COMMANDS.filter(
    (c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q),
  );
}

function isUser(item: MentionItem): item is User {
  return 'username' in item;
}

function isTag(item: MentionItem): item is Tag {
  return 'slug' in item;
}

function isCommand(item: MentionItem): item is Command {
  return 'name' in item && 'description' in item;
}

function asMentionItem(value: unknown): MentionItem | null {
  if (!value || typeof value !== 'object') return null;
  if (isUser(value as MentionItem)) return value as User;
  if (isTag(value as MentionItem)) return value as Tag;
  if (isCommand(value as MentionItem)) return value as Command;
  return null;
}

function cloneMentionDocument(d: MentionDocument): MentionDocument {
  return {
    bodyText: d.bodyText,
    mentions: d.mentions.map((m) => ({
      ...m,
      attributes: m.attributes ? { ...m.attributes } : undefined,
    })),
  };
}

@Component({
  selector: 'app-mention-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MentionDirective,
    MentionPanelDirective,
    MentionChipDirective,
    MentionHeaderDirective,
    MentionFooterDirective,
    MentionScrollIntoViewDirective,
    MentionOptionDirective,
    PopoverTriggerDirective,
  ],
  templateUrl: './mention-page.component.html',
})
export class MentionPageComponent {
  readonly DEMO_USERS = DEMO_USERS;

  readonly basicValue = signal('');
  readonly multiTriggerValue = signal('');
  readonly asyncValue = signal('');
  readonly textareaValue = signal('');
  readonly outputsValue = signal('');
  readonly reactiveFormValue = signal('');
  readonly minQueryValue = signal('');
  readonly docValue = signal('');
  readonly liveDoc = signal<MentionDocument>({ bodyText: '', mentions: [] });
  readonly savedDoc = signal<MentionDocument | null>(null);
  readonly submittedDoc = signal<MentionDocument | null>(null);

  readonly lastSelect = signal<{ item: unknown; trigger: string } | null>(null);
  readonly lastOpenChange = signal<boolean | null>(null);
  readonly lastQueryChange = signal<string | null>(null);
  readonly lastFocus = signal(false);
  readonly lastBlur = signal(false);

  readonly editorDisabled = signal(false);
  readonly lifecycleLog = signal<string[]>([]);
  readonly pasteLog = signal<string[]>([]);
  readonly chipHoverUser = signal<User | null>(null);
  readonly chipHoverAnchor = signal<HTMLElement | null>(null);
  readonly apiResultJson = signal('');

  readonly apiEditor = viewChild<MentionDirective<User>>('apiEditor');
  readonly chipHoverPopover = viewChild<PopoverTriggerDirective>('chipHoverPopover');

  readonly userTriggers: readonly MentionTriggerConfig<User>[] = [
    {
      trigger: '@',
      openOnTrigger: true,
      minQueryLength: 0,
      allowSpacesInQuery: true,
      requireLeadingBoundary: true,
      getItems: (query) => filterUsers(query),
      displayWith: (u) => u.displayName,
      insertWith: (u) => ({
        replacementText: `${u.displayName} `,
        caretPlacement: 'end',
        mentionId: u.id,
        mentionLabel: u.displayName,
      }),

      getMentionClass: () => 'demo-chip-user',
      // Presentational data for the custom chip template. Lives in attributes so it round-trips
      // through getDocument()/setDocument() and renders identically on insert and restore.
      getMentionAttributes: (u) => ({
        'data-initials': userInitials(u.displayName),
        'data-color': userColor(u.id),
      }),
      selectOnEnter: true,
      selectOnTab: true,
      closeOnSelect: true,
    },
  ];

  onChipHoverEnter(event: MentionChipInteractionEvent): void {
    const user = DEMO_USERS.find((u) => u.id === event.entity.id);
    if (!user) return;
    this.chipHoverUser.set(user);
    this.chipHoverAnchor.set(event.element);
    // Wait a paint so the new [nxrPopoverAnchor] input is applied before opening.
    requestAnimationFrame(() => this.chipHoverPopover()?.open('hover'));
  }

  onChipHoverClick(event: MentionChipInteractionEvent): void {
    const user = DEMO_USERS.find((u) => u.id === event.entity.id);
    if (!user) return;
    this.chipHoverUser.set(user);
    this.chipHoverAnchor.set(event.element);
    requestAnimationFrame(() => this.chipHoverPopover()?.open('click'));
  }

  onChipHoverPopoverClosed(): void {
    this.chipHoverUser.set(null);
    this.chipHoverAnchor.set(null);
  }

  readonly chromeTriggers: readonly MentionTriggerConfig<User>[] = [
    {
      trigger: '@',
      openOnTrigger: true,
      selectOnTab: true,
      getItems: (query) => filterUsers(query),
      displayWith: (u) => u.displayName,
      insertWith: (u) => ({
        replacementText: `${u.displayName} `,
        caretPlacement: 'end' as const,
        mentionId: u.id,
        mentionLabel: u.displayName,
      }),
      getMentionClass: () => 'demo-chip-user',
      selectOnEnter: true,
    },
  ];

  readonly multiTriggers: readonly MentionTriggerConfig<MentionItem>[] = [
    {
      trigger: '@',
      openOnTrigger: true,
      minQueryLength: 0,
      allowSpacesInQuery: true,
      requireLeadingBoundary: true,
      getItems: (query) => filterUsers(query),
      displayWith: (item) => {
        if (isUser(item)) return item.displayName;
        if (isTag(item)) return item.label;
        return item.name;
      },
      insertWith: (item) => {
        if (isUser(item)) {
          return {
            replacementText: `@${item.username} `,
            caretPlacement: 'end',
            mentionId: item.id,
            mentionLabel: item.displayName,
          };
        }
        if (isTag(item)) {
          return {
            replacementText: `#${item.slug} `,
            caretPlacement: 'end',
            mentionId: item.id,
            mentionLabel: item.label,
          };
        }
        return {
          replacementText: `${item.name} `,
          caretPlacement: 'end',
          mentionId: item.id,
          mentionLabel: item.name,
        };
      },
      getMentionClass: (item) => {
        if (isUser(item)) return 'demo-chip-user';
        if (isTag(item)) return 'demo-chip-tag';
        return 'demo-chip-command';
      },
      selectOnEnter: true,
      closeOnSelect: true,
    },
    {
      trigger: '#',
      openOnTrigger: false,
      minQueryLength: 1,
      requireLeadingBoundary: true,
      getItems: (query) => filterTags(query),
      displayWith: (item) => (isTag(item) ? item.label : ''),
      insertWith: (item) => ({
        replacementText: isTag(item) ? `#${item.slug} ` : '',
        caretPlacement: 'end',
        mentionId: item.id,
        mentionLabel: isTag(item) ? item.label : undefined,
      }),
      getMentionClass: () => 'demo-chip-tag',
      selectOnEnter: true,
      closeOnSelect: true,
    },
    {
      trigger: '/',
      openOnTrigger: true,
      minQueryLength: 0,
      requireLeadingBoundary: true,
      getItems: (query) => filterCommands(query),
      displayWith: (item) => (isCommand(item) ? item.name : ''),
      insertWith: (item) => ({
        replacementText: isCommand(item) ? `${item.name} ` : '',
        caretPlacement: 'end',
        mentionId: item.id,
        mentionLabel: isCommand(item) ? item.name : undefined,
      }),
      getMentionClass: () => 'demo-chip-command',
      selectOnEnter: true,
      closeOnSelect: true,
    },
  ];

  readonly asyncTriggers: readonly MentionTriggerConfig<User>[] = [
    {
      trigger: '@',
      openOnTrigger: true,
      minQueryLength: 0,
      allowSpacesInQuery: true,
      requireLeadingBoundary: true,
      getItems: (query) =>
        new Promise<User[]>((resolve) => {
          setTimeout(() => resolve(filterUsers(query)), 300);
        }),
      displayWith: (u) => u.displayName,
      insertWith: (u) => ({
        replacementText: `@${u.username} `,
        caretPlacement: 'end',
        mentionId: u.id,
        mentionLabel: u.displayName,
      }),
      getMentionClass: () => 'demo-chip-user',
      selectOnEnter: true,
      closeOnSelect: true,
    },
  ];

  readonly minQueryTriggers: readonly MentionTriggerConfig<Tag>[] = [
    {
      trigger: '#',
      openOnTrigger: false,
      minQueryLength: 1,
      requireLeadingBoundary: true,
      getItems: (query) => filterTags(query),
      displayWith: (t) => t.label,
      insertWith: (t) => ({
        replacementText: `#${t.slug} `,
        caretPlacement: 'end',
        mentionId: t.id,
        mentionLabel: t.label,
      }),
      getMentionClass: () => 'demo-chip-tag',
      selectOnEnter: true,
      closeOnSelect: true,
    },
  ];

  readonly lifecycleTriggers: readonly MentionTriggerConfig<User>[] = [
    {
      trigger: '@',
      openOnTrigger: true,
      minQueryLength: 0,
      allowSpacesInQuery: true,
      requireLeadingBoundary: true,
      getItems: (query) => filterUsers(query),
      displayWith: (u) => u.displayName,
      insertWith: (u) => ({
        replacementText: `${u.displayName} `,
        caretPlacement: 'end',
        mentionId: u.id,
        mentionLabel: u.displayName,
      }),
      getMentionClass: () => 'demo-chip-user',
      selectOnEnter: true,
      closeOnSelect: true,
      beforeInsert: (item) => {
        this.lifecycleLog.update((log) => [...log, `beforeInsert: ${item.displayName}`]);
        return true;
      },
      afterInsert: (item) => {
        this.lifecycleLog.update((log) => [...log, `afterInsert: ${item.displayName}`]);
      },
    },
  ];

  onMentionSelect(payload: { item: unknown; trigger: string }): void {
    this.lastSelect.set(payload);
  }

  onMentionOpenChange(open: boolean): void {
    this.lastOpenChange.set(open);
  }

  onMentionQueryChange(query: string): void {
    this.lastQueryChange.set(query);
  }

  onDocumentChange(doc: MentionDocument): void {
    this.liveDoc.set(doc);
  }

  onFocus(): void {
    this.lastFocus.set(true);
    this.lastBlur.set(false);
  }

  onBlur(): void {
    this.lastBlur.set(true);
    this.lastFocus.set(false);
  }

  saveCurrentDocument(): void {
    this.savedDoc.set(cloneMentionDocument(this.liveDoc()));
  }

  clearEditorDocument(): void {
    this.savedDoc.set({ bodyText: '', mentions: [] });
  }

  loadDemoMentionDocument(): void {
    const bodyText = [
      'Please verify with @alice about the update.',
      '',
      'Thanks @bob',
      '',
      '',
      'Tracking #angular here.',
    ].join('\n');

    const aliceAt = bodyText.indexOf('@alice');
    const bobAt = bodyText.indexOf('@bob');
    const angularAt = bodyText.indexOf('#angular');

    this.savedDoc.set({
      bodyText,
      mentions: [
        {
          id: '1',
          label: 'Alice Smith',
          text: '@alice',
          start: aliceAt,
          end: aliceAt + '@alice'.length,
          attributes: { class: 'demo-chip-user' },
        },
        {
          id: '2',
          label: 'Bob Jones',
          text: '@bob',
          start: bobAt,
          end: bobAt + '@bob'.length,
          attributes: { class: 'demo-chip-user' },
        },
        {
          id: '1',
          label: 'Angular',
          text: '#angular',
          start: angularAt,
          end: angularAt + '#angular'.length,
          attributes: { class: 'demo-chip-tag' },
        },
      ],
    });
  }

  reapplySavedDocument(): void {
    const s = this.savedDoc();
    if (!s) return;
    this.savedDoc.set(cloneMentionDocument(s));
  }

  submitDocument(): void {
    this.submittedDoc.set(cloneMentionDocument(this.liveDoc()));
  }

  toggleDisabled(): void {
    this.editorDisabled.update((v) => !v);
  }

  onBeforePaste = (event: MentionPasteEvent): void => {
    this.pasteLog.update((log) => [...log, `Paste: plain="${event.plainText.slice(0, 50)}"`]);
  };

  apiGetMentions(): void {
    const editor = this.apiEditor();
    if (!editor) return;
    this.apiResultJson.set(JSON.stringify(editor.getMentions(), null, 2));
  }

  apiGetDocument(): void {
    const editor = this.apiEditor();
    if (!editor) return;
    this.apiResultJson.set(JSON.stringify(editor.getDocument(), null, 2));
  }

  apiGetPlainText(): void {
    const editor = this.apiEditor();
    if (!editor) return;
    this.apiResultJson.set(JSON.stringify(editor.getPlainText()));
  }

  apiSetDocument(): void {
    const editor = this.apiEditor();
    if (!editor) return;
    const bodyText = 'Review with Alice and Bob';
    const aliceStart = bodyText.indexOf('Alice');
    const bobStart = bodyText.indexOf('Bob');

    editor.setDocument({
      bodyText,
      mentions: [
        {
          id: '1',
          label: 'Alice Smith',
          text: 'Alice',
          start: aliceStart,
          end: aliceStart + 'Alice'.length,
          attributes: this.userMentionAttributes(DEMO_USERS[0]),
        },
        {
          id: '2',
          label: 'Bob Jones',
          text: 'Bob',
          start: bobStart,
          end: bobStart + 'Bob'.length,
          attributes: this.userMentionAttributes(DEMO_USERS[1]),
        },
      ],
    });
    this.setApiResult('setDocument()', editor.getDocument());
  }

  apiUpdateDocument(): void {
    const editor = this.apiEditor();
    if (!editor) return;
    const doc = editor.updateDocument((current) => ({
      bodyText: `${current.bodyText}${current.bodyText ? '\n' : ''}Follow up tomorrow.`,
      mentions: current.mentions,
    }));
    this.setApiResult('updateDocument()', doc);
  }

  apiClear(): void {
    this.apiEditor()?.clear();
    this.apiResultJson.set('');
  }

  apiFocus(): void {
    this.apiEditor()?.focus();
  }

  apiInsertAlice(): void {
    const editor = this.apiEditor();
    const alice = DEMO_USERS[0];
    if (!editor || !alice) return;
    const ok = editor.insertMention(alice, { trigger: '@', at: 'end' });
    this.setApiResult('insertMention(alice)', { ok, document: editor.getDocument() });
  }

  apiInsertTrigger(): void {
    const editor = this.apiEditor();
    if (!editor) return;
    editor.focus();
    editor.insertTextAtCaret('@');
    editor.detectMentions();
    this.setApiResult('insertTextAtCaret("@") + detectMentions()', {
      query: editor.currentQuery(),
      isOpen: editor.isOpen(),
    });
  }

  apiClosePanel(): void {
    const editor = this.apiEditor();
    if (!editor) return;
    editor.closeMentionPanel();
    this.setApiResult('closeMentionPanel()', { isOpen: editor.isOpen() });
  }

  apiBlur(): void {
    this.apiEditor()?.blur();
    this.setApiResult('blur()', 'Editor blurred');
  }

  apiReplaceAlice(): void {
    const editor = this.apiEditor();
    const diana = DEMO_USERS[3];
    if (!editor || !diana) return;
    const ok = editor.replaceMention('1', diana, { trigger: '@' });
    this.setApiResult('replaceMention("1", diana)', { ok, document: editor.getDocument() });
  }

  apiUpsertBob(): void {
    const editor = this.apiEditor();
    const bob = DEMO_USERS[1];
    if (!editor || !bob) return;
    const ok = editor.upsertMention(bob, { trigger: '@', mentionId: bob.id, fallbackAt: 'end' });
    this.setApiResult('upsertMention(bob)', { ok, document: editor.getDocument() });
  }

  apiRemoveBob(): void {
    const editor = this.apiEditor();
    if (!editor) return;
    const ok = editor.removeMention('2');
    this.setApiResult('removeMention("2")', { ok, document: editor.getDocument() });
  }

  apiUpdateAliceAttributes(): void {
    const editor = this.apiEditor();
    if (!editor) return;
    const ok = editor.updateMentionAttributes('1', (attrs) => ({
      ...(attrs ?? {}),
      'data-initials': 'API',
      'data-color': '#ef4444',
      title: 'Updated through updateMentionAttributes()',
    }));
    this.setApiResult('updateMentionAttributes("1")', { ok, document: editor.getDocument() });
  }

  apiSelectAliceRange(): void {
    const editor = this.apiEditor();
    if (!editor) return;
    const ok = editor.selectMentionRange('1');
    this.setApiResult('selectMentionRange("1")', { ok });
  }

  apiFocusBob(): void {
    const editor = this.apiEditor();
    if (!editor) return;
    const ok = editor.focusMention('2', { select: 'after', scrollIntoView: true });
    this.setApiResult('focusMention("2", after)', { ok });
  }

  apiGetAliceChip(): void {
    const editor = this.apiEditor();
    if (!editor) return;
    const chip = editor.getChipElement('1');
    this.setApiResult('getChipElement("1")', {
      found: !!chip,
      text: chip?.textContent ?? null,
      attributes: chip
        ? Array.from(chip.attributes).reduce<Record<string, string>>((acc, attr) => {
            acc[attr.name] = attr.value;
            return acc;
          }, {})
        : null,
    });
  }

  apiGetChipElements(): void {
    const editor = this.apiEditor();
    if (!editor) return;
    this.setApiResult(
      'getChipElements()',
      editor.getChipElements().map((chip) => ({
        id: chip.getAttribute('data-mention-id'),
        text: chip.textContent,
      })),
    );
  }

  private userMentionAttributes(user: User | undefined): Record<string, string> | undefined {
    if (!user) return undefined;

    return {
      'data-mention-trigger': '@',
      'data-initials': userInitials(user.displayName),
      'data-color': userColor(user.id),
      class: 'demo-chip-user',
    };
  }

  private setApiResult(label: string, value: unknown): void {
    this.apiResultJson.set(JSON.stringify({ api: label, value }, null, 2));
  }

  get lastSelectLabel(): string {
    const s = this.lastSelect();
    if (!s?.item) return '—';
    const item = asMentionItem(s.item);
    if (!item) return '—';
    if (isUser(item)) return item.displayName;
    if (isTag(item)) return item.label;
    if (isCommand(item)) return item.name;
    return '—';
  }

  get savedDocJson(): string {
    return JSON.stringify(this.savedDoc(), null, 2);
  }

  get submittedDocJson(): string {
    return JSON.stringify(this.submittedDoc(), null, 2);
  }
}

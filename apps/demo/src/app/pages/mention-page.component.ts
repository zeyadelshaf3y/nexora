import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import type {
  MentionChipInteractionEvent,
  MentionDocument,
  MentionPasteEvent,
  MentionTriggerConfig,
} from '@nexora-ui/mention';
import { MentionDirective, MentionPanelDirective } from '@nexora-ui/mention';
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
  imports: [MentionDirective, MentionPanelDirective, PopoverTriggerDirective],
  templateUrl: './mention-page.component.html',
})
export class MentionPageComponent {
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
    editor.insertMention(alice);
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

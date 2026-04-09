/**
 * **`nxrMention`** — wires a contenteditable editor, mention session detection, and overlay panel.
 *
 * Lifecycle (summary):
 * 1. Creates `MentionEditorHostComponent` and a contenteditable surface adapter.
 * 2. Subscribes to `input` / `blur` / `selectionchange` and delegates to `MentionControllerImpl`.
 * 3. **Blur + panel:** closing on blur is **deferred** so a tap/click on a suggestion can run `select()` first.
 *
 * See the package **README** and **docs/MENTION.md** for integration, mobile, and edge cases.
 */

import {
  Directive,
  computed,
  contentChild,
  effect,
  inject,
  Injector,
  input,
  isDevMode,
  NgZone,
  output,
  signal,
  ViewContainerRef,
  type ElementRef,
  type OnDestroy,
  type Signal,
  type TemplateRef,
} from '@angular/core';
import { warnOnce } from '@nexora-ui/core';
import {
  OverlayService,
  type BeforeCloseCallback,
  type BeforeOpenCallback,
  type Placement,
} from '@nexora-ui/overlay';

import {
  ATTR_MENTION_ID,
  ATTR_MENTION_LABEL,
} from '../adapters/internal/contenteditable-dom-constants';
import type {
  MentionSurfaceSnapshot,
  MentionTextSurfaceAdapter,
} from '../adapters/mention-surface';
import {
  NXR_MENTION_DEFAULT_ARIA_LABEL,
  NXR_MENTION_DEFAULT_PANEL_OFFSET,
} from '../constants/mention-constants';
import { NXR_MENTION_OVERLAY_PANE_CLASS } from '../constants/mention-overlay-constants';
import { type MentionControllerImpl } from '../internal/mention-controller';
import { createMentionControllerRuntime } from '../internal/mention-controller-runtime';
import {
  isSameMentionControllerWire,
  type MentionControllerWire,
} from '../internal/mention-controller-wire';
import { MentionDocumentState } from '../internal/mention-document-state';
import { MentionEditorHostLifecycle } from '../internal/mention-editor-host-lifecycle';
import type { MentionPanelContext } from '../internal/mention-panel-host.component';
import {
  normalizeInsertMentionOptions,
  resolveProgrammaticRange,
  resolveTriggerConfig,
} from '../internal/mention-programmatic-insert';
import type {
  MentionChipInteractionEvent,
  MentionBeforePasteHandler,
  MentionDocument,
  MentionEntity,
  MentionInsertOptions,
  MentionSelectEvent,
  MentionSession,
  MentionTriggerConfig,
} from '../types/mention-types';
import { isSameMentionDocument } from '../utils/mention-document-equality';
import { applyMentionInsertion } from '../utils/mention-insertion';

import type { MentionChipInteractionDispatcher } from './mention-chip-interaction-dispatcher';
import { createMentionChipInteractionDispatcher } from './mention-directive-chip-bridge';
import {
  buildMentionControllerWire,
  createDirectiveControllerCallbacks,
} from './mention-directive-controller';
import {
  applyBaseChipClassToElements,
  applyMentionDocumentWithSuppressedEmit,
} from './mention-directive-document';
import {
  getChipElementByMentionId,
  getChipElements,
  normalizeEditorClassInput,
} from './mention-directive-dom';
import { setMentionEditorHostClass, syncMentionEditorHostInputs } from './mention-directive-host';
import { createMentionPasteEvent, getSafeTextToInsert } from './mention-directive-paste';
import { createDirectiveRuntimeHandlers } from './mention-directive-runtime-handlers';
import {
  scheduleMentionSessionCheck,
  syncContentValueFromAdapter as syncDirectiveContentValueFromAdapter,
} from './mention-directive-session';
import {
  cleanupAdapterUnsubscribe,
  clearLastMentionWire,
  disposeMentionController,
  resetSessionScheduler,
} from './mention-directive-teardown';
import { MentionPanelDirective } from './mention-panel.directive';
import type { MentionSessionCheckScheduler } from './mention-session-check-scheduler';

@Directive({
  selector: '[nxrMention]',
  standalone: true,
  exportAs: 'nxrMention',
  host: {
    style: 'display:block;position:relative;width:100%;min-width:0;',
  },
})
export class MentionDirective<T = unknown> implements OnDestroy {
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly injector = inject(Injector);
  private readonly ngZone = inject(NgZone);
  private readonly overlay = inject(OverlayService);

  private readonly panelDir = contentChild(MentionPanelDirective<T>);

  // ── Inputs ──────────────────────────────────────────────────────────

  readonly nxrMentionTriggers = input.required<readonly MentionTriggerConfig<T>[]>();
  readonly nxrMentionDebounceMs = input<number>(0);
  /** Delay before showing loading=true in panel state. Helps avoid async loading flicker. */
  readonly nxrMentionLoadingDebounceMs = input<number>(120);
  /** Once loading is shown, keep it visible for at least this long for visual stability. */
  readonly nxrMentionMinLoadingMs = input<number>(120);
  readonly nxrMentionCloseOnBlur = input<boolean>(true);
  readonly nxrMentionPlacement = input<Placement>('bottom-start');
  readonly nxrMentionOffset = input<number>(NXR_MENTION_DEFAULT_PANEL_OFFSET);
  readonly nxrMentionMovePanelWithCaret = input<boolean>(false);
  /** Extra overlay pane class(es) merged with the mention pane base class. */
  readonly nxrMentionPanelClass = input<string | string[] | undefined>(undefined);
  /** Default inline pane styles merged with per-trigger `panel.panelStyle` (trigger keys win). */
  readonly nxrMentionPanelStyle = input<Record<string, string> | undefined>(undefined);
  readonly nxrMentionCloseAnimationDurationMs = input<number>(150);
  readonly nxrMentionAriaLabel = input<string>(NXR_MENTION_DEFAULT_ARIA_LABEL);
  /** Optional id of your list panel for `aria-controls` on the editor (accessibility). */
  readonly nxrMentionAriaControlsPanelId = input<string | undefined>(undefined);
  /** Optional id of the currently active option for `aria-activedescendant`. */
  readonly nxrMentionAriaActiveDescendantId = input<string | undefined>(undefined);
  readonly nxrMentionDocument = input<MentionDocument | null>(null);

  /** Same contract as combobox: return false to prevent opening. */
  readonly nxrMentionBeforeOpen = input<BeforeOpenCallback | undefined>(undefined);
  /** Same contract as combobox: return false to prevent closing. */
  readonly nxrMentionBeforeClose = input<BeforeCloseCallback | undefined>(undefined);

  /** Class(es) forwarded to the contenteditable div alongside `nxr-mention-editor`. */
  readonly nxrMentionEditorClass = input<string | string[] | undefined>(undefined);
  /** Base CSS class applied to every mention chip. Merged with per-trigger class from `getMentionAttributes`. */
  readonly nxrMentionChipClass = input<string | undefined>(undefined);
  /** Disables the editor: sets contenteditable=false, closes panel, suppresses events. */
  readonly nxrMentionDisabled = input<boolean>(false);
  /** Synchronous callback invoked before paste; mutate the event to transform or prevent. */
  readonly nxrMentionBeforePaste = input<MentionBeforePasteHandler | undefined>(undefined);

  /**
   * Delays `mentionChipMouseLeave` after the pointer leaves a chip toward non-chip UI (e.g. hover popover).
   * Does not delay leave when moving to plain text inside the editor.
   */
  readonly nxrMentionChipLeaveDelayMs = input<number>(0);

  /**
   * When true (default), mention detection is coalesced to one pass per burst of input (microtask scheduler).
   * Set false for synchronous detection on every input event.
   */
  readonly nxrMentionCoalesceSessionCheckToMicrotask = input<boolean>(true);

  // ── Outputs ─────────────────────────────────────────────────────────

  readonly mentionSelect = output<MentionSelectEvent<T>>();
  readonly mentionOpenChange = output<boolean>();
  readonly mentionQueryChange = output<string>();
  readonly mentionValueChange = output<string>();
  readonly mentionDocumentChange = output<MentionDocument>();
  readonly mentionFocus = output();
  readonly mentionBlur = output();
  /** See {@link MentionChipInteractionEvent} — `entity.start`/`end` are placeholders, not document offsets. */
  readonly mentionChipMouseEnter = output<MentionChipInteractionEvent>();
  /** See {@link MentionChipInteractionEvent} — `entity.start`/`end` are placeholders, not document offsets. */
  readonly mentionChipMouseLeave = output<MentionChipInteractionEvent>();
  /** See {@link MentionChipInteractionEvent} — `entity.start`/`end` are placeholders, not document offsets. */
  readonly mentionChipClick = output<MentionChipInteractionEvent>();

  // ── Public signals ──────────────────────────────────────────────────

  private readonly contentValue = signal('');
  private readonly panelOpen = signal(false);
  private readonly querySignal = signal('');

  readonly isEmpty: Signal<boolean> = computed(() => this.contentValue().trim().length === 0);
  readonly isOpen: Signal<boolean> = this.panelOpen.asReadonly();
  readonly currentQuery: Signal<string> = this.querySignal.asReadonly();

  // ── Private state ───────────────────────────────────────────────────

  private readonly editorHostLifecycle = new MentionEditorHostLifecycle(
    this.viewContainerRef,
    this.injector,
    (ref) => this.onEditorReady(ref),
  );

  private controller: MentionControllerImpl<T> | null = null;
  private adapter: MentionTextSurfaceAdapter | null = null;
  private adapterUnsubscribe: (() => void) | null = null;
  private composing = false;
  private sessionScheduler: MentionSessionCheckScheduler<MentionSurfaceSnapshot> | null = null;
  private chipInteractionDispatcher: MentionChipInteractionDispatcher | null = null;
  private lastMentionWire: MentionControllerWire<T> | null = null;
  private readonly documentState = new MentionDocumentState();

  constructor() {
    effect(() => {
      const triggers = this.nxrMentionTriggers();
      const panel = this.panelDir();

      if (!triggers?.length || !panel) {
        this.destroyHost();
        this.destroyController();

        return;
      }

      this.ensureEditorHost();
      this.syncEditorHostInputs();
      this.maybeSetupController({ triggerConfigs: triggers, panelTemplateRef: panel.templateRef });
      this.applyIncomingDocument();
    });

    effect(() => {
      this.nxrMentionDocument();

      if (!this.adapter) return;

      this.applyIncomingDocument();
    });

    effect(() => {
      const open = this.panelOpen();
      this.editorHostLifecycle.setInput('panelOpen', open);
    });

    effect(() => {
      const disabled = this.nxrMentionDisabled();
      this.editorHostLifecycle.setInput('disabled', disabled);

      if (disabled) {
        this.controller?.close?.();
      }
    });

    effect(() => {
      if (!this.editorHostLifecycle.hasHost()) return;

      this.emitEditorClassToHost();
    });
  }

  // ── Public API ──────────────────────────────────────────────────────

  /** Re-run mention detection at the caret. */
  detectMentions(): void {
    this.controller?.runSessionCheck?.();
  }

  /** Closes the suggestion panel. */
  closeMentionPanel(): void {
    this.controller?.close?.();
  }

  /** Focuses the contenteditable surface. */
  focus(): void {
    this.editorHostLifecycle.getEditableRef()?.nativeElement.focus();
  }

  /** Removes focus from the contenteditable surface. */
  blur(): void {
    this.editorHostLifecycle.getEditableRef()?.nativeElement.blur();
  }

  /** Inserts plain text at the caret. Dispatches `input` like normal typing. */
  insertTextAtCaret(text: string): void {
    this.adapter?.insertTextAtCaret?.(text);
  }

  /** Clears all editor content. */
  clear(): void {
    this.adapter?.setDocument({ bodyText: '', mentions: [] });
    this.syncContentValueFromAdapter();
  }

  /** Returns all mention entities currently in the editor. */
  getMentions(): readonly MentionEntity[] {
    return this.adapter?.getDocument().mentions ?? [];
  }

  /** Returns the plain text content of the editor (mentions resolved to their text). */
  getPlainText(): string {
    return this.adapter?.getValue() ?? '';
  }

  /** Returns the full structured document (text + mention entities). */
  getDocument(): MentionDocument {
    return this.adapter?.getDocument() ?? { bodyText: '', mentions: [] };
  }

  /** Programmatically sets the editor document. */
  setDocument(doc: MentionDocument): void {
    if (!this.adapter) return;

    this.applyDocumentWithSuppressedEmit(doc);
  }

  /**
   * Programmatically inserts a mention at the current selection/caret.
   * - Backward-compatible: pass a trigger string as second argument.
   * - Preferred: pass `{ trigger, at }` options.
   * - `at`: `'selection' | 'start' | 'end' | { start, end? }`.
   * - Returns false when insertion could not be performed (missing adapter/selection/config or blocked by beforeInsert).
   */
  insertMention(item: T, triggerOrOptions?: string | MentionInsertOptions): boolean {
    if (!this.adapter || this.nxrMentionDisabled()) return false;

    const options = normalizeInsertMentionOptions(triggerOrOptions);
    const config = resolveTriggerConfig(this.nxrMentionTriggers(), options.trigger);

    if (!config) return false;

    const { rangeStart, rangeEnd } = resolveProgrammaticRange(this.adapter, options.at);

    const session: MentionSession<T> = {
      id: -1,
      match: { trigger: config.trigger, query: '', rangeStart, rangeEnd },
      triggerConfig: config,
      caretRect: this.adapter.getCaretRect(),
      status: 'committing',
    };

    if (config.beforeInsert?.(item, session) === false) return false;

    applyMentionInsertion({
      adapter: this.adapter,
      config,
      item,
      session,
      chipClass: this.nxrMentionChipClass(),
      closePanel: () => this.controller?.close?.(),
      emitSelect: (payload) => this.mentionSelect.emit(payload),
    });

    return true;
  }

  /** Returns a chip element by mention id, or null if not found. */
  getChipElement(mentionId: string): HTMLElement | null {
    return getChipElementByMentionId(
      this.editorHostLifecycle.getEditableRef()?.nativeElement,
      mentionId,
    );
  }

  /** Returns all chip elements currently in the editor. */
  getChipElements(): HTMLElement[] {
    return getChipElements(this.editorHostLifecycle.getEditableRef()?.nativeElement);
  }

  // ── Private: editor host ────────────────────────────────────────────

  private ensureEditorHost(): void {
    this.editorHostLifecycle.ensureHost(() => this.syncEditorHostInputs());
  }

  private onEditorReady(ref: ElementRef<HTMLElement>): void {
    this.setupChipInteractionDispatcher(ref.nativeElement);
    const triggers = this.nxrMentionTriggers();
    const panel = this.panelDir();

    if (triggers?.length && panel) {
      this.maybeSetupController({
        triggerConfigs: triggers,
        panelTemplateRef: panel.templateRef,
      });
    }
  }

  private syncEditorHostInputs(): void {
    syncMentionEditorHostInputs({
      hostLifecycle: this.editorHostLifecycle,
      ariaLabel: this.nxrMentionAriaLabel(),
      ariaControlsPanelId: this.nxrMentionAriaControlsPanelId(),
      ariaActiveDescendantId: this.nxrMentionAriaActiveDescendantId(),
      panelOpen: this.panelOpen(),
      disabled: this.nxrMentionDisabled(),
      editorExtraClass: this.normalizedEditorClass(),
    });
  }

  private buildControllerWire(params: {
    el: HTMLElement;
    triggerConfigs: readonly MentionTriggerConfig<T>[];
    panelTemplateRef: TemplateRef<MentionPanelContext<T>>;
  }): MentionControllerWire<T> {
    return buildMentionControllerWire({
      ...params,
      placement: this.nxrMentionPlacement,
      offset: this.nxrMentionOffset,
      debounceMs: this.nxrMentionDebounceMs,
      loadingDebounceMs: this.nxrMentionLoadingDebounceMs,
      minLoadingMs: this.nxrMentionMinLoadingMs,
      movePanelWithCaret: this.nxrMentionMovePanelWithCaret,
      panelClass: this.nxrMentionPanelClass,
      panelStyle: this.nxrMentionPanelStyle,
      closeAnimationDurationMs: this.nxrMentionCloseAnimationDurationMs,
      beforeOpen: this.nxrMentionBeforeOpen,
      beforeClose: this.nxrMentionBeforeClose,
      chipClass: this.nxrMentionChipClass,
    });
  }

  private maybeSetupController(params: {
    triggerConfigs: readonly MentionTriggerConfig<T>[];
    panelTemplateRef: TemplateRef<MentionPanelContext<T>>;
  }): void {
    const { triggerConfigs, panelTemplateRef } = params;
    const editableRef = this.editorHostLifecycle.getEditableRef();

    if (!editableRef) return;

    const el = editableRef.nativeElement;
    const wire = this.buildControllerWire({ el, triggerConfigs, panelTemplateRef });

    if (
      isSameMentionControllerWire(this.lastMentionWire, wire, !!this.controller, !!this.adapter)
    ) {
      return;
    }

    this.destroyController();

    const runtime = createMentionControllerRuntime<T>({
      editableRef,
      triggerConfigs,
      panelTemplateRef,
      wire,
      ngZone: this.ngZone,
      overlay: this.overlay,
      viewContainerRef: this.viewContainerRef,
      injector: this.injector,
      callbacks: createDirectiveControllerCallbacks({
        mentionSelectEmit: (payload) => this.mentionSelect.emit(payload),
        panelOpenSignal: this.panelOpen,
        mentionOpenChangeEmit: (open) => this.mentionOpenChange.emit(open),
        querySignal: this.querySignal,
        mentionQueryChangeEmit: (query) => this.mentionQueryChange.emit(query),
      }),
      handlers: createDirectiveRuntimeHandlers({
        isDisabled: () => this.nxrMentionDisabled(),
        getController: () => this.controller,
        onInput: () => this.onInput(),
        onBlurEmit: () => this.mentionBlur.emit(),
        onFocusEmit: () => this.mentionFocus.emit(),
        setComposing: (value) => {
          this.composing = value;
        },
        onPaste: (event) => this.handlePaste(event),
        getEditable: () => this.editorHostLifecycle.getEditableRef()?.nativeElement ?? null,
        closeOnBlur: () => this.nxrMentionCloseOnBlur(),
        overlayPaneClass: NXR_MENTION_OVERLAY_PANE_CLASS,
      }),
    });

    this.controller = runtime.controller;
    this.adapter = runtime.adapter;
    this.sessionScheduler = runtime.sessionScheduler;
    this.adapterUnsubscribe = runtime.adapterUnsubscribe;
    this.lastMentionWire = wire;
    this.controller.runSessionCheck();
  }

  // ── Private: paste ──────────────────────────────────────────────────

  private handlePaste(e: ClipboardEvent): void {
    e.preventDefault();

    if (this.nxrMentionDisabled()) return;

    const pasteEvent = createMentionPasteEvent(e);

    const beforePasteHandler = this.nxrMentionBeforePaste();

    if (beforePasteHandler) {
      try {
        beforePasteHandler(pasteEvent);
      } catch {
        if (isDevMode()) {
          warnOnce(
            'mention-before-paste-handler-error',
            '`nxrMentionBeforePaste` threw an error. Paste was safely ignored.',
          );
        }

        return;
      }
    }

    if (pasteEvent.preventDefault) return;

    const { text: safeTextToInsert, wasClamped } = getSafeTextToInsert(pasteEvent);

    if (safeTextToInsert.length === 0) return;

    if (wasClamped && isDevMode()) {
      warnOnce(
        'mention-paste-text-clamped',
        '`nxrMention` clamped pasted text to a safe maximum length.',
      );
    }

    this.adapter?.insertTextAtCaret?.(safeTextToInsert);
  }

  // ── Private: chip pointer bridge ────────────────────────────────────

  private setupChipInteractionDispatcher(root: HTMLElement): void {
    this.teardownChipInteractionDispatcher();

    this.chipInteractionDispatcher = createMentionChipInteractionDispatcher({
      root,
      mentionIdAttr: ATTR_MENTION_ID,
      mentionLabelAttr: ATTR_MENTION_LABEL,
      getLeaveDelayMs: () => this.nxrMentionChipLeaveDelayMs(),
      emitEnter: (event) => this.mentionChipMouseEnter.emit(event),
      emitLeave: (event) => this.mentionChipMouseLeave.emit(event),
      emitClick: (event) => this.mentionChipClick.emit(event),
    });
  }

  private teardownChipInteractionDispatcher(): void {
    this.chipInteractionDispatcher?.dispose();
    this.chipInteractionDispatcher = null;
  }

  // ── Private: session check ──────────────────────────────────────────

  private scheduleSessionCheck(snapshot?: MentionSurfaceSnapshot): void {
    scheduleMentionSessionCheck({
      snapshot,
      coalesce: this.nxrMentionCoalesceSessionCheckToMicrotask(),
      sessionScheduler: this.sessionScheduler,
      runSessionCheck: (nextSnapshot) => this.controller?.runSessionCheck?.(nextSnapshot),
    });
  }

  // ── Private: input ──────────────────────────────────────────────────

  private onInput(): void {
    if (this.composing || this.nxrMentionDisabled()) return;

    const snapshot = this.syncContentValueFromAdapter();

    this.scheduleSessionCheck(snapshot ?? undefined);
  }

  private syncContentValueFromAdapter(): MentionSurfaceSnapshot | null {
    return syncDirectiveContentValueFromAdapter({
      documentState: this.documentState,
      adapter: this.adapter,
      setContentValue: (value) => this.contentValue.set(value),
      setHostContentValue: (value) => {
        this.editorHostLifecycle.setInput('contentValue', value);
      },
      emitValueChange: (value) => this.mentionValueChange.emit(value),
      emitDocumentChange: (doc) => this.mentionDocumentChange.emit(doc),
      isSameDocument: (a, b) => isSameMentionDocument(a, b),
    });
  }

  private applyIncomingDocument(): void {
    this.documentState.applyIncomingDocument({
      adapter: this.adapter,
      inputDoc: this.nxrMentionDocument(),
      applyDocument: (doc) => this.applyDocumentWithSuppressedEmit(doc),
    });
  }

  private normalizedEditorClass(): string {
    return normalizeEditorClassInput(this.nxrMentionEditorClass());
  }

  private emitEditorClassToHost(): void {
    setMentionEditorHostClass(this.editorHostLifecycle, this.normalizedEditorClass());
  }

  private applyDocumentWithSuppressedEmit(doc: MentionDocument): void {
    applyMentionDocumentWithSuppressedEmit({
      adapter: this.adapter,
      documentState: this.documentState,
      doc,
      afterSetDocument: () => {
        this.applyBaseChipClassToRenderedMentions();
        this.syncContentValueFromAdapter();
      },
    });
  }

  private applyBaseChipClassToRenderedMentions(): void {
    applyBaseChipClassToElements({
      chipElements: this.getChipElements(),
      chipClass: this.nxrMentionChipClass(),
    });
  }

  // ── Private: teardown ───────────────────────────────────────────────

  private destroyController(): void {
    this.sessionScheduler = resetSessionScheduler(this.sessionScheduler);
    this.lastMentionWire = clearLastMentionWire(this.lastMentionWire);
    this.panelOpen.set(false);
    this.adapterUnsubscribe = cleanupAdapterUnsubscribe(this.adapterUnsubscribe);

    this.adapter = null;
    this.documentState.resetForDestroyedAdapter();
    this.controller = disposeMentionController(this.controller);
  }

  private destroyHost(): void {
    this.teardownChipInteractionDispatcher();
    this.editorHostLifecycle.destroy();
    this.destroyController();
  }

  ngOnDestroy(): void {
    this.destroyHost();
  }
}

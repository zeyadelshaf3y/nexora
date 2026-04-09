/**
 * Mention session lifecycle: virtual anchor + overlay, `getItems`, keyboard navigation, `select()`.
 *
 * **Order on `select`:** `session` is read first, then (if `closeOnSelect` is not `false`) the overlay
 * closes and state resets — but replacement still uses the captured `MentionMatch` range from the
 * session snapshot, so text insertion remains correct.
 *
 * **Keyboard:** when the panel is closed, `Backspace` may remove a chip before the caret; `Enter`
 * inserts a line break (contenteditable). When open, arrows / Enter / Escape delegate to panel behavior.
 */

import {
  computed,
  signal,
  type Injector,
  type TemplateRef,
  type ViewContainerRef,
} from '@angular/core';
import { createRafThrottled, listen } from '@nexora-ui/core';
import {
  type OverlayRef,
  type OverlayService,
  type Placement,
  subscribeOnceAfterClosed,
} from '@nexora-ui/overlay';
import { Subject, type Subscription } from 'rxjs';

import type {
  MentionSurfaceSnapshot,
  MentionTextSurfaceAdapter,
} from '../adapters/mention-surface';
import { DEFAULT_MENTION_CLOSE_ANIMATION_MS } from '../constants/mention-overlay-constants';
import type {
  MentionMatch,
  MentionPanelState,
  MentionSession,
  MentionTriggerConfig,
} from '../types/mention-types';
import { applyMentionInsertion } from '../utils/mention-insertion';
import { parseMentionMatch } from '../utils/mention-parser';

import type {
  MentionController,
  MentionControllerCallbacks,
  MentionControllerInit,
} from './mention-controller.types';
import { subscribeMentionItemsFetch } from './mention-fetch-pipeline';
import { MentionLoadingSchedule } from './mention-loading-schedule';
import { handleMentionOpenPanelKeydown } from './mention-open-panel-keydown';
import { type MentionPanelContext } from './mention-panel-host.component';
import { buildMentionPanelOverlayConfig } from './mention-panel-overlay-config';
import { createMentionPanelInjector, createMentionPanelPortal } from './mention-panel-portal';
import { buildTriggerConfigLookup } from './mention-programmatic-insert';
import {
  createMentionVirtualAnchorElement,
  positionMentionVirtualAnchor,
  removeMentionVirtualAnchorElement,
} from './mention-virtual-anchor';

export type {
  MentionController,
  MentionControllerCallbacks,
  MentionControllerInit,
} from './mention-controller.types';

let sessionIdCounter = 0;

function nextSessionId(): number {
  return ++sessionIdCounter;
}

export class MentionControllerImpl<T = unknown> implements MentionController<T> {
  private sessionId = 0;
  private overlayRef: OverlayRef | null = null;
  private virtualAnchor: HTMLElement | null = null;
  private session: MentionSession<T> | null = null;

  private readonly fetchRequest$ = new Subject<{
    sessionId: number;
    query: string;
    session: MentionSession<T>;
  }>();

  private readonly fetchAbort$ = new Subject<void>();
  private readonly fetchPipelineSub: Subscription;
  private readonly loadingSchedule: MentionLoadingSchedule;
  private disposed = false;
  private fetchDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private viewportCleanup: (() => void) | null = null;
  private isClosing = false;
  private noResultsSuppression: { rangeStart: number; queryLength: number } | null = null;
  private overlayOpenRequestId = 0;

  private readonly activeIndex = signal(0);
  private readonly items = signal<readonly T[]>([]);
  private readonly loading = signal(false);
  private readonly open = signal(false);
  private readonly error = signal<unknown>(undefined);
  private readonly query = signal('');
  private readonly trigger = signal<string | null>(null);
  private readonly sessionSignal = signal<MentionSession<T> | null>(null);

  readonly panelState = computed<MentionPanelState<T>>(() => ({
    session: this.sessionSignal(),
    trigger: this.trigger(),
    query: this.query(),
    items: this.items(),
    loading: this.loading(),
    activeIndex: this.activeIndex(),
    open: this.open(),
    error: this.error(),
  }));

  private readonly adapter: MentionTextSurfaceAdapter;
  private readonly triggerConfigs: readonly MentionTriggerConfig<T>[];
  private readonly triggerConfigByTrigger: ReadonlyMap<string, MentionTriggerConfig<T>>;
  private readonly overlay: OverlayService;
  private readonly viewContainerRef: ViewContainerRef;
  private readonly panelTemplateRef: TemplateRef<MentionPanelContext<T>>;
  private readonly parentInjector: Injector;
  private readonly placement: Placement;
  private readonly offset: number;
  private readonly debounceMs: number;
  private readonly loadingDebounceMs: number;
  private readonly minLoadingMs: number;
  private readonly movePanelWithCaret: boolean;
  private readonly overlayPanelExtraClasses: readonly string[];
  private readonly overlayPanelExtraStyle: Readonly<Record<string, string>> | undefined;
  private readonly closeAnimationDurationMs: number;
  private readonly beforeOpen: MentionControllerInit<T>['beforeOpen'];
  private readonly beforeClose: MentionControllerInit<T>['beforeClose'];
  private readonly callbacks?: MentionControllerCallbacks<T>;
  private readonly chipClass?: string;
  private readonly editorElement?: HTMLElement;

  private shouldSuppressByNoResults(match: MentionMatch): boolean {
    const suppression = this.noResultsSuppression;

    if (!suppression) return false;

    const isSameRange = match.rangeStart === suppression.rangeStart;
    const isAtLeastSuppressedLength = match.query.length >= suppression.queryLength;

    if (isSameRange && isAtLeastSuppressedLength) return true;

    this.noResultsSuppression = null;

    return false;
  }

  private emitOpenChange(open: boolean): void {
    this.callbacks?.onOpenChange?.(open);
  }

  private clearVirtualAnchor(): void {
    removeMentionVirtualAnchorElement(this.virtualAnchor);

    this.virtualAnchor = null;
  }

  private getLockedRanges(
    snapshot: MentionSurfaceSnapshot | null | undefined,
    documentState: { mentions: readonly { start: number; end: number }[] },
  ): ReadonlyArray<{ start: number; end: number }> {
    if (snapshot?.lockedMentionTextRanges) return snapshot.lockedMentionTextRanges;

    const m = documentState.mentions;

    return m.map((x) => ({ start: x.start, end: x.end }));
  }

  private clearFetchDebounceTimer(): void {
    if (!this.fetchDebounceTimer) return;

    clearTimeout(this.fetchDebounceTimer);
    this.fetchDebounceTimer = null;
  }

  /** Coalesces caret-driven overlay reposition to at most once per animation frame. */
  private readonly caretReposition = createRafThrottled(() => {
    if (this.isClosing) return;

    if (this.session && this.virtualAnchor) {
      const caretRect = this.adapter.getCaretRect();
      const rect = this.panelAnchorRect(this.session.match, caretRect);

      positionMentionVirtualAnchor(this.virtualAnchor, rect);

      this.overlayRef?.reposition?.();
    }
  });

  constructor(params: MentionControllerInit<T>) {
    this.adapter = params.adapter;
    this.triggerConfigs = params.triggerConfigs;
    this.triggerConfigByTrigger = buildTriggerConfigLookup(params.triggerConfigs);
    this.overlay = params.overlay;
    this.viewContainerRef = params.viewContainerRef;
    this.panelTemplateRef = params.panelTemplateRef;
    this.parentInjector = params.parentInjector;
    this.placement = params.placement ?? 'bottom-start';
    this.offset = params.offset ?? 8;
    this.debounceMs = params.debounceMs ?? 0;
    this.loadingDebounceMs = params.loadingDebounceMs ?? 0;
    this.minLoadingMs = params.minLoadingMs ?? 0;
    this.movePanelWithCaret = params.movePanelWithCaret ?? false;
    this.overlayPanelExtraClasses = params.overlayPanelExtraClasses ?? [];
    this.overlayPanelExtraStyle = params.overlayPanelExtraStyle;
    this.closeAnimationDurationMs =
      params.closeAnimationDurationMs ?? DEFAULT_MENTION_CLOSE_ANIMATION_MS;
    this.beforeOpen = params.beforeOpen;
    this.beforeClose = params.beforeClose;
    this.callbacks = params.callbacks;
    this.chipClass = params.chipClass;
    this.editorElement = params.editorElement;

    this.loadingSchedule = new MentionLoadingSchedule(
      this.loading,
      this.loadingDebounceMs,
      this.minLoadingMs,
    );

    this.fetchPipelineSub = subscribeMentionItemsFetch<T>({
      fetchRequest$: this.fetchRequest$,
      fetchAbort$: this.fetchAbort$,
      getSessionId: () => this.sessionId,
      onError: (err) => this.error.set(err),
      onResult: ({ sessionId, query, session, items }) => {
        if (sessionId !== this.sessionId) return;

        const config = session.triggerConfig;
        this.items.set(items);
        this.loadingSchedule.end();
        this.activeIndex.set(0);

        if (items.length === 0 && config.closeOnNoResults !== false) {
          if (this.session?.match) {
            this.noResultsSuppression = {
              rangeStart: this.session.match.rangeStart,
              queryLength: query.length,
            };
          }
          this.close();
        }
      },
    });
  }

  private panelAnchorRect(match: MentionMatch, caretFallback: DOMRect | null): DOMRect | null {
    if (this.movePanelWithCaret) return caretFallback;

    const r = this.adapter.getRectAtLinearOffset?.(match.rangeStart) ?? null;

    return r ?? caretFallback;
  }

  private resolveEditorDir(): string | undefined {
    if (!this.editorElement) return undefined;

    try {
      return getComputedStyle(this.editorElement).direction;
    } catch {
      return undefined;
    }
  }

  runSessionCheck(snapshot?: MentionSurfaceSnapshot): void {
    if (this.isClosing) return;

    if (!this.adapter.isSelectionCollapsed()) {
      this.close();

      return;
    }

    const adapterVersion = this.adapter.getSnapshotVersion?.();

    const hasStaleSnapshot =
      snapshot != null && adapterVersion != null && snapshot.version !== adapterVersion;

    const currentSnapshot = hasStaleSnapshot
      ? this.adapter.getSnapshot?.()
      : (snapshot ?? this.adapter.getSnapshot?.());

    const documentState = currentSnapshot?.document ?? this.adapter.getDocument();
    const plainTextValue = documentState.bodyText;
    const selectionStart = this.adapter.getSelectionStart();

    if (selectionStart == null) return;

    const lockedRanges = this.getLockedRanges(currentSnapshot, documentState);

    const match = parseMentionMatch(
      plainTextValue,
      selectionStart,
      this.triggerConfigs as readonly MentionTriggerConfig<unknown>[],
      lockedRanges,
    );

    if (!match) {
      this.close();

      return;
    }

    const config = this.triggerConfigByTrigger.get(match.trigger);

    if (!config) return;

    const minQ = config.minQueryLength ?? 0;
    const openOnTrigger = config.openOnTrigger === true;

    if (!openOnTrigger && match.query.length < minQ) {
      this.close();

      return;
    }

    if (this.shouldSuppressByNoResults(match)) return;

    const newSessionId = nextSessionId();
    this.sessionId = newSessionId;
    const caretRect = this.adapter.getCaretRect();
    const anchorRect = this.panelAnchorRect(match, caretRect);

    this.session = {
      id: newSessionId,
      match,
      triggerConfig: config,
      caretRect,
      status: 'open',
    };

    this.sessionSignal.set(this.session);
    this.query.set(match.query);
    this.trigger.set(match.trigger);
    const wasOpen = this.open();
    this.open.set(true);
    this.loadingSchedule.begin();
    this.items.set([]);
    this.activeIndex.set(0);
    this.error.set(undefined);

    if (!wasOpen) {
      this.emitOpenChange(true);
    }

    this.callbacks?.onQueryChange?.(match.query);

    const dir = this.resolveEditorDir();

    if (!this.overlayRef) {
      this.virtualAnchor = createMentionVirtualAnchorElement(anchorRect, dir);
      const requestId = ++this.overlayOpenRequestId;
      void this.openOverlay(requestId);
    } else if (this.virtualAnchor) {
      positionMentionVirtualAnchor(this.virtualAnchor, anchorRect);

      this.overlayRef.reposition?.();
    }

    this.scheduleFetchItems(newSessionId, match.query, this.session);
  }

  private async openOverlay(requestId: number): Promise<void> {
    const anchor = this.virtualAnchor;
    if (!anchor) return;

    const config = buildMentionPanelOverlayConfig({
      anchor,
      panelOpt: this.session?.triggerConfig.panel,
      defaults: {
        placement: this.placement,
        offset: this.offset,
        closeAnimationDurationMs: this.closeAnimationDurationMs,
        beforeOpen: this.beforeOpen,
        beforeClose: this.beforeClose,
        overlayPanelExtraClasses: this.overlayPanelExtraClasses,
        overlayPanelExtraStyle: this.overlayPanelExtraStyle,
      },
    });

    const ref = this.overlay.create(config);

    const injector = createMentionPanelInjector(
      this.parentInjector,
      this as MentionController<unknown>,
      this.panelTemplateRef,
    );
    const portal = createMentionPanelPortal(this.viewContainerRef, injector);

    const opened = await ref.attach(portal);
    const isStaleRequest = requestId !== this.overlayOpenRequestId;

    if (isStaleRequest || !this.open() || this.isClosing || !this.virtualAnchor) {
      ref.dispose?.();

      return;
    }
    if (!opened) {
      ref.dispose?.();

      if (this.overlayRef === ref) this.overlayRef = null;

      this.clearVirtualAnchor();
      this.emitOpenChange(false);
      this.resetState();

      return;
    }

    this.overlayRef = ref;

    this.startViewportTracking();

    subscribeOnceAfterClosed(ref, () => {
      this.isClosing = false;
      this.stopViewportTracking();
      this.overlayRef = null;
      this.clearVirtualAnchor();
      this.emitOpenChange(false);
      this.resetState();
    });
  }

  private startViewportTracking(): void {
    if (this.viewportCleanup || typeof window === 'undefined') return;

    const onViewportChange = () => this.updateCaretPosition();
    const offScroll = listen(window, 'scroll', onViewportChange, {
      passive: true,
      capture: true,
    });
    const offResize = listen(window, 'resize', onViewportChange);

    this.viewportCleanup = () => {
      offScroll();
      offResize();
      this.viewportCleanup = null;
    };
  }

  private stopViewportTracking(): void {
    this.viewportCleanup?.();
    this.caretReposition.cancel();
  }

  private resetState(): void {
    this.loadingSchedule.reset();
    this.open.set(false);
    this.session = null;
    this.sessionSignal.set(null);
    this.trigger.set(null);
    this.query.set('');
    this.items.set([]);
    this.loading.set(false);
    this.activeIndex.set(0);
    this.error.set(undefined);
  }

  private scheduleFetchItems(
    fetchSessionId: number,
    query: string,
    session: MentionSession<T>,
  ): void {
    this.clearFetchDebounceTimer();

    const doFetch = () => {
      this.fetchDebounceTimer = null;
      this.fetchRequest$.next({ sessionId: fetchSessionId, query, session });
    };

    if (this.debounceMs > 0) {
      this.fetchDebounceTimer = setTimeout(doFetch, this.debounceMs);
    } else {
      doFetch();
    }
  }

  /**
   * Inserts the chosen item at the active mention range.
   * Respects `beforeInsert` / `afterInsert` lifecycle hooks.
   */
  select(item: T): void {
    const session = this.session;

    if (!session) return;

    const config = session.triggerConfig;

    if (config.beforeInsert?.(item, session) === false) return;

    applyMentionInsertion({
      adapter: this.adapter,
      config,
      item,
      session,
      chipClass: this.chipClass,
      closePanel: () => this.close(),
      emitSelect: (payload) => this.callbacks?.onSelect?.(payload),
    });
  }

  close(): void {
    if (this.disposed || this.isClosing) return;

    this.fetchAbort$.next();
    this.overlayOpenRequestId += 1;
    this.loadingSchedule.clearTimers();
    this.clearFetchDebounceTimer();

    if (this.overlayRef) {
      this.isClosing = true;
      const closingRef = this.overlayRef;
      void closingRef.close().then((closed) => {
        // If a beforeClose hook vetoes close, keep the session active.
        if (!closed && this.overlayRef === closingRef) {
          this.isClosing = false;
        }
      });
    } else {
      this.clearVirtualAnchor();
      this.emitOpenChange(false);
      this.resetState();
      this.stopViewportTracking();
    }
  }

  dispose(): void {
    if (this.disposed) return;
    this.close();
    this.disposed = true;
    this.fetchAbort$.next();
    this.fetchPipelineSub.unsubscribe();
    this.fetchRequest$.complete();
    this.fetchAbort$.complete();
  }

  handleKeydown(event: KeyboardEvent): void {
    const isPanelOpen = this.open();

    if (event.key === 'Backspace' && !isPanelOpen) {
      if (this.adapter.removeMentionBeforeCaret?.()) {
        event.preventDefault();
        event.stopPropagation();
      }

      return;
    }

    if (event.key === 'Enter' && !isPanelOpen) {
      event.preventDefault();
      this.adapter.insertLineBreak?.();

      return;
    }

    if (!isPanelOpen) return;

    const session = this.session;
    if (!session) return;

    handleMentionOpenPanelKeydown(event, {
      session,
      items: this.items(),
      activeIndex: this.activeIndex(),
      setActiveIndex: (i) => this.activeIndex.set(i),
      select: (item) => this.select(item),
      close: () => this.close(),
    });
  }

  updateCaretPosition(): void {
    this.caretReposition.run();
  }
}

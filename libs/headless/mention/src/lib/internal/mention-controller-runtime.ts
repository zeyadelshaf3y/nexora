import { type Injector, type NgZone, type TemplateRef, type ViewContainerRef } from '@angular/core';
import { type OverlayService } from '@nexora-ui/overlay';

import { createContenteditableAdapter } from '../adapters/contenteditable-adapter';
import type {
  MentionSurfaceSnapshot,
  MentionTextSurfaceAdapter,
} from '../adapters/mention-surface';
import { MentionSessionCheckScheduler } from '../directives/mention-session-check-scheduler';
import type { MentionTriggerConfig } from '../types/mention-types';

import { MentionControllerImpl, type MentionControllerCallbacks } from './mention-controller';
import { normalizePanelClasses, type MentionControllerWire } from './mention-controller-wire';
import type { MentionPanelContext } from './mention-panel-host.component';

export interface MentionControllerRuntime<T = unknown> {
  readonly controller: MentionControllerImpl<T>;
  readonly adapter: MentionTextSurfaceAdapter;
  readonly sessionScheduler: MentionSessionCheckScheduler<MentionSurfaceSnapshot>;
  readonly adapterUnsubscribe: () => void;
}

export interface CreateMentionControllerRuntimeParams<T = unknown> {
  readonly editableRef: { readonly nativeElement: HTMLElement };
  readonly triggerConfigs: readonly MentionTriggerConfig<T>[];
  readonly panelTemplateRef: TemplateRef<MentionPanelContext<T>>;
  readonly wire: MentionControllerWire<T>;
  readonly ngZone: NgZone;
  readonly overlay: OverlayService;
  readonly viewContainerRef: ViewContainerRef;
  readonly injector: Injector;
  readonly callbacks: MentionControllerCallbacks<T>;
  readonly handlers: {
    readonly onInput: () => void;
    readonly onKeydown: (event: KeyboardEvent) => void;
    readonly onBlur: () => void;
    readonly onFocus: () => void;
    readonly onCompositionStart: () => void;
    readonly onCompositionEnd: () => void;
    readonly onScroll: () => void;
    readonly onSelectionChange: () => void;
    readonly onPaste: (event: ClipboardEvent) => void;
  };
}

/**
 * Creates mention controller + adapter + scheduler wiring for directive runtime.
 * Keeps setup orchestration out of the directive while preserving caller-owned handlers.
 */
export function createMentionControllerRuntime<T = unknown>(
  params: CreateMentionControllerRuntimeParams<T>,
): MentionControllerRuntime<T> {
  const {
    editableRef,
    triggerConfigs,
    panelTemplateRef,
    wire,
    ngZone,
    overlay,
    viewContainerRef,
    injector,
    callbacks,
    handlers,
  } = params;

  const adapter = createContenteditableAdapter(editableRef, ngZone);
  const editorElement = editableRef.nativeElement;

  const controller = new MentionControllerImpl<T>({
    adapter,
    triggerConfigs,
    overlay,
    viewContainerRef,
    panelTemplateRef,
    parentInjector: injector,
    placement: wire.placement,
    offset: wire.offset,
    debounceMs: wire.debounceMs,
    loadingDebounceMs: wire.loadingDebounceMs,
    minLoadingMs: wire.minLoadingMs,
    movePanelWithCaret: wire.moveCaret,
    overlayPanelExtraClasses: normalizePanelClasses(wire.panelClass),
    overlayPanelExtraStyle: wire.panelStyle,
    closeAnimationDurationMs: wire.closeMs,
    beforeOpen: wire.beforeOpen,
    beforeClose: wire.beforeClose,
    callbacks,
    chipClass: wire.chipClass,
    editorElement,
  });

  const sessionScheduler = new MentionSessionCheckScheduler<MentionSurfaceSnapshot>((snapshot) =>
    controller.runSessionCheck(snapshot),
  );

  const adapterUnsubscribe = adapter.subscribe({
    input: handlers.onInput,
    keydown: handlers.onKeydown,
    blur: handlers.onBlur,
    focus: handlers.onFocus,
    compositionstart: handlers.onCompositionStart,
    compositionend: handlers.onCompositionEnd,
    scroll: handlers.onScroll,
    selectionchange: handlers.onSelectionChange,
    paste: handlers.onPaste,
  });

  return { controller, adapter, sessionScheduler, adapterUnsubscribe };
}

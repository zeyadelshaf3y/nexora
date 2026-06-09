import type { Injector, Signal, TemplateRef, ViewContainerRef } from '@angular/core';
import type {
  BeforeCloseCallback,
  BeforeOpenCallback,
  OverlayService,
  Placement,
} from '@nexora-ui/overlay';

import type { MentionTextSurfaceAdapter } from '../adapters/mention-surface';
import type {
  MentionOpenChangeHandler,
  MentionPanelState,
  MentionPointerHighlight,
  MentionQueryChangeHandler,
  MentionSelectHandler,
  MentionTriggerConfig,
} from '../types/mention-types';

import type { MentionPanelContext } from './mention-panel-tokens';

export interface MentionController<T = unknown> {
  readonly panelState: Signal<MentionPanelState<T>>;
  select(item: T): void;
  close(): void;
  handleKeydown(event: KeyboardEvent): void;
  usesHoverPointerHighlight(): boolean;
  setActiveIndex(index: number): void;
  /** Idempotent. Call after {@link close} when the owning directive is destroyed. */
  dispose(): void;
}

export interface MentionControllerCallbacks<T = unknown> {
  readonly onSelect?: MentionSelectHandler<T>;
  readonly onOpenChange?: MentionOpenChangeHandler;
  readonly onQueryChange?: MentionQueryChangeHandler;
}

export interface MentionControllerInit<T = unknown> {
  readonly adapter: MentionTextSurfaceAdapter;
  readonly triggerConfigs: readonly MentionTriggerConfig<T>[];
  readonly overlay: OverlayService;
  readonly viewContainerRef: ViewContainerRef;
  readonly panelTemplateRef: TemplateRef<MentionPanelContext<T>>;
  /**
   * Optional fixed header rendered above the scrollable panel area, outside the scroll container.
   * Provided via `nxrMentionHeader` on `<ng-template>` inside the host element.
   */
  readonly headerTemplateRef?: TemplateRef<unknown> | null;
  /**
   * Optional fixed footer rendered below the scrollable panel area, outside the scroll container.
   * Provided via `nxrMentionFooter` on `<ng-template>` inside the host element.
   */
  readonly footerTemplateRef?: TemplateRef<unknown> | null;
  readonly parentInjector: Injector;
  readonly placement?: Placement;
  readonly offset?: number;
  readonly debounceMs?: number;
  readonly loadingDebounceMs?: number;
  readonly minLoadingMs?: number;
  readonly movePanelWithCaret?: boolean;
  readonly overlayPanelExtraClasses?: readonly string[];
  readonly overlayPanelExtraStyle?: Record<string, string>;
  /** Default max-height for the panel pane. Per-trigger `panel.maxHeight` overrides this. */
  readonly maxHeight?: string;
  readonly closeAnimationDurationMs?: number;
  readonly pointerHighlight?: MentionPointerHighlight;
  readonly beforeOpen?: BeforeOpenCallback;
  readonly beforeClose?: BeforeCloseCallback;
  readonly callbacks?: MentionControllerCallbacks<T>;
  readonly chipClass?: string;
  readonly editorElement?: HTMLElement;
}

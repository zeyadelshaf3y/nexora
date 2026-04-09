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
  MentionQueryChangeHandler,
  MentionSelectHandler,
  MentionTriggerConfig,
} from '../types/mention-types';

import type { MentionPanelContext } from './mention-panel-host.component';

export interface MentionController<T = unknown> {
  readonly panelState: Signal<MentionPanelState<T>>;
  select(item: T): void;
  close(): void;
  handleKeydown(event: KeyboardEvent): void;
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
  readonly parentInjector: Injector;
  readonly placement?: Placement;
  readonly offset?: number;
  readonly debounceMs?: number;
  readonly loadingDebounceMs?: number;
  readonly minLoadingMs?: number;
  readonly movePanelWithCaret?: boolean;
  readonly overlayPanelExtraClasses?: readonly string[];
  readonly overlayPanelExtraStyle?: Record<string, string>;
  readonly closeAnimationDurationMs?: number;
  readonly beforeOpen?: BeforeOpenCallback;
  readonly beforeClose?: BeforeCloseCallback;
  readonly callbacks?: MentionControllerCallbacks<T>;
  readonly chipClass?: string;
  readonly editorElement?: HTMLElement;
}

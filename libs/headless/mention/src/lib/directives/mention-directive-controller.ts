import type { Signal, TemplateRef, WritableSignal } from '@angular/core';
import type { BeforeCloseCallback, BeforeOpenCallback, Placement } from '@nexora-ui/overlay';

import type { MentionControllerCallbacks } from '../internal/mention-controller';
import type { MentionControllerWire } from '../internal/mention-controller-wire';
import type { MentionPanelContext } from '../internal/mention-panel-host.component';
import type { MentionSelectEvent, MentionTriggerConfig } from '../types/mention-types';

export function createDirectiveControllerCallbacks<T>(params: {
  mentionSelectEmit: (payload: MentionSelectEvent<T>) => void;
  panelOpenSignal: WritableSignal<boolean>;
  mentionOpenChangeEmit: (open: boolean) => void;
  querySignal: WritableSignal<string>;
  mentionQueryChangeEmit: (query: string) => void;
}): MentionControllerCallbacks<T> {
  const {
    mentionSelectEmit,
    panelOpenSignal,
    mentionOpenChangeEmit,
    querySignal,
    mentionQueryChangeEmit,
  } = params;

  return {
    onSelect: (payload) => mentionSelectEmit(payload),
    onOpenChange: (open) => {
      panelOpenSignal.set(open);
      mentionOpenChangeEmit(open);
    },
    onQueryChange: (query) => {
      querySignal.set(query);
      mentionQueryChangeEmit(query);
    },
  };
}

export function buildMentionControllerWire<T>(params: {
  el: HTMLElement;
  triggerConfigs: readonly MentionTriggerConfig<T>[];
  panelTemplateRef: TemplateRef<MentionPanelContext<T>>;
  placement: Signal<Placement>;
  offset: Signal<number>;
  debounceMs: Signal<number>;
  loadingDebounceMs: Signal<number>;
  minLoadingMs: Signal<number>;
  movePanelWithCaret: Signal<boolean>;
  panelClass: Signal<string | string[] | undefined>;
  panelStyle: Signal<Record<string, string> | undefined>;
  closeAnimationDurationMs: Signal<number>;
  beforeOpen: Signal<BeforeOpenCallback | undefined>;
  beforeClose: Signal<BeforeCloseCallback | undefined>;
  chipClass: Signal<string | undefined>;
}): MentionControllerWire<T> {
  return {
    el: params.el,
    // Snapshot trigger config references so wire equality can detect in-place array edits.
    triggers: [...params.triggerConfigs],
    panelTpl: params.panelTemplateRef,
    placement: params.placement(),
    offset: params.offset(),
    debounceMs: params.debounceMs(),
    loadingDebounceMs: params.loadingDebounceMs(),
    minLoadingMs: params.minLoadingMs(),
    moveCaret: params.movePanelWithCaret(),
    panelClass: params.panelClass(),
    panelStyle: params.panelStyle(),
    closeMs: params.closeAnimationDurationMs(),
    beforeOpen: params.beforeOpen(),
    beforeClose: params.beforeClose(),
    chipClass: params.chipClass(),
  };
}

import type { TemplateRef } from '@angular/core';
import type { BeforeCloseCallback, BeforeOpenCallback, Placement } from '@nexora-ui/overlay';

import type { MentionTriggerConfig } from '../types/mention-types';

import type { MentionPanelContext } from './mention-panel-host.component';

type PanelClassInput = string | string[] | undefined;
type PanelStyleInput = Record<string, string> | undefined;
type TriggerConfigsInput<T> = readonly MentionTriggerConfig<T>[];

export interface MentionControllerWire<T = unknown> {
  readonly el: HTMLElement;
  readonly triggers: readonly MentionTriggerConfig<T>[];
  readonly panelTpl: TemplateRef<MentionPanelContext<T>>;
  readonly placement: Placement;
  readonly offset: number;
  readonly debounceMs: number;
  readonly loadingDebounceMs: number;
  readonly minLoadingMs: number;
  readonly moveCaret: boolean;
  readonly panelClass: PanelClassInput;
  readonly panelStyle: PanelStyleInput;
  readonly closeMs: number;
  readonly beforeOpen: BeforeOpenCallback | undefined;
  readonly beforeClose: BeforeCloseCallback | undefined;
  readonly chipClass: string | undefined;
}

function toPanelClassParts(panelClass: PanelClassInput): string[] {
  if (panelClass == null) return [];

  return Array.isArray(panelClass) ? [...panelClass] : [panelClass];
}

export function normalizePanelClasses(panelClass: PanelClassInput): string[] {
  return toPanelClassParts(panelClass);
}

function arePanelClassInputsEqual(a: PanelClassInput, b: PanelClassInput): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;

  const aParts = toPanelClassParts(a);
  const bParts = toPanelClassParts(b);
  if (aParts.length !== bParts.length) return false;

  for (let i = 0; i < aParts.length; i++) {
    if (aParts[i] !== bParts[i]) return false;
  }

  return true;
}

function areStyleRecordsShallowEqual(a: PanelStyleInput, b: PanelStyleInput): boolean {
  if (a === b) return true;
  if (!a || !b) return false;

  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;

  for (const key of aKeys) {
    if (a[key] !== b[key]) return false;
  }

  return true;
}

function areTriggerConfigsEqual<T>(a: TriggerConfigsInput<T>, b: TriggerConfigsInput<T>): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }

  return true;
}

export function isSameMentionControllerWire<T>(
  prev: MentionControllerWire<T> | null,
  next: MentionControllerWire<T>,
  controllerReady: boolean,
  adapterReady: boolean,
): boolean {
  const isReady = controllerReady && adapterReady;

  if (!isReady || !prev) return false;

  return (
    prev.el === next.el &&
    areTriggerConfigsEqual(prev.triggers, next.triggers) &&
    prev.panelTpl === next.panelTpl &&
    prev.placement === next.placement &&
    prev.offset === next.offset &&
    prev.debounceMs === next.debounceMs &&
    prev.loadingDebounceMs === next.loadingDebounceMs &&
    prev.minLoadingMs === next.minLoadingMs &&
    prev.moveCaret === next.moveCaret &&
    arePanelClassInputsEqual(prev.panelClass, next.panelClass) &&
    areStyleRecordsShallowEqual(prev.panelStyle, next.panelStyle) &&
    prev.closeMs === next.closeMs &&
    prev.beforeOpen === next.beforeOpen &&
    prev.beforeClose === next.beforeClose &&
    prev.chipClass === next.chipClass
  );
}

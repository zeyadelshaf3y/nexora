import { InjectionToken } from '@angular/core';
import type { TemplateRef } from '@angular/core';

import type { MentionPanelState } from '../types/mention-types';

import type { MentionController } from './mention-controller.types';

export const NXR_MENTION_CONTROLLER = new InjectionToken<MentionController<unknown>>(
  'NXR_MENTION_CONTROLLER',
);

export interface MentionPanelContext<T = unknown> {
  readonly state: MentionPanelState<T>;
  readonly select: (item: T) => void;
  readonly close: () => void;
}

export const NXR_MENTION_PANEL_TEMPLATE = new InjectionToken<
  TemplateRef<MentionPanelContext<unknown>>
>('NXR_MENTION_PANEL_TEMPLATE');

export const NXR_MENTION_PANEL_HEADER_TEMPLATE = new InjectionToken<TemplateRef<unknown> | null>(
  'NXR_MENTION_PANEL_HEADER_TEMPLATE',
);

export const NXR_MENTION_PANEL_FOOTER_TEMPLATE = new InjectionToken<TemplateRef<unknown> | null>(
  'NXR_MENTION_PANEL_FOOTER_TEMPLATE',
);

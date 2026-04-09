import { inject, Injectable } from '@angular/core';
import type { TemplateRef, Type } from '@angular/core';

import { DrawerStrategy } from '../position/drawer-strategy';
import { DEFAULT_CLOSE_POLICY } from '../ref/close-policy';
import type { OverlayRef } from '../ref/overlay-ref';
import type {
  DrawerOpenOptions,
  OpenOptionsForComponent,
  OpenOptionsForTemplate,
} from '../types/open-types';

import { resolveDrawerPanelDimensions } from './drawer-dimensions';
import { OverlayService, type OverlayOpenConfig } from './overlay.service';
import {
  resolvePanelOverlayFocusStrategy,
  resolvePanelOverlayHasBackdrop,
  resolvePanelOverlayScrollStrategy,
} from './panel-overlay-modal-defaults';

/**
 * Convenience service for drawer overlays (side or edge panels).
 * Wraps {@link OverlayService} with {@link DrawerStrategy} and sensible defaults
 * (block scroll, focus trap, backdrop). Placement defaults to `'end'`.
 *
 * Overflow and display are controlled by the consumer's `panelClass` CSS.
 * The engine only applies sizing constraints and viewport caps.
 */
@Injectable({ providedIn: 'root' })
export class DrawerService {
  private readonly overlay = inject(OverlayService);

  async open<T>(
    content: Type<T>,
    options?: OpenOptionsForComponent<T> & DrawerOpenOptions,
  ): Promise<OverlayRef | null>;
  async open(
    content: TemplateRef<unknown>,
    options?: OpenOptionsForTemplate & DrawerOpenOptions,
  ): Promise<OverlayRef | null>;
  async open(
    content: TemplateRef<unknown> | Type<unknown>,
    options?: (OpenOptionsForComponent<unknown> | OpenOptionsForTemplate) & DrawerOpenOptions,
  ): Promise<OverlayRef | null> {
    const placement = options?.placement ?? 'end';

    const config: OverlayOpenConfig = {
      ...options,
      ...resolveDrawerPanelDimensions(placement, options),
      positionStrategy: new DrawerStrategy(placement),
      scrollStrategy: resolvePanelOverlayScrollStrategy(options),
      focusStrategy: resolvePanelOverlayFocusStrategy(options),
      hasBackdrop: resolvePanelOverlayHasBackdrop(options),
      closePolicy: DEFAULT_CLOSE_POLICY,
    };

    return this.overlay.open(content as Type<unknown>, config);
  }
}

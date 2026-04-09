import { inject, Injectable } from '@angular/core';
import type { TemplateRef, Type } from '@angular/core';

import { DialogStrategy } from '../position/dialog-strategy';
import { DEFAULT_CLOSE_POLICY } from '../ref/close-policy';
import type { OverlayRef } from '../ref/overlay-ref';
import type {
  DialogOpenOptions,
  OpenOptionsForComponent,
  OpenOptionsForTemplate,
} from '../types/open-types';

import { OverlayService, type OverlayOpenConfig } from './overlay.service';
import {
  resolvePanelOverlayFocusStrategy,
  resolvePanelOverlayHasBackdrop,
  resolvePanelOverlayScrollStrategy,
} from './panel-overlay-modal-defaults';

/**
 * Convenience service for dialog overlays (centered or positioned modals).
 * Wraps {@link OverlayService} with {@link DialogStrategy} and sensible defaults
 * (block scroll, focus trap, backdrop). Placement defaults to `'center'`.
 *
 * The pane acts as a flex-column wrapper capped at the viewport. Overflow and
 * display are controlled by the consumer's `panelClass` CSS — the engine does not
 * set them. For scrollable dialogs with fixed header/footer, use
 * `panelStyle: { overflow: 'hidden' }` and handle scrolling in the inner layout.
 */
@Injectable({ providedIn: 'root' })
export class DialogService {
  private readonly overlay = inject(OverlayService);

  async open<T>(
    content: Type<T>,
    options?: OpenOptionsForComponent<T> & DialogOpenOptions,
  ): Promise<OverlayRef | null>;
  async open(
    content: TemplateRef<unknown>,
    options?: OpenOptionsForTemplate & DialogOpenOptions,
  ): Promise<OverlayRef | null>;
  async open(
    content: TemplateRef<unknown> | Type<unknown>,
    options?: (OpenOptionsForComponent<unknown> | OpenOptionsForTemplate) & DialogOpenOptions,
  ): Promise<OverlayRef | null> {
    const config: OverlayOpenConfig = {
      ...options,
      positionStrategy: new DialogStrategy(options?.placement ?? 'center'),
      scrollStrategy: resolvePanelOverlayScrollStrategy(options),
      focusStrategy: resolvePanelOverlayFocusStrategy(options),
      hasBackdrop: resolvePanelOverlayHasBackdrop(options),
      closePolicy: DEFAULT_CLOSE_POLICY,
    };

    return this.overlay.open(content as Type<unknown>, config);
  }
}

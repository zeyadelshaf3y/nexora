import { inject, Injectable, isDevMode } from '@angular/core';
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
  DEFAULT_OVERLAY_DEFAULTS_CONFIG,
  mergeOverlayClassValue,
  OVERLAY_DEFAULTS_CONFIG,
  resolveOverlayBackdropClassWithBase,
  resolveOverlayBackdropStyleValue,
  mergeOverlayStyleValue,
  warnOnIgnoredPanelServiceOverlayDefaults,
} from './overlay-defaults.config';
import {
  DIALOG_DEFAULTS_CONFIG,
  DEFAULT_DIALOG_DEFAULTS_CONFIG,
} from './panel-services-defaults.config';
import {
  resolvePanelOverlayFocusStrategy,
  resolvePanelOverlayHasBackdrop,
  resolvePanelOverlayScrollStrategy,
} from './panel-overlay-modal-defaults';

const DIALOG_BACKDROP_CLASS = 'nxr-dialog-backdrop';

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
  private readonly overlayDefaults = {
    ...DEFAULT_OVERLAY_DEFAULTS_CONFIG,
    ...(inject(OVERLAY_DEFAULTS_CONFIG, { optional: true }) ?? {}),
  };
  private readonly classMergeMode = this.overlayDefaults.classMergeMode ?? 'replace';
  private readonly styleMergeMode = this.overlayDefaults.styleMergeMode ?? 'replace';
  private readonly defaults = {
    ...DEFAULT_DIALOG_DEFAULTS_CONFIG,
    hasBackdrop: this.overlayDefaults.hasBackdrop ?? DEFAULT_DIALOG_DEFAULTS_CONFIG.hasBackdrop,
    closeAnimationDurationMs:
      this.overlayDefaults.closeAnimationDurationMs ??
      DEFAULT_DIALOG_DEFAULTS_CONFIG.closeAnimationDurationMs,
    panelClass: this.overlayDefaults.panelClass,
    panelStyle: this.overlayDefaults.panelStyle,
    backdropClass: this.overlayDefaults.backdropClass,
    backdropStyle: this.overlayDefaults.backdropStyle,
    nxrBackdropClass: this.overlayDefaults.nxrBackdropClass,
    nxrBackdropStyles: this.overlayDefaults.nxrBackdropStyles,
    ...(inject(DIALOG_DEFAULTS_CONFIG, { optional: true }) ?? {}),
  };

  constructor() {
    if (isDevMode()) {
      warnOnIgnoredPanelServiceOverlayDefaults('dialog', 'DialogService', this.overlayDefaults);
    }
  }

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
    const mergedOptions = { ...this.defaults, ...options };
    const panelClass = mergeOverlayClassValue(
      this.defaults.panelClass,
      options?.panelClass,
      this.classMergeMode,
    );
    const panelStyle = mergeOverlayStyleValue(
      this.defaults.panelStyle,
      options?.panelStyle,
      this.styleMergeMode,
    );
    const backdropClass = mergeDialogBackdropClass({
      defaultsBackdropClass: this.defaults.backdropClass,
      instanceBackdropClass: options?.backdropClass,
      defaultsNxrBackdropClass: this.defaults.nxrBackdropClass,
      instanceNxrBackdropClass: options?.nxrBackdropClass,
      classMergeMode: this.classMergeMode,
    });
    const backdropStyle = mergeDialogBackdropStyle({
      defaultsBackdropStyle: this.defaults.backdropStyle,
      instanceBackdropStyle: options?.backdropStyle,
      defaultsNxrBackdropStyles: this.defaults.nxrBackdropStyles,
      instanceNxrBackdropStyles: options?.nxrBackdropStyles,
      styleMergeMode: this.styleMergeMode,
    });

    const config: OverlayOpenConfig = {
      ...mergedOptions,
      positionStrategy: new DialogStrategy(mergedOptions.placement ?? 'center'),
      scrollStrategy: resolvePanelOverlayScrollStrategy(mergedOptions),
      focusStrategy: resolvePanelOverlayFocusStrategy(mergedOptions),
      hasBackdrop: resolvePanelOverlayHasBackdrop(mergedOptions),
      panelClass,
      panelStyle,
      backdropClass,
      backdropStyle,
      closePolicy: DEFAULT_CLOSE_POLICY,
    };

    return this.overlay.open(content as Type<unknown>, config);
  }
}

function mergeDialogBackdropClass(args: {
  defaultsBackdropClass: string | string[] | undefined;
  instanceBackdropClass: string | string[] | undefined;
  defaultsNxrBackdropClass: string | string[] | undefined;
  instanceNxrBackdropClass: string | string[] | undefined;
  classMergeMode: 'append' | 'replace';
}): string | string[] {
  return resolveOverlayBackdropClassWithBase({
    baseBackdropClass: DIALOG_BACKDROP_CLASS,
    defaultsBackdropClass: args.defaultsBackdropClass,
    instanceBackdropClass: args.instanceBackdropClass,
    defaultsNxrBackdropClass: args.defaultsNxrBackdropClass,
    instanceNxrBackdropClass: args.instanceNxrBackdropClass,
    classMergeMode: args.classMergeMode,
  });
}

function mergeDialogBackdropStyle(args: {
  defaultsBackdropStyle: Record<string, string> | undefined;
  instanceBackdropStyle: Record<string, string> | undefined;
  defaultsNxrBackdropStyles: Record<string, string> | undefined;
  instanceNxrBackdropStyles: Record<string, string> | undefined;
  styleMergeMode: 'merge' | 'replace';
}): Record<string, string> | undefined {
  return resolveOverlayBackdropStyleValue({
    defaultsBackdropStyle: args.defaultsBackdropStyle,
    instanceBackdropStyle: args.instanceBackdropStyle,
    defaultsNxrBackdropStyles: args.defaultsNxrBackdropStyles,
    instanceNxrBackdropStyles: args.instanceNxrBackdropStyles,
    styleMergeMode: args.styleMergeMode,
  });
}

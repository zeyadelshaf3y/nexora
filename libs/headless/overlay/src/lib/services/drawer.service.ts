import { inject, Injectable, isDevMode } from '@angular/core';
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
  DEFAULT_OVERLAY_DEFAULTS_CONFIG,
  mergeOverlayClassValue,
  OVERLAY_DEFAULTS_CONFIG,
  resolveOverlayBackdropClassWithBase,
  resolveOverlayBackdropStyleValue,
  mergeOverlayStyleValue,
  warnOnIgnoredPanelServiceOverlayDefaults,
} from './overlay-defaults.config';
import {
  DEFAULT_DRAWER_DEFAULTS_CONFIG,
  DRAWER_DEFAULTS_CONFIG,
} from './panel-services-defaults.config';
import {
  resolvePanelOverlayFocusStrategy,
  resolvePanelOverlayHasBackdrop,
  resolvePanelOverlayScrollStrategy,
} from './panel-overlay-modal-defaults';

const DRAWER_BACKDROP_CLASS = 'nxr-drawer-backdrop';

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
  private readonly overlayDefaults = {
    ...DEFAULT_OVERLAY_DEFAULTS_CONFIG,
    ...(inject(OVERLAY_DEFAULTS_CONFIG, { optional: true }) ?? {}),
  };
  private readonly classMergeMode = this.overlayDefaults.classMergeMode ?? 'replace';
  private readonly styleMergeMode = this.overlayDefaults.styleMergeMode ?? 'replace';
  private readonly defaults = {
    ...DEFAULT_DRAWER_DEFAULTS_CONFIG,
    hasBackdrop: this.overlayDefaults.hasBackdrop ?? DEFAULT_DRAWER_DEFAULTS_CONFIG.hasBackdrop,
    closeAnimationDurationMs:
      this.overlayDefaults.closeAnimationDurationMs ??
      DEFAULT_DRAWER_DEFAULTS_CONFIG.closeAnimationDurationMs,
    panelClass: this.overlayDefaults.panelClass,
    panelStyle: this.overlayDefaults.panelStyle,
    backdropClass: this.overlayDefaults.backdropClass,
    backdropStyle: this.overlayDefaults.backdropStyle,
    nxrBackdropClass: this.overlayDefaults.nxrBackdropClass,
    nxrBackdropStyles: this.overlayDefaults.nxrBackdropStyles,
    ...(inject(DRAWER_DEFAULTS_CONFIG, { optional: true }) ?? {}),
  };

  constructor() {
    if (isDevMode()) {
      warnOnIgnoredPanelServiceOverlayDefaults('drawer', 'DrawerService', this.overlayDefaults);
    }
  }

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
    const mergedOptions = { ...this.defaults, ...options };
    const placement = mergedOptions.placement ?? 'end';
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
    const backdropClass = mergeDrawerBackdropClass({
      defaultsBackdropClass: this.defaults.backdropClass,
      instanceBackdropClass: options?.backdropClass,
      defaultsNxrBackdropClass: this.defaults.nxrBackdropClass,
      instanceNxrBackdropClass: options?.nxrBackdropClass,
      classMergeMode: this.classMergeMode,
    });
    const backdropStyle = mergeDrawerBackdropStyle({
      defaultsBackdropStyle: this.defaults.backdropStyle,
      instanceBackdropStyle: options?.backdropStyle,
      defaultsNxrBackdropStyles: this.defaults.nxrBackdropStyles,
      instanceNxrBackdropStyles: options?.nxrBackdropStyles,
      styleMergeMode: this.styleMergeMode,
    });

    const config: OverlayOpenConfig = {
      ...mergedOptions,
      ...resolveDrawerPanelDimensions(placement, mergedOptions),
      positionStrategy: new DrawerStrategy(placement),
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

function mergeDrawerBackdropClass(args: {
  defaultsBackdropClass: string | string[] | undefined;
  instanceBackdropClass: string | string[] | undefined;
  defaultsNxrBackdropClass: string | string[] | undefined;
  instanceNxrBackdropClass: string | string[] | undefined;
  classMergeMode: 'append' | 'replace';
}): string | string[] {
  return resolveOverlayBackdropClassWithBase({
    baseBackdropClass: DRAWER_BACKDROP_CLASS,
    defaultsBackdropClass: args.defaultsBackdropClass,
    instanceBackdropClass: args.instanceBackdropClass,
    defaultsNxrBackdropClass: args.defaultsNxrBackdropClass,
    instanceNxrBackdropClass: args.instanceNxrBackdropClass,
    classMergeMode: args.classMergeMode,
  });
}

function mergeDrawerBackdropStyle(args: {
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

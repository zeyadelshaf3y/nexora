import { InjectionToken, isDevMode, type Provider } from '@angular/core';
import { warnOnce } from '@nexora-ui/core';

import type { ViewportBoundaries } from '../ref/overlay-config';

export type OverlayClassMergeMode = 'append' | 'replace';
export type OverlayStyleMergeMode = 'merge' | 'replace';

export interface OverlayDefaultsConfig {
  readonly hasBackdrop?: boolean;
  readonly closeAnimationDurationMs?: number;
  readonly maintainInViewport?: boolean;
  readonly boundaries?: ViewportBoundaries;
  readonly panelClass?: string | string[];
  readonly panelStyle?: Record<string, string>;
  readonly backdropClass?: string | string[];
  readonly backdropStyle?: Record<string, string>;
  readonly nxrBackdropClass?: string | string[];
  readonly nxrBackdropStyles?: Record<string, string>;
  readonly classMergeMode?: OverlayClassMergeMode;
  readonly styleMergeMode?: OverlayStyleMergeMode;
}

export const DEFAULT_OVERLAY_DEFAULTS_CONFIG: OverlayDefaultsConfig = {
  classMergeMode: 'replace',
  styleMergeMode: 'replace',
};

export const OVERLAY_DEFAULTS_CONFIG = new InjectionToken<OverlayDefaultsConfig>(
  'OVERLAY_DEFAULTS_CONFIG',
);

export function provideOverlayDefaults(config: OverlayDefaultsConfig): Provider {
  if (isDevMode()) {
    validateOverlayDefaultsConfig(config);
  }

  return { provide: OVERLAY_DEFAULTS_CONFIG, useValue: config };
}

export function warnOnIgnoredPanelServiceOverlayDefaults(
  serviceId: 'dialog' | 'drawer',
  serviceName: 'DialogService' | 'DrawerService',
  overlayDefaults: OverlayDefaultsConfig,
): void {
  if (overlayDefaults.maintainInViewport != null) {
    warnOnce(
      `nxr-${serviceId}-overlay-defaults-maintain-in-viewport-ignored`,
      `OVERLAY_DEFAULTS_CONFIG.maintainInViewport is ignored by ${serviceName}.`,
    );
  }
  if (overlayDefaults.boundaries != null) {
    warnOnce(
      `nxr-${serviceId}-overlay-defaults-boundaries-ignored`,
      `OVERLAY_DEFAULTS_CONFIG.boundaries is ignored by ${serviceName}.`,
    );
  }
}

export function mergeOverlayClassValue(
  defaultsValue: string | string[] | undefined,
  instanceValue: string | string[] | undefined,
  mode: OverlayClassMergeMode,
): string | string[] | undefined {
  if (mode === 'replace') {
    return instanceValue == null || instanceValue === '' ? defaultsValue : instanceValue;
  }

  const defaultsTokens = toClassTokens(defaultsValue);
  const instanceTokens = toClassTokens(instanceValue);
  const merged = [...defaultsTokens, ...instanceTokens];

  return merged.length === 0 ? undefined : Array.from(new Set(merged));
}

export function mergeOverlayStyleValue(
  defaultsValue: Record<string, string> | undefined,
  instanceValue: Record<string, string> | undefined,
  mode: OverlayStyleMergeMode,
): Record<string, string> | undefined {
  if (mode === 'replace') {
    return instanceValue ?? defaultsValue;
  }

  if (defaultsValue == null) return instanceValue;
  if (instanceValue == null) return defaultsValue;

  return { ...defaultsValue, ...instanceValue };
}

export function resolveOverlayBackdropClassValue(params: {
  defaultsBackdropClass: string | string[] | undefined;
  instanceBackdropClass: string | string[] | undefined;
  defaultsNxrBackdropClass: string | string[] | undefined;
  instanceNxrBackdropClass: string | string[] | undefined;
  classMergeMode: OverlayClassMergeMode;
}): string | string[] | undefined {
  const baseBackdropClass = mergeOverlayClassValue(
    params.defaultsBackdropClass,
    params.instanceBackdropClass,
    params.classMergeMode,
  );
  const withDefaultsNxrClass = mergeOverlayClassValue(
    baseBackdropClass,
    params.defaultsNxrBackdropClass,
    'append',
  );

  return mergeOverlayClassValue(withDefaultsNxrClass, params.instanceNxrBackdropClass, 'append');
}

export function resolveOverlayBackdropClassWithBase(params: {
  baseBackdropClass: string;
  defaultsBackdropClass: string | string[] | undefined;
  instanceBackdropClass: string | string[] | undefined;
  defaultsNxrBackdropClass: string | string[] | undefined;
  instanceNxrBackdropClass: string | string[] | undefined;
  classMergeMode: OverlayClassMergeMode;
}): string | string[] {
  const mergedBackdropClass = resolveOverlayBackdropClassValue({
    defaultsBackdropClass: params.defaultsBackdropClass,
    instanceBackdropClass: params.instanceBackdropClass,
    defaultsNxrBackdropClass: params.defaultsNxrBackdropClass,
    instanceNxrBackdropClass: params.instanceNxrBackdropClass,
    classMergeMode: params.classMergeMode,
  });

  return (
    mergeOverlayClassValue(params.baseBackdropClass, mergedBackdropClass, 'append') ?? [
      params.baseBackdropClass,
    ]
  );
}

export function resolveOverlayBackdropStyleValue(params: {
  defaultsBackdropStyle: Record<string, string> | undefined;
  instanceBackdropStyle: Record<string, string> | undefined;
  defaultsNxrBackdropStyles: Record<string, string> | undefined;
  instanceNxrBackdropStyles: Record<string, string> | undefined;
  styleMergeMode: OverlayStyleMergeMode;
}): Record<string, string> | undefined {
  const baseBackdropStyle = mergeOverlayStyleValue(
    params.defaultsBackdropStyle,
    params.instanceBackdropStyle,
    params.styleMergeMode,
  );
  const withDefaultsNxrStyles = mergeOverlayStyleValue(
    baseBackdropStyle,
    params.defaultsNxrBackdropStyles,
    'merge',
  );

  return mergeOverlayStyleValue(withDefaultsNxrStyles, params.instanceNxrBackdropStyles, 'merge');
}

function toClassTokens(value: string | string[] | undefined): string[] {
  if (value == null || value === '') return [];

  const parts = Array.isArray(value) ? value : [value];
  const tokens: string[] = [];

  for (const part of parts) {
    const split = part.split(/\s+/);
    for (const token of split) {
      if (token) tokens.push(token);
    }
  }

  return tokens;
}

function validateOverlayDefaultsConfig(config: OverlayDefaultsConfig): void {
  if (
    config.classMergeMode != null &&
    config.classMergeMode !== 'append' &&
    config.classMergeMode !== 'replace'
  ) {
    warnOnce(
      'nxr-overlay-defaults-invalid-class-merge-mode',
      'OVERLAY_DEFAULTS_CONFIG.classMergeMode must be "append" or "replace".',
    );
  }

  if (
    config.styleMergeMode != null &&
    config.styleMergeMode !== 'merge' &&
    config.styleMergeMode !== 'replace'
  ) {
    warnOnce(
      'nxr-overlay-defaults-invalid-style-merge-mode',
      'OVERLAY_DEFAULTS_CONFIG.styleMergeMode must be "merge" or "replace".',
    );
  }

  if (config.closeAnimationDurationMs != null && config.closeAnimationDurationMs < 0) {
    warnOnce(
      'nxr-overlay-defaults-invalid-close-animation-ms',
      'OVERLAY_DEFAULTS_CONFIG.closeAnimationDurationMs should be >= 0.',
    );
  }
}

import {
  mergeOverlayClassValue,
  resolveOverlayBackdropClassWithBase,
  resolveOverlayBackdropStyleValue,
  mergeOverlayStyleValue,
  type OverlayClassMergeMode,
  type OverlayDefaultsConfig,
  type OverlayStyleMergeMode,
} from '@nexora-ui/overlay';

import {
  DEFAULT_POPOVER_DEFAULTS_CONFIG,
  type PopoverDefaultsConfig,
} from './popover-defaults.config';

export function buildPopoverDefaults(
  overlayDefaults: OverlayDefaultsConfig,
  providedDefaults: PopoverDefaultsConfig | undefined,
): PopoverDefaultsConfig {
  return {
    ...DEFAULT_POPOVER_DEFAULTS_CONFIG,
    hasBackdrop: overlayDefaults.hasBackdrop ?? DEFAULT_POPOVER_DEFAULTS_CONFIG.hasBackdrop,
    closeAnimationDurationMs:
      overlayDefaults.closeAnimationDurationMs ??
      DEFAULT_POPOVER_DEFAULTS_CONFIG.closeAnimationDurationMs,
    maintainInViewport:
      overlayDefaults.maintainInViewport ?? DEFAULT_POPOVER_DEFAULTS_CONFIG.maintainInViewport,
    boundaries: overlayDefaults.boundaries ?? DEFAULT_POPOVER_DEFAULTS_CONFIG.boundaries,
    panelClass: overlayDefaults.panelClass,
    panelStyle: overlayDefaults.panelStyle,
    backdropClass: overlayDefaults.backdropClass,
    backdropStyle: overlayDefaults.backdropStyle,
    ...(providedDefaults ?? {}),
  };
}

export function resolvePopoverPanelClassInput(
  defaultsPanelClass: string | string[] | undefined,
  panelClassInput: string | string[] | undefined,
  classMergeMode: OverlayClassMergeMode,
): string | string[] | undefined {
  return mergeOverlayClassValue(defaultsPanelClass, panelClassInput, classMergeMode);
}

export function resolvePopoverPanelStyleInput(
  defaultsPanelStyle: Record<string, string> | undefined,
  panelStyleInput: Record<string, string> | undefined,
  styleMergeMode: OverlayStyleMergeMode,
): Record<string, string> | undefined {
  return mergeOverlayStyleValue(defaultsPanelStyle, panelStyleInput, styleMergeMode);
}

export function resolvePopoverBackdropClassInput(params: {
  baseBackdropClass: string;
  defaultsBackdropClass: string | string[] | undefined;
  popoverBackdropClassInput: string | string[] | undefined;
  defaultsNxrBackdropClass: string | string[] | undefined;
  nxrBackdropClassInput: string | string[] | undefined;
  classMergeMode: OverlayClassMergeMode;
}): string | string[] {
  return resolveOverlayBackdropClassWithBase({
    baseBackdropClass: params.baseBackdropClass,
    defaultsBackdropClass: params.defaultsBackdropClass,
    instanceBackdropClass: params.popoverBackdropClassInput,
    defaultsNxrBackdropClass: params.defaultsNxrBackdropClass,
    instanceNxrBackdropClass: params.nxrBackdropClassInput,
    classMergeMode: params.classMergeMode,
  });
}

export function resolvePopoverBackdropStyleInput(params: {
  defaultsBackdropStyle: Record<string, string> | undefined;
  popoverBackdropStyleInput: Record<string, string> | undefined;
  defaultsNxrBackdropStyles: Record<string, string> | undefined;
  nxrBackdropStylesInput: Record<string, string> | undefined;
  styleMergeMode: OverlayStyleMergeMode;
}): Record<string, string> | undefined {
  return resolveOverlayBackdropStyleValue({
    defaultsBackdropStyle: params.defaultsBackdropStyle,
    instanceBackdropStyle: params.popoverBackdropStyleInput,
    defaultsNxrBackdropStyles: params.defaultsNxrBackdropStyles,
    instanceNxrBackdropStyles: params.nxrBackdropStylesInput,
    styleMergeMode: params.styleMergeMode,
  });
}

export function resolvePopoverOverlayVisualInputs(params: {
  baseBackdropClass: string;
  defaultsPanelClass: string | string[] | undefined;
  defaultsPanelStyle: Record<string, string> | undefined;
  defaultsBackdropClass: string | string[] | undefined;
  defaultsBackdropStyle: Record<string, string> | undefined;
  defaultsNxrBackdropClass: string | string[] | undefined;
  defaultsNxrBackdropStyles: Record<string, string> | undefined;
  panelClassInput: string | string[] | undefined;
  panelStyleInput: Record<string, string> | undefined;
  popoverBackdropClassInput: string | string[] | undefined;
  popoverBackdropStyleInput: Record<string, string> | undefined;
  nxrBackdropClassInput: string | string[] | undefined;
  nxrBackdropStylesInput: Record<string, string> | undefined;
  classMergeMode: OverlayClassMergeMode;
  styleMergeMode: OverlayStyleMergeMode;
}): {
  panelClass: string | string[] | undefined;
  panelStyle: Record<string, string> | undefined;
  backdropClass: string | string[];
  backdropStyle: Record<string, string> | undefined;
} {
  return {
    panelClass: resolvePopoverPanelClassInput(
      params.defaultsPanelClass,
      params.panelClassInput,
      params.classMergeMode,
    ),
    panelStyle: resolvePopoverPanelStyleInput(
      params.defaultsPanelStyle,
      params.panelStyleInput,
      params.styleMergeMode,
    ),
    backdropClass: resolvePopoverBackdropClassInput({
      baseBackdropClass: params.baseBackdropClass,
      defaultsBackdropClass: params.defaultsBackdropClass,
      popoverBackdropClassInput: params.popoverBackdropClassInput,
      defaultsNxrBackdropClass: params.defaultsNxrBackdropClass,
      nxrBackdropClassInput: params.nxrBackdropClassInput,
      classMergeMode: params.classMergeMode,
    }),
    backdropStyle: resolvePopoverBackdropStyleInput({
      defaultsBackdropStyle: params.defaultsBackdropStyle,
      popoverBackdropStyleInput: params.popoverBackdropStyleInput,
      defaultsNxrBackdropStyles: params.defaultsNxrBackdropStyles,
      nxrBackdropStylesInput: params.nxrBackdropStylesInput,
      styleMergeMode: params.styleMergeMode,
    }),
  };
}

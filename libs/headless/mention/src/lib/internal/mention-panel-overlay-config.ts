import {
  composeBeforeCloseCallbacks,
  composeBeforeOpenCallbacks,
  createAnchoredOverlayConfig,
  NoopFocusStrategy,
  RepositionScrollStrategy,
  type BeforeCloseCallback,
  type BeforeOpenCallback,
  type OverlayConfig,
  type Placement,
} from '@nexora-ui/overlay';

import { NXR_MENTION_OVERLAY_PANE_CLASS } from '../constants/mention-overlay-constants';
import type { MentionTriggerPanelOptions } from '../types/mention-types';

/** Non-modal panel: escape + outside close. Backdrop is never used; `closePolicy.backdrop` is forced to `'none'`. */
const MENTION_PANEL_CLOSE_POLICY_BASE = {
  escape: 'top' as const,
  outside: 'top' as const,
  backdrop: 'none' as const,
};

export function buildMentionOverlayPanelClasses(
  panelFromTrigger: string | string[] | undefined,
  directiveExtraClasses: readonly string[],
): string | string[] {
  const triggerParts =
    panelFromTrigger == null
      ? []
      : Array.isArray(panelFromTrigger)
        ? [...panelFromTrigger]
        : [panelFromTrigger];

  if (directiveExtraClasses.length === 0 && triggerParts.length === 0) {
    return NXR_MENTION_OVERLAY_PANE_CLASS;
  }

  return [NXR_MENTION_OVERLAY_PANE_CLASS, ...triggerParts, ...directiveExtraClasses];
}

export interface BuildMentionPanelOverlayConfigParams {
  readonly anchor: HTMLElement;
  readonly panelOpt: MentionTriggerPanelOptions | undefined;
  readonly defaults: {
    readonly placement: Placement;
    readonly offset: number;
    readonly closeAnimationDurationMs: number;
    readonly beforeOpen: BeforeOpenCallback | undefined;
    readonly beforeClose: BeforeCloseCallback | undefined;
    readonly overlayPanelExtraClasses: readonly string[];
    readonly overlayPanelExtraStyle: Readonly<Record<string, string>> | undefined;
  };
}

/**
 * Directive-level placement, offset, hooks, and close animation are defaults; per-trigger
 * `panel` overrides where set.
 */
export function buildMentionPanelOverlayConfig(
  params: BuildMentionPanelOverlayConfigParams,
): OverlayConfig {
  const { anchor, panelOpt, defaults } = params;
  const placement = panelOpt?.placement ?? defaults.placement;
  const offset = panelOpt?.offset ?? defaults.offset;
  const scrollStrategy = panelOpt?.scrollStrategy ?? new RepositionScrollStrategy();
  const closePolicy = {
    ...MENTION_PANEL_CLOSE_POLICY_BASE,
    ...panelOpt?.closePolicy,
    backdrop: 'none' as const,
  };
  const closeAnimationDurationMs =
    panelOpt?.closeAnimationDurationMs ?? defaults.closeAnimationDurationMs;
  const panelStyle =
    panelOpt?.panelStyle != null
      ? { ...(defaults.overlayPanelExtraStyle ?? {}), ...panelOpt.panelStyle }
      : defaults.overlayPanelExtraStyle;

  return createAnchoredOverlayConfig({
    anchor,
    placement,
    offset,
    clampToViewport: panelOpt?.clampToViewport ?? true,
    hasBackdrop: false,
    closePolicy,
    scrollStrategy,
    focusStrategy: new NoopFocusStrategy(),
    closeAnimationDurationMs,
    panelClass: buildMentionOverlayPanelClasses(
      panelOpt?.panelClass,
      defaults.overlayPanelExtraClasses,
    ),
    beforeOpen: composeBeforeOpenCallbacks(defaults.beforeOpen, panelOpt?.beforeOpen),
    beforeClose: composeBeforeCloseCallbacks(defaults.beforeClose, panelOpt?.beforeClose),

    ...(panelOpt?.maintainInViewport !== undefined && {
      maintainInViewport: panelOpt.maintainInViewport,
    }),
    ...(panelOpt?.preferredPlacementOnly !== undefined && {
      preferredPlacementOnly: panelOpt.preferredPlacementOnly,
    }),
    ...(panelOpt?.fallbackPlacements != null && {
      fallbackPlacements: panelOpt.fallbackPlacements,
    }),
    ...(panelOpt?.boundaries != null && { boundaries: panelOpt.boundaries }),

    ...(panelOpt?.width != null && { width: panelOpt.width }),
    ...(panelOpt?.height != null && { height: panelOpt.height }),
    ...(panelOpt?.minWidth != null && { minWidth: panelOpt.minWidth }),
    ...(panelOpt?.minHeight != null && { minHeight: panelOpt.minHeight }),
    ...(panelOpt?.maxWidth != null && { maxWidth: panelOpt.maxWidth }),
    ...(panelOpt?.maxHeight != null && { maxHeight: panelOpt.maxHeight }),
    ...(panelStyle != null && { panelStyle }),

    ...(panelOpt?.arrowSize != null && { arrowSize: panelOpt.arrowSize }),
    ...(panelOpt?.ariaLabel != null && { ariaLabel: panelOpt.ariaLabel }),
    ...(panelOpt?.ariaLabelledBy != null && { ariaLabelledBy: panelOpt.ariaLabelledBy }),
  });
}

/**
 * Shared hover-leave handler for anchored overlay triggers (tooltip, popover).
 * Centralizes: cancel open delay, optional opening early-exit, allowContentHover hit-test skip,
 * and scheduling close via HoverBridge or direct close.
 *
 * @internal
 */

import {
  isInsideOverlayPaneOrBridge,
  shouldSkipHoverClose,
  type HoverBridge,
} from '../hover/hover-bridge';
import type { OverlayRef } from '../ref/overlay-ref';

import type { TriggerDelay } from './trigger-delay';

/**
 * Context passed to handleAnchoredHoverLeave. All values are read at call time so the
 * directive can pass getters or current state.
 */
export interface AnchoredHoverLeaveContext {
  /** Cancel any pending open timeout. */
  openDelay: TriggerDelay;
  /** When false, handler returns immediately. */
  isHoverTrigger: () => boolean;
  /** Must be 'hover' to proceed; otherwise return. */
  openedBy: string | null;
  /** Overlay ref when open; used to get pane and decide whether to run close logic. */
  overlayRef: OverlayRef | null;
  /** Anchor (trigger) element for building scope in shouldSkipHoverClose. */
  getTriggerElement: () => HTMLElement;
  /** Pane element (e.g. overlayRef.getPaneElement()). */
  getPane: () => HTMLElement | null;
  /** When true, check shouldSkipHoverClose before closing. */
  allowContentHover: boolean;
  /** Passed to shouldSkipHoverClose (treatAnyOverlayPaneAsInside). */
  isNestedOverlay: boolean;
  /** Delay in ms before close; 0 = close immediately. */
  getCloseDelay: () => number;
  /** When set, prefer `scheduleClose` (async when allowContentHover or delay > 0); else `close()`. */
  hoverBridge: HoverBridge | null;
  /** Called to close the overlay. */
  close: () => void;
  /**
   * When true and we would early-return for "opening" state, call this once then return.
   * Used by tooltip to set cancelPendingOpen = true when mouse leaves during open delay.
   */
  opening?: boolean;
  /** Called when opening is true before returning; only used when opening is true. */
  onOpeningLeave?: () => void;
}

/**
 * Handles mouse leave for an anchored overlay trigger (tooltip or popover).
 * Cancels open delay, optionally handles "still opening" state, checks allowContentHover
 * and shouldSkipHoverClose, then schedules close via hover bridge or calls close().
 */
export function handleAnchoredHoverLeave(event: MouseEvent, ctx: AnchoredHoverLeaveContext): void {
  if (!ctx.isHoverTrigger()) return;

  ctx.openDelay.cancel();

  if (ctx.opening && ctx.onOpeningLeave) {
    ctx.onOpeningLeave();

    return;
  }

  if (ctx.openedBy !== 'hover' || !ctx.overlayRef) return;

  if (ctx.allowContentHover) {
    const trigger = ctx.getTriggerElement();
    const pane = ctx.getPane();
    const related = event.relatedTarget;

    // `relatedTarget` often resolves before the hit stack catches up to the pane/bridge.
    if (related instanceof Node) {
      if (trigger.contains(related) || (pane != null && pane.contains(related))) {
        return;
      }
      if (
        !ctx.isNestedOverlay &&
        related instanceof Element &&
        isInsideOverlayPaneOrBridge(related)
      ) {
        return;
      }
    }

    const scope = pane ? [trigger, pane] : [trigger];
    if (
      shouldSkipHoverClose(event, {
        scope,
        treatAnyOverlayPaneAsInside: !ctx.isNestedOverlay,
      })
    ) {
      return;
    }
  }

  if (ctx.hoverBridge) {
    const delay = ctx.getCloseDelay();
    // Defer delay 0 so pane `mouseenter` / pointer guard can cancel before `close()`.
    if (ctx.allowContentHover || delay > 0) {
      ctx.hoverBridge.scheduleClose(
        delay,
        ctx.allowContentHover ? (event as PointerEvent) : undefined,
      );
    } else {
      ctx.close();
    }
  } else {
    ctx.close();
  }
}

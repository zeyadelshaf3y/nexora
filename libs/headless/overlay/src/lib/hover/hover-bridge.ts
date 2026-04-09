/**
 * @fileoverview Hover bridge: an invisible element that fills the gap between an anchor (trigger)
 * and an overlay pane so the cursor can move from trigger to pane without triggering hover-close.
 * Used by tooltip and popover when allowContentHover is true. Exports HoverBridge, gap helpers
 * (computeGapRect, gapEquals), and visibility helpers (shouldSkipHoverClose, isInsideOverlayPaneOrBridge).
 * @internal
 */

import { createRafThrottled, getGlobal, hasClosest, listen, ownerDocument } from '@nexora-ui/core';

import {
  DATA_ATTR_HOVER_BRIDGE,
  OVERLAY_SELECTOR_BRIDGE,
  OVERLAY_SELECTOR_PANE,
} from '../defaults/overlay-attributes';

import { computeGapRect, gapEquals, type GapRect } from './hover-gap';

const SELECTOR_PANE_OR_BRIDGE = `${OVERLAY_SELECTOR_PANE}, ${OVERLAY_SELECTOR_BRIDGE}`;

// ---------- Public types and gap API (re-exported from hover-gap for API stability) ----------

export type { GapRect } from './hover-gap';
export { computeGapRect } from './hover-gap';

export interface HoverBridgeConfig {
  readonly anchor: HTMLElement;
  readonly pane: HTMLElement;
  readonly getCloseDelay: () => number;
  readonly onClose: () => void;
  readonly bridgeAttr?: string;
  /** When true, cursor over any overlay pane/bridge does not close this overlay (e.g. top-level). */
  readonly treatAnyOverlayPaneAsInside?: boolean;
}

// ---------- Overlay / bridge visibility (public API) ----------

function asElement(node: Node | null): Element | null {
  return node && (node instanceof Element ? node : node.parentElement);
}

function isInsideSelector(el: Element | null, selector: string): boolean {
  return el != null && hasClosest(el) && el.closest(selector) != null;
}

export function isInsideOverlayPane(node: Node | null): boolean {
  return isInsideSelector(asElement(node), OVERLAY_SELECTOR_PANE);
}

export function isInsideOverlayPaneOrBridge(node: Node | null): boolean {
  const el = asElement(node);

  return el != null && hasClosest(el) && el.closest(SELECTOR_PANE_OR_BRIDGE) != null;
}

function isNodeInsideAny(node: Node | null, elements: readonly HTMLElement[]): boolean {
  if (!node || elements.length === 0) return false;

  for (const root of elements) {
    if (root.contains(node)) return true;
  }

  return false;
}

/** Whether to skip scheduling hover close; uses elementFromPoint (not relatedTarget). */
export function shouldSkipHoverClose(
  event: MouseEvent,
  options: { scope: readonly HTMLElement[]; treatAnyOverlayPaneAsInside?: boolean },
): boolean {
  const { scope, treatAnyOverlayPaneAsInside = false } = options;
  const doc = scope[0]?.ownerDocument;

  if (!doc) return false;

  const el = doc.elementFromPoint(event.clientX, event.clientY);

  if (!el) return false;

  if (isNodeInsideAny(el, scope)) return true;

  return treatAnyOverlayPaneAsInside === true && isInsideOverlayPaneOrBridge(el);
}

// ---------- Bridge DOM ----------

function syncBridgeZIndex(bridge: HTMLElement, pane: HTMLElement): void {
  const z = pane.ownerDocument?.defaultView?.getComputedStyle(pane).zIndex;

  if (z && z !== 'auto') bridge.style.zIndex = z;
}

function applyGapToBridge(bridge: HTMLElement, gap: GapRect | null): void {
  Object.assign(
    bridge.style,
    gap
      ? {
          left: `${gap.left}px`,
          top: `${gap.top}px`,
          width: `${gap.width}px`,
          height: `${gap.height}px`,
          display: '',
        }
      : { display: 'none' },
  );
}

interface CreateBridgeElementParams {
  readonly doc: Document;
  readonly anchor: HTMLElement;
  readonly pane: HTMLElement;
  readonly bridgeAttr: string;
}

function createBridgeElement(params: CreateBridgeElementParams): HTMLElement | null {
  const { doc, anchor, pane, bridgeAttr } = params;
  const gap = computeGapRect({ anchor, pane });

  if (!gap) return null;

  const bridge = doc.createElement('div');
  bridge.setAttribute(bridgeAttr, '');
  bridge.style.position = 'fixed';
  bridge.style.pointerEvents = 'auto';
  syncBridgeZIndex(bridge, pane);
  applyGapToBridge(bridge, gap);

  return bridge;
}

function createBridgeScope(
  pane: HTMLElement,
  anchor: HTMLElement,
  bridge: HTMLElement,
): readonly HTMLElement[] {
  return [pane, anchor, bridge];
}

function createBridgeMouseHandlers(
  bridge: HTMLElement,
  onEnter: () => void,
  onLeave: (e: Event) => void,
): { unBridgeEnter: () => void; unBridgeLeave: () => void } {
  return {
    unBridgeEnter: listen(bridge, 'mouseenter', onEnter),
    unBridgeLeave: listen(bridge, 'mouseleave', onLeave),
  };
}

const runAfterPaint =
  typeof requestAnimationFrame !== 'undefined'
    ? (fn: () => void) => requestAnimationFrame(fn)
    : (fn: () => void) => fn();

// ---------- HoverBridge ----------

/**
 * Creates a HoverBridge and optionally attaches it. Shared helper for tooltip and popover
 * trigger directives so bridge creation and attach logic live in one place.
 * @internal
 */
export function createHoverBridgeAndAttach(
  config: HoverBridgeConfig,
  attachNow: boolean,
): { bridge: HoverBridge; detach: () => void } {
  const bridge = new HoverBridge(config);

  if (attachNow) bridge.attach();

  return {
    bridge,
    detach: () => bridge.detach(),
  };
}

/** Invisible bridge between anchor and pane so the cursor can cross the gap without closing. */
export class HoverBridge {
  private closeTimeout: ReturnType<typeof setTimeout> | null = null;
  private bridgeCleanup: (() => void) | null = null;
  private paneCleanup: (() => void) | null = null;

  constructor(private readonly config: HoverBridgeConfig) {}

  cancelClose(): void {
    if (this.closeTimeout != null) {
      clearTimeout(this.closeTimeout);

      this.closeTimeout = null;
    }
  }

  scheduleClose(delayOverride?: number): void {
    this.cancelClose();
    const delay = delayOverride ?? this.config.getCloseDelay();

    this.closeTimeout = setTimeout(() => {
      this.closeTimeout = null;

      this.config.onClose();
    }, delay);
  }

  attach(): void {
    this.detach();
    const { anchor, pane, bridgeAttr = DATA_ATTR_HOVER_BRIDGE } = this.config;
    const doc = ownerDocument(anchor);

    if (!pane.parentNode || !doc) return;

    const bridge = createBridgeElement({ doc, anchor, pane, bridgeAttr });

    if (!bridge) return;

    pane.parentNode.insertBefore(bridge, pane);
    const scope = createBridgeScope(pane, anchor, bridge);
    this.attachPaneListeners(pane, scope);

    const onEnter = () => this.cancelClose();
    const onLeave = this.createLeaveHandler(scope);
    const { unBridgeEnter, unBridgeLeave } = createBridgeMouseHandlers(bridge, onEnter, onLeave);

    const win = getGlobal();
    let lastGap: GapRect | null = null;

    const { run: scheduleUpdate, cancel: cancelRaf } = createRafThrottled(() => {
      const nextGap = computeGapRect({ anchor, pane });

      if (gapEquals(lastGap, nextGap)) return;

      applyGapToBridge(bridge, nextGap);

      lastGap = nextGap;

      if (nextGap) syncBridgeZIndex(bridge, pane);
    });

    const unScroll = listen(win ?? null, 'scroll', scheduleUpdate, true);
    const unResize = listen(win ?? null, 'resize', scheduleUpdate);

    this.bridgeCleanup = () => {
      cancelRaf();
      unScroll();
      unResize();
      unBridgeEnter();
      unBridgeLeave();
      bridge.remove();
    };
  }

  detach(): void {
    this.cancelClose();
    this.bridgeCleanup?.();
    this.bridgeCleanup = null;
    this.paneCleanup?.();
    this.paneCleanup = null;
  }

  private createLeaveHandler(scope: readonly HTMLElement[]): (e: Event) => void {
    const opts = { scope, treatAnyOverlayPaneAsInside: this.config.treatAnyOverlayPaneAsInside };

    return (e: Event) => {
      const ev = e as MouseEvent;

      if (shouldSkipHoverClose(ev, opts)) return;

      // Double check after paint: at leave time elementFromPoint may not yet reflect the cursor over the pane;
      // re-checking avoids closing when the user moved from trigger to pane in the same frame.
      runAfterPaint(() => {
        if (shouldSkipHoverClose(ev, opts)) return;

        this.scheduleClose();
      });
    };
  }

  private attachPaneListeners(pane: HTMLElement, scope: readonly HTMLElement[]): void {
    this.paneCleanup?.();
    const onEnter = () => this.cancelClose();
    const onLeave = this.createLeaveHandler(scope);
    const unEnter = listen(pane, 'mouseenter', onEnter);

    const unLeave = listen(pane, 'mouseleave', onLeave);
    this.paneCleanup = () => {
      unEnter();
      unLeave();
    };
  }
}

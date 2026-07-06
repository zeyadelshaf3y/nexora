/**
 * Resolves drawer snap sizes and applies runtime size updates during snap drag.
 * @internal
 */

import type { DrawerPlacement } from '../position/drawer-strategy';

import type { DragDismissAxis } from './drag-dismiss-vector';
import type { DrawerSnapConfig } from './drag-to-close-config';
import { parseDrawerPanePlacement, getPaneSizeAlongAxis } from './drawer-drag-dismiss-vector';

interface DrawerSnapViewport {
  readonly width: number;
  readonly height: number;
}

export interface ResolvedDrawerSnapMetrics {
  readonly axis: DragDismissAxis;
  readonly axisDimension: 'width' | 'height';
  readonly initialPx: number;
  readonly expandedPx: number;
}

/** Parses a CSS length against viewport dimensions into pixels. */
export function parseCssLengthToPx(
  value: string,
  viewport: DrawerSnapViewport,
  axis: DragDismissAxis,
): number {
  const trimmed = value.trim();
  const numeric = parseFloat(trimmed);

  if (Number.isNaN(numeric)) return 0;

  if (trimmed.endsWith('vh')) return (numeric / 100) * viewport.height;
  if (trimmed.endsWith('vw')) return (numeric / 100) * viewport.width;
  if (trimmed.endsWith('px')) return numeric;
  if (trimmed.endsWith('%')) {
    const base = axis === 'x' ? viewport.width : viewport.height;

    return (numeric / 100) * base;
  }

  return numeric;
}

function resolveAxisDimension(placement: DrawerPlacement): 'width' | 'height' {
  return placement === 'start' || placement === 'end' ? 'width' : 'height';
}

function readViewport(pane: HTMLElement): DrawerSnapViewport {
  const doc = pane.ownerDocument;
  const el = doc?.documentElement;

  return {
    width: el?.clientWidth ?? window.innerWidth,
    height: el?.clientHeight ?? window.innerHeight,
  };
}

function readExpandedCapPx(
  pane: HTMLElement,
  axis: DragDismissAxis,
  viewport: DrawerSnapViewport,
): number {
  const computed = pane.ownerDocument?.defaultView?.getComputedStyle(pane);
  const maxRaw = axis === 'x' ? computed?.maxWidth : computed?.maxHeight;

  if (maxRaw && maxRaw !== 'none') {
    const parsed = parseCssLengthToPx(maxRaw, viewport, axis);

    if (parsed > 0 && Number.isFinite(parsed)) return parsed;
  }

  return axis === 'x' ? viewport.width : viewport.height;
}

/** Resolves snap sizes for a drawer pane from config and placement. */
export function resolveDrawerSnapMetrics(args: {
  snap: DrawerSnapConfig;
  pane: HTMLElement;
  axis: DragDismissAxis;
}): ResolvedDrawerSnapMetrics | null {
  const placement = parseDrawerPanePlacement(args.pane);

  if (!placement) return null;

  const viewport = readViewport(args.pane);
  const axisDimension = resolveAxisDimension(placement);
  const initialPx = parseCssLengthToPx(args.snap.initialSize, viewport, args.axis);
  const expandedCap = args.snap.expandedSize
    ? parseCssLengthToPx(args.snap.expandedSize, viewport, args.axis)
    : readExpandedCapPx(args.pane, args.axis, viewport);

  if (initialPx <= 0) return null;

  const expandedPx = Math.max(initialPx, expandedCap);

  return {
    axis: args.axis,
    axisDimension,
    initialPx,
    expandedPx,
  };
}

export function getCurrentSnapPositionPx(
  pane: HTMLElement,
  metrics: ResolvedDrawerSnapMetrics,
): number {
  return getPaneSizeAlongAxis(pane, metrics.axis);
}

export function applySnapSize(
  ref: { updateSize(size: Partial<Record<'width' | 'height', string>>): void },
  metrics: ResolvedDrawerSnapMetrics,
  sizePx: number,
): void {
  const value = `${Math.round(sizePx)}px`;

  ref.updateSize(metrics.axisDimension === 'width' ? { width: value } : { height: value });
}

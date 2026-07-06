/**
 * Wires drawer drag-to-close on overlay attach / teardown.
 * @internal
 */

import type { OverlayConfig } from '../ref/overlay-config';
import type { OverlayRef } from '../ref/overlay-ref';

import { resolveDragToCloseConfig } from './drag-to-close-config';
import { attachDrawerDragController, detachDrawerDragController } from './drawer-drag-controller';
import { getDrawerDragController } from './drawer-drag-registry';

/** Creates a drawer drag controller when `dragToClose` is enabled in config. */
export function setupDrawerDragIfEnabled(
  ref: OverlayRef,
  pane: HTMLElement,
  backdrop: HTMLElement | null,
  config: Pick<OverlayConfig, 'dragToClose'>,
): void {
  const dragConfig = resolveDragToCloseConfig(config.dragToClose);

  if (!dragConfig) return;

  attachDrawerDragController(ref, pane, backdrop, dragConfig);
}

/** Applies snap `initialSize` after content attach when snap drag is enabled. */
export function applyDrawerSnapInitialSizeIfEnabled(pane: HTMLElement): void {
  getDrawerDragController(pane)?.applyInitialSnapSize();
}

/** Tears down drawer drag controller and clears drag state for the pane. */
export function teardownDrawerDrag(pane: HTMLElement): void {
  detachDrawerDragController(pane);
}

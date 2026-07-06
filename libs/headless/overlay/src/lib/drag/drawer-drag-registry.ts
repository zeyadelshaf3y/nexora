/**
 * Registry mapping drawer panes to their drag-to-close controller.
 * @internal
 */

import type { DrawerDragController } from './drawer-drag-controller';

const CONTROLLER_KEY: unique symbol = Symbol.for('@nexora-ui/overlay#drawer-drag-controller');

type GlobalWithController = typeof globalThis & {
  [CONTROLLER_KEY]?: WeakMap<HTMLElement, DrawerDragController>;
};

function controllerMap(): WeakMap<HTMLElement, DrawerDragController> {
  const g = globalThis as GlobalWithController;

  return (g[CONTROLLER_KEY] ??= new WeakMap<HTMLElement, DrawerDragController>());
}

export function registerDrawerDragController(
  pane: HTMLElement,
  controller: DrawerDragController,
): void {
  controllerMap().set(pane, controller);
}

export function unregisterDrawerDragController(pane: HTMLElement): void {
  controllerMap().delete(pane);
}

export function getDrawerDragController(pane: HTMLElement): DrawerDragController | null {
  return controllerMap().get(pane) ?? null;
}

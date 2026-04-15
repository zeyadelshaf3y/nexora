import type { DrawerPlacement } from '../position/drawer-strategy';
import type { PanelDimensionOptions } from '../ref/overlay-config';
import type { DrawerOpenOptions } from '../types/open-types';

/**
 * Drawer dimension defaults from placement (used by {@link DrawerService}).
 *
 * - **start / end** — height fills viewport (`100vh`), width sizes to content.
 * - **top / bottom** — width fills viewport (`100vw`), height sizes to content.
 */
export function resolveDrawerPanelDimensions(
  placement: DrawerPlacement,
  options?: DrawerOpenOptions,
): PanelDimensionOptions {
  if (placement === 'start' || placement === 'end') {
    return {
      width: options?.width,
      height: options?.height ?? '100vh',
      minWidth: options?.minWidth,
      maxWidth: options?.maxWidth,
    };
  }

  return {
    width: options?.width ?? '100vw',
    height: options?.height,
    minHeight: options?.minHeight,
    maxHeight: options?.maxHeight,
  };
}

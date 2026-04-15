import type { Provider } from '@angular/core';
import { InjectionToken } from '@angular/core';

import type { DialogPlacement } from '../position/dialog-strategy';
import type { DrawerPlacement } from '../position/drawer-strategy';
import type { DialogOpenOptions, DrawerOpenOptions } from '../types/open-types';

export type DialogDefaultsConfig = Omit<DialogOpenOptions, 'placement'> & {
  readonly placement?: DialogPlacement;
};

export type DrawerDefaultsConfig = Omit<DrawerOpenOptions, 'placement'> & {
  readonly placement?: DrawerPlacement;
};

export const DEFAULT_DIALOG_DEFAULTS_CONFIG: DialogDefaultsConfig = {
  placement: 'center',
  hasBackdrop: true,
};

export const DEFAULT_DRAWER_DEFAULTS_CONFIG: DrawerDefaultsConfig = {
  placement: 'end',
  hasBackdrop: true,
};

export const DIALOG_DEFAULTS_CONFIG = new InjectionToken<DialogDefaultsConfig>(
  'DIALOG_DEFAULTS_CONFIG',
);

export const DRAWER_DEFAULTS_CONFIG = new InjectionToken<DrawerDefaultsConfig>(
  'DRAWER_DEFAULTS_CONFIG',
);

export function provideDialogDefaults(config: DialogDefaultsConfig): Provider {
  return { provide: DIALOG_DEFAULTS_CONFIG, useValue: config };
}

export function provideDrawerDefaults(config: DrawerDefaultsConfig): Provider {
  return { provide: DRAWER_DEFAULTS_CONFIG, useValue: config };
}

export function providePanelServicesDefaults(config: {
  readonly dialog?: DialogDefaultsConfig;
  readonly drawer?: DrawerDefaultsConfig;
}): Provider[] {
  const providers: Provider[] = [];

  if (config.dialog != null) {
    providers.push(provideDialogDefaults(config.dialog));
  }
  if (config.drawer != null) {
    providers.push(provideDrawerDefaults(config.drawer));
  }

  return providers;
}

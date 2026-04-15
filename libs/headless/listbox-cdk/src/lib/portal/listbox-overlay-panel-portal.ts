import { Injector, type ViewContainerRef } from '@angular/core';
import {
  NxrListboxOverlayPanelHostComponent,
  NXR_LISTBOX_OVERLAY_PANEL_CONTEXT,
  type NxrListboxOverlayPanelContext,
} from '@nexora-ui/listbox/internal';
import { ComponentPortal } from '@nexora-ui/overlay';

/** Portal + child injector so the panel template receives `NXR_LISTBOX_CONTROLLER` and the virtual-scroll registry. */
export function createListboxOverlayPanelPortal<T>(
  viewContainerRef: ViewContainerRef,
  parentInjector: Injector,
  panelContext: NxrListboxOverlayPanelContext<T>,
): ComponentPortal<NxrListboxOverlayPanelHostComponent> {
  const contextInjector = Injector.create({
    parent: parentInjector,
    providers: [{ provide: NXR_LISTBOX_OVERLAY_PANEL_CONTEXT, useValue: panelContext }],
  });

  return new ComponentPortal(
    NxrListboxOverlayPanelHostComponent,
    viewContainerRef,
    contextInjector,
  );
}

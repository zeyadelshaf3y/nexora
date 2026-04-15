import { Injector, type TemplateRef, type ViewContainerRef } from '@angular/core';
import { ComponentPortal } from '@nexora-ui/overlay';

import { createListboxOverlayPanelPortal } from './listbox-overlay-panel-portal';

describe('createListboxOverlayPanelPortal', () => {
  it('returns a ComponentPortal wired with NXR_LISTBOX_OVERLAY_PANEL_CONTEXT', () => {
    const viewContainerRef = {} as ViewContainerRef;
    const portal = createListboxOverlayPanelPortal(viewContainerRef, Injector.NULL, {
      template: {} as TemplateRef<unknown>,
      value: () => null,
      multi: () => false,
      accessors: () => undefined,
      compareWith: () => undefined,
      initialHighlight: () => 'selected',
      onValueChange: () => undefined,
      onListboxReady: () => undefined,
    });

    expect(portal).toBeInstanceOf(ComponentPortal);
  });
});

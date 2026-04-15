import { Component, inject, ViewContainerRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { OverlayContainerService } from '../container/overlay-container.service';
import { OverlayEventsService } from '../events/overlay-events.service';
import { DefaultFocusStrategy } from '../focus/default-focus-strategy';
import { GlobalCenterStrategy } from '../position/global-center-strategy';
import { CLOSE_REASON_PROGRAMMATIC } from '../ref/close-reason';
import { BlockScrollStrategy } from '../scroll/block-scroll-strategy';
import { OverlayService } from '../services/overlay.service';
import { OverlayStackService } from '../stack/overlay-stack.service';

import { ComponentPortal } from './component-portal';

@Component({
  selector: 'nxr-test-panel',
  standalone: true,
  template: '<p>Component content</p>',
})
class TestPanelComponent {}

@Component({
  selector: 'nxr-portal-test-host',
  standalone: true,
  template: '<div>host</div>',
})
class HostComponent {
  readonly vcr = inject(ViewContainerRef);
}

describe('ComponentPortal', () => {
  let overlayService: OverlayService;
  let vcr: ViewContainerRef;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent, TestPanelComponent],
      providers: [
        OverlayService,
        OverlayStackService,
        OverlayContainerService,
        OverlayEventsService,
      ],
    }).compileComponents();
    overlayService = TestBed.inject(OverlayService);
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    vcr = fixture.componentInstance.vcr;
  });

  it('should attach and detach a component in an overlay', async () => {
    const portal = new ComponentPortal(TestPanelComponent, vcr);
    expect(portal.isAttached).toBe(false);

    const ref = overlayService.create({
      positionStrategy: new GlobalCenterStrategy(),
      scrollStrategy: new BlockScrollStrategy(),
      focusStrategy: new DefaultFocusStrategy(),
    });
    await ref.attach(portal);

    expect(portal.isAttached).toBe(true);
    expect(portal.componentRef).not.toBeNull();
    expect(document.body.textContent).toContain('Component content');

    await ref.close(CLOSE_REASON_PROGRAMMATIC);
    expect(portal.isAttached).toBe(false);
    expect(portal.componentRef).toBeNull();
  });
});

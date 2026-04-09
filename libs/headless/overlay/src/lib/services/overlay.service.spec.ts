import { type TemplateRef, ViewContainerRef, Component, ViewChild, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { OverlayContainerService } from '../container/overlay-container.service';
import { OverlayEventsService } from '../events/overlay-events.service';
import { DefaultFocusStrategy } from '../focus/default-focus-strategy';
import { TemplatePortal } from '../portal/template-portal';
import { GlobalCenterStrategy } from '../position/global-center-strategy';
import { CLOSE_REASON_PROGRAMMATIC } from '../ref/close-reason';
import { BlockScrollStrategy } from '../scroll/block-scroll-strategy';
import { OverlayStackService } from '../stack/overlay-stack.service';
import { afterClosedOnce } from '../utils/subscribe-once-after-closed';

import { OverlayService } from './overlay.service';

@Component({
  standalone: true,
  template: '<ng-template #tpl>Overlay content</ng-template>',
})
class HostComponent {
  @ViewChild('tpl') templateRef!: TemplateRef<unknown>;
  vcr = inject(ViewContainerRef);
}

describe('OverlayService (Phase 1 integration)', () => {
  let overlayService: OverlayService;
  let stack: OverlayStackService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        OverlayService,
        OverlayStackService,
        OverlayContainerService,
        OverlayEventsService,
      ],
    });
    overlayService = TestBed.inject(OverlayService);
    stack = TestBed.inject(OverlayStackService);
  });

  it('create() returns an OverlayRef with id and scopeId', () => {
    const ref = overlayService.create({
      positionStrategy: new GlobalCenterStrategy(),
      scrollStrategy: new BlockScrollStrategy(),
      focusStrategy: new DefaultFocusStrategy(),
    });
    expect(ref.id).toBeDefined();
    expect(ref.scopeId).toBe('global');
  });

  it('attach() registers overlay in stack and afterClosed() emits on close', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const portal = new TemplatePortal(host.templateRef, host.vcr);

    const ref = overlayService.create({
      positionStrategy: new GlobalCenterStrategy(),
      scrollStrategy: new BlockScrollStrategy(),
      focusStrategy: new DefaultFocusStrategy(),
    });

    const closedPromise = firstValueFrom(afterClosedOnce(ref));

    const opened = await ref.attach(portal);
    expect(opened).toBe(true);
    expect(stack.getTop()).toBe(ref);

    await ref.close(CLOSE_REASON_PROGRAMMATIC);

    const reason = await closedPromise;
    expect(reason).toBe(CLOSE_REASON_PROGRAMMATIC);
    expect(stack.getTop()).toBeNull();
  });

  it('dispose() unregisters from stack', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const portal = new TemplatePortal(host.templateRef, host.vcr);

    const ref = overlayService.create({
      positionStrategy: new GlobalCenterStrategy(),
      scrollStrategy: new BlockScrollStrategy(),
      focusStrategy: new DefaultFocusStrategy(),
    });
    await ref.attach(portal);
    expect(stack.getTop()).toBe(ref);

    const closedPromise = firstValueFrom(afterClosedOnce(ref));
    ref.dispose();
    await closedPromise;
    expect(stack.getTop()).toBeNull();
  });
});

import { type TemplateRef, ViewContainerRef, Component, ViewChild, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { OverlayContainerService } from '../container/overlay-container.service';
import { DefaultFocusStrategy } from '../focus/default-focus-strategy';
import { TemplatePortal } from '../portal/template-portal';
import { GlobalCenterStrategy } from '../position/global-center-strategy';
import { BlockScrollStrategy } from '../scroll/block-scroll-strategy';
import { OverlayStackService } from '../stack/overlay-stack.service';
import { afterClosedOnce } from '../utils/subscribe-once-after-closed';

import type { OverlayConfig } from './overlay-config';
import { OverlayRefImpl } from './overlay-ref-impl';

@Component({
  standalone: true,
  template: '<ng-template #tpl>Content</ng-template>',
})
class HostComponent {
  @ViewChild('tpl') templateRef!: TemplateRef<unknown>;
  vcr = inject(ViewContainerRef);
}

describe('OverlayRefImpl', () => {
  let container: OverlayContainerService;
  let stack: OverlayStackService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [OverlayContainerService, OverlayStackService],
    });
    container = TestBed.inject(OverlayContainerService);
    stack = TestBed.inject(OverlayStackService);
  });

  function createRef(overrides: Partial<OverlayConfig> = {}): OverlayRefImpl {
    const config: OverlayConfig = {
      positionStrategy: new GlobalCenterStrategy(),
      scrollStrategy: new BlockScrollStrategy(),
      focusStrategy: new DefaultFocusStrategy(),
      ...overrides,
    };

    return new OverlayRefImpl(config, stack, container);
  }

  it('attach() creates pane and registers in stack', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const portal = new TemplatePortal(host.templateRef, host.vcr);

    const ref = createRef();
    expect(ref.getPaneElement()).toBeNull();

    const opened = await ref.attach(portal);
    expect(opened).toBe(true);
    expect(ref.getPaneElement()).not.toBeNull();
    expect(stack.getTop()).toBe(ref);
  });

  it('close() runs close animation and afterClosed emits', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const portal = new TemplatePortal(host.templateRef, host.vcr);

    const ref = createRef({ closeAnimationDurationMs: 0 });
    await ref.attach(portal);

    const closedPromise = firstValueFrom(afterClosedOnce(ref));
    await ref.close('backdrop');

    const reason = await closedPromise;
    expect(reason).toBe('backdrop');
    expect(ref.getPaneElement()).toBeNull();
    expect(stack.getTop()).toBeNull();
  });

  it('getClosePolicy() returns merged policy', async () => {
    const ref = createRef({ hasBackdrop: true });
    const policy = ref.getClosePolicy();
    expect(policy.escape).toBeDefined();
    expect(policy.outside).toBeDefined();
    expect(policy.backdrop).toBeDefined();
  });

  it('restores host inline position after close when host mode mutates it', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host = document.createElement('div');
    host.style.position = '';
    document.body.appendChild(host);
    const portal = new TemplatePortal(
      fixture.componentInstance.templateRef,
      fixture.componentInstance.vcr,
    );

    const ref = createRef({ host, closeAnimationDurationMs: 0 });
    await ref.attach(portal);
    expect(host.style.position).toBe('relative');

    await ref.close('programmatic');
    expect(host.style.position).toBe('');
    document.body.removeChild(host);
  });
});

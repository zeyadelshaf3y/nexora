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

  it('updateSize() applies sizing to the pane and merges across calls', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const portal = new TemplatePortal(host.templateRef, host.vcr);

    const ref = createRef();
    await ref.attach(portal);

    ref.updateSize({ height: '600px', maxHeight: '90vh' });
    const pane = ref.getPaneElement();
    expect(pane?.style.height).toBe('600px');
    expect(pane?.style.maxHeight).toContain('90vh');

    ref.updateSize({ width: '480px' });
    expect(pane?.style.width).toBe('480px');
    expect(pane?.style.height).toBe('600px');
  });

  it('updateSize() before attach is a no-op (no throw)', () => {
    const ref = createRef();
    expect(() => ref.updateSize({ height: '500px' })).not.toThrow();
    expect(ref.getPaneElement()).toBeNull();
  });

  it('updateSize() resets a dimension to auto when passed undefined', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const portal = new TemplatePortal(host.templateRef, host.vcr);

    const ref = createRef({ height: '300px' });
    await ref.attach(portal);
    const pane = ref.getPaneElement();
    expect(pane?.style.height).toBe('300px');

    ref.updateSize({ height: '600px' });
    expect(pane?.style.height).toBe('600px');

    ref.updateSize({ height: undefined });
    expect(pane?.style.height).toBe('');
  });

  it('updateSize() preserves panelStyle dimensions it does not change and overrides ones it does', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const portal = new TemplatePortal(host.templateRef, host.vcr);

    const ref = createRef({ panelStyle: { width: '321px' } });
    await ref.attach(portal);
    const pane = ref.getPaneElement();
    expect(pane?.style.width).toBe('321px');

    ref.updateSize({ height: '600px' });
    expect(pane?.style.height).toBe('600px');
    expect(pane?.style.width).toBe('321px');

    ref.updateSize({ width: '480px' });
    expect(pane?.style.width).toBe('480px');
  });

  it('reposition keeps transform-origin anchored to the trigger (not reset to the placement origin)', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const portal = new TemplatePortal(host.templateRef, host.vcr);

    const trigger = document.createElement('button');
    trigger.getBoundingClientRect = () =>
      ({
        left: 100,
        top: 200,
        width: 40,
        height: 20,
        right: 140,
        bottom: 220,
        x: 100,
        y: 200,
        toJSON: () => ({}),
      }) as DOMRect;
    document.body.appendChild(trigger);

    try {
      const ref = createRef({ transformOriginElement: trigger });
      await ref.attach(portal);
      const pane = ref.getPaneElement();

      // A reposition (e.g. the pane ResizeObserver's initial callback firing during the open
      // animation) runs applyPosition, which writes the strategy's 'center center' origin. The
      // configured trigger must win so the overlay still grows from the trigger, not its center.
      ref.updateSize({ width: '300px' });

      expect(pane?.style.transformOrigin).not.toBe('center center');
      expect(pane?.style.transformOrigin).toMatch(/px/);
    } finally {
      document.body.removeChild(trigger);
    }
  });

  it('afterOpened() is replayed to subscribers that attach after open() resolves', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const portal = new TemplatePortal(host.templateRef, host.vcr);

    const ref = createRef();
    await ref.attach(portal);

    await expect(firstValueFrom(ref.afterOpened())).resolves.toBeUndefined();
  });

  it('isOpen() reflects attach/close lifecycle', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const portal = new TemplatePortal(host.templateRef, host.vcr);

    const ref = createRef({ closeAnimationDurationMs: 0 });
    expect(ref.isOpen()).toBe(false);

    await ref.attach(portal);
    expect(ref.isOpen()).toBe(true);

    await ref.close('programmatic');
    expect(ref.isOpen()).toBe(false);
  });

  it('afterOpened() emits once when attached', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const portal = new TemplatePortal(host.templateRef, host.vcr);

    const ref = createRef();
    const openedPromise = firstValueFrom(ref.afterOpened());

    await ref.attach(portal);
    await expect(openedPromise).resolves.toBeUndefined();
  });

  it('beforeClosed() emits before afterClosed() with the close reason', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const portal = new TemplatePortal(host.templateRef, host.vcr);

    const ref = createRef({ closeAnimationDurationMs: 0 });
    await ref.attach(portal);

    const order: string[] = [];
    ref.beforeClosed().subscribe((reason) => order.push(`before:${reason}`));
    ref.afterClosed().subscribe((reason) => order.push(`after:${reason}`));

    await ref.close('escape');
    expect(order).toEqual(['before:escape', 'after:escape']);
  });

  it('addPanelClass() / removePanelClass() toggle pane classes', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const portal = new TemplatePortal(host.templateRef, host.vcr);

    const ref = createRef();
    await ref.attach(portal);
    const pane = ref.getPaneElement();

    ref.addPanelClass(['demo-expanded', 'demo-flush']);
    expect(pane?.classList.contains('demo-expanded')).toBe(true);
    expect(pane?.classList.contains('demo-flush')).toBe(true);

    ref.removePanelClass('demo-expanded');
    expect(pane?.classList.contains('demo-expanded')).toBe(false);
    expect(pane?.classList.contains('demo-flush')).toBe(true);
  });

  it('addCloseGuard() can veto close; removing the guard re-allows it', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const portal = new TemplatePortal(host.templateRef, host.vcr);

    const ref = createRef({ closeAnimationDurationMs: 0 });
    await ref.attach(portal);

    const remove = ref.addCloseGuard(() => false);
    expect(await ref.close('programmatic')).toBe(false);
    expect(ref.getPaneElement()).not.toBeNull();

    remove();
    expect(await ref.close('programmatic')).toBe(true);
    expect(ref.getPaneElement()).toBeNull();
  });

  it('addCloseGuard() runs after config.beforeClose and receives the reason', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const portal = new TemplatePortal(host.templateRef, host.vcr);

    const order: string[] = [];
    const ref = createRef({
      closeAnimationDurationMs: 0,
      beforeClose: () => {
        order.push('config');
        return true;
      },
    });
    await ref.attach(portal);

    ref.addCloseGuard((reason) => {
      order.push(`guard:${reason}`);
      return true;
    });

    expect(await ref.close('escape')).toBe(true);
    expect(order).toEqual(['config', 'guard:escape']);
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

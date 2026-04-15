import {
  type TemplateRef,
  ViewContainerRef,
  Component,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject, type Observable } from 'rxjs';
import { vi } from 'vitest';

import { OverlayContainerService } from '../container/overlay-container.service';
import { OverlayEventsService } from '../events/overlay-events.service';
import { CLOSE_REASON_PROGRAMMATIC, type CloseReason } from '../ref/close-reason';
import type { OverlayRef } from '../ref/overlay-ref';
import { DialogService } from '../services/dialog.service';
import { OverlayService } from '../services/overlay.service';
import { OverlayStackService } from '../stack/overlay-stack.service';

import { OverlayTriggerDirective } from './overlay-trigger.directive';

function overlayRefWithDispose(dispose: OverlayRef['dispose']): OverlayRef {
  const afterClosed$ = new Subject<CloseReason | undefined>();
  const noopAsync = async (): Promise<boolean> => true;
  const noopFn = vi.fn();

  return {
    id: 'overlay-trigger-test',
    scopeId: 'global',
    attach: noopFn.mockImplementation(noopAsync) as OverlayRef['attach'],
    detach: noopFn as OverlayRef['detach'],
    dispose,
    close: noopFn.mockImplementation(noopAsync) as OverlayRef['close'],
    setCloseAnimationDurationMs: noopFn as OverlayRef['setCloseAnimationDurationMs'],
    afterClosed: ((): Observable<CloseReason | undefined> =>
      afterClosed$.asObservable()) as OverlayRef['afterClosed'],
    getPaneElement: (): null => null,
    getBackdropElement: (): null => null,
    getClosePolicy: () => ({ escape: 'top', outside: 'top', backdrop: 'none' }),
    containsAnchor: () => false,
    getOutsideClickBoundary: (): null => null,
    getParentRef: (): null => null,
    notifyOutsideClickAttempted: noopFn as OverlayRef['notifyOutsideClickAttempted'],
    reposition: noopFn as OverlayRef['reposition'],
    setZIndex: noopFn as OverlayRef['setZIndex'],
  };
}

@Component({
  standalone: true,
  imports: [OverlayTriggerDirective],
  template: `
    <button
      [nxrOverlay]="tpl"
      [nxrOverlayDisabled]="disabled()"
      (nxrOverlayOpened)="onOpened()"
      (nxrOverlayClosed)="onClosed($event)"
    >
      Open
    </button>
    <ng-template #tpl>Dialog content</ng-template>
  `,
})
class HostComponent {
  @ViewChild('tpl') templateRef!: TemplateRef<unknown>;
  @ViewChild(OverlayTriggerDirective) trigger!: OverlayTriggerDirective;
  vcr = inject(ViewContainerRef);
  disabled = signal(false);
  openedCount = 0;
  lastCloseReason: string | null = null;

  onOpened(): void {
    this.openedCount++;
  }

  onClosed(reason: string): void {
    this.lastCloseReason = reason;
  }
}

describe('OverlayTriggerDirective', () => {
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
  });

  it('should open overlay on click and set isOpen', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const trigger = host.trigger;
    const button = fixture.nativeElement.querySelector('button');

    expect(trigger.isOpen()).toBe(false);

    button.click();
    await fixture.whenStable();

    expect(trigger.isOpen()).toBe(true);
    expect(host.openedCount).toBe(1);
  });

  it('should close overlay on programmatic close and emit nxrOverlayClosed', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const trigger = host.trigger;
    const button = fixture.nativeElement.querySelector('button');

    button.click();
    await fixture.whenStable();
    expect(trigger.isOpen()).toBe(true);

    trigger.close();
    // Wait for close animation and afterClosed emission (poll up to ~2s)
    await new Promise<void>((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 100;

      const done = () => {
        if (host.lastCloseReason != null) resolve();
        else if (++attempts >= maxAttempts) reject(new Error('nxrOverlayClosed not emitted'));
        else setTimeout(done, 20);
      };

      done();
    });

    expect(trigger.isOpen()).toBe(false);
    expect(host.lastCloseReason).toBe(CLOSE_REASON_PROGRAMMATIC);
  });

  it('should not open when nxrOverlayDisabled is true', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    host.disabled.set(true);
    fixture.detectChanges();
    const trigger = host.trigger;
    const button = fixture.nativeElement.querySelector('button');

    button.click();
    await fixture.whenStable();

    expect(trigger.isOpen()).toBe(false);
    expect(host.openedCount).toBe(0);
  });

  it('should set aria-expanded and aria-haspopup on host', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button');

    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.getAttribute('aria-haspopup')).toBe('dialog');

    button.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(button.getAttribute('aria-expanded')).toBe('true');
  });

  it('disposes unresolved open result after destroy', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const trigger = host.trigger;
    const dialog = TestBed.inject(DialogService);

    let resolveOpen: (ref: OverlayRef | null) => void = () => {};

    const pending = new Promise<OverlayRef | null>((resolve) => {
      resolveOpen = resolve;
    });

    vi.spyOn(dialog, 'open').mockReturnValueOnce(pending as ReturnType<DialogService['open']>);

    trigger.open();
    fixture.destroy();

    const dispose = vi.fn();
    resolveOpen(overlayRefWithDispose(dispose));
    await pending;
    await Promise.resolve();

    expect(dispose).toHaveBeenCalledTimes(1);
  });
});

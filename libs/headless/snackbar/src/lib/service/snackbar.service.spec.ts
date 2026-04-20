import {
  Component,
  type Provider,
  type TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { OverlayService, type CloseReason, type OverlayRef } from '@nexora-ui/overlay';
import { Subject, type Observable } from 'rxjs';
import { vi } from 'vitest';

import { provideSnackbarDefaults } from '../options/snackbar-defaults.config';
import type { SnackbarAutoCloseState, SnackbarRef } from '../ref/snackbar-ref';

import { SnackbarService } from './snackbar.service';

@Component({
  standalone: true,
  template: '<ng-container #vc></ng-container>',
})
class HostComponent {
  @ViewChild('vc', { read: ViewContainerRef }) vcr!: ViewContainerRef;
}

@Component({
  standalone: true,
  template: '',
})
class DefaultSnackbarComponent {
  variant = '';
  title = '';
  message = '';
  actionLabel = '';
}

function createMockOverlayRef(
  options: { attachResolve?: boolean; pane?: HTMLElement | null } = {},
): OverlayRef {
  const attachResolve = options.attachResolve ?? true;
  const pane = options.pane ?? null;
  const afterClosed$ = new Subject<CloseReason | undefined>();

  const emitAfterClosed = (): void => {
    if (afterClosed$.closed) return;
    afterClosed$.next(undefined);
    afterClosed$.complete();
  };

  const attach = vi.fn().mockResolvedValue(attachResolve);
  const close = vi.fn().mockImplementation(async () => {
    emitAfterClosed();

    return true;
  });

  return {
    id: 'test-id',
    scopeId: 'global',
    attach: attach as OverlayRef['attach'],
    detach: vi.fn() as OverlayRef['detach'],
    dispose: vi.fn().mockImplementation(() => {
      emitAfterClosed();
    }) as OverlayRef['dispose'],
    close: close as OverlayRef['close'],
    setCloseAnimationDurationMs: vi.fn() as OverlayRef['setCloseAnimationDurationMs'],
    afterClosed: ((): Observable<CloseReason | undefined> =>
      afterClosed$.asObservable()) as OverlayRef['afterClosed'],
    getPaneElement: vi.fn(() => pane) as OverlayRef['getPaneElement'],
    getBackdropElement: vi.fn(() => null) as OverlayRef['getBackdropElement'],
    getClosePolicy: vi.fn(() => ({
      escape: 'none',
      outside: 'none',
      backdrop: 'none',
    })) as OverlayRef['getClosePolicy'],
    containsAnchor: vi.fn(() => false) as OverlayRef['containsAnchor'],
    getOutsideClickBoundary: vi.fn(() => null) as OverlayRef['getOutsideClickBoundary'],
    getParentRef: vi.fn(() => null) as OverlayRef['getParentRef'],
    notifyOutsideClickAttempted: vi.fn() as OverlayRef['notifyOutsideClickAttempted'],
    reposition: vi.fn() as OverlayRef['reposition'],
    setZIndex: vi.fn() as OverlayRef['setZIndex'],
  };
}

describe('SnackbarService', () => {
  let snackbarService: SnackbarService;
  let mockCreate: ReturnType<typeof vi.fn>;

  const configure = (providers: Provider[] = []): void => {
    TestBed.resetTestingModule();
    mockCreate = vi.fn();
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        SnackbarService,
        {
          provide: OverlayService,
          useValue: {
            create: mockCreate,
            getDefaultViewContainerRef: vi.fn().mockReturnValue(null),
          },
        },
        ...providers,
      ],
    });
    snackbarService = TestBed.inject(SnackbarService);
  };

  beforeEach(() => {
    vi.useRealTimers();
    configure();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('throws when viewContainerRef is missing and no default', () => {
    const overlayRef = createMockOverlayRef();
    mockCreate.mockReturnValue(overlayRef);
    expect(() =>
      snackbarService.open({} as TemplateRef<unknown>, { placement: 'bottom-end' }),
    ).toThrow(/could not obtain a ViewContainerRef/);
  });

  it('returns SnackbarRef and calls overlay.create when viewContainerRef is provided', async () => {
    const overlayRef = createMockOverlayRef();
    mockCreate.mockReturnValue(overlayRef);
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const vcr = fixture.componentInstance.vcr;
    const templateRef = {} as TemplateRef<unknown>;
    const ref = snackbarService.open(templateRef, {
      placement: 'bottom-end',
      viewContainerRef: vcr,
    });
    expect(ref).toBeDefined();
    expect(ref.afterClosed).toBeDefined();
    expect(mockCreate).toHaveBeenCalled();
    expect(overlayRef.attach).toHaveBeenCalled();
    await ref.close('done');
  });

  it('clamps maxWidth to viewport width in overlay config', () => {
    const overlayRef = createMockOverlayRef();
    mockCreate.mockReturnValue(overlayRef);
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    snackbarService.open({} as TemplateRef<unknown>, {
      viewContainerRef: fixture.componentInstance.vcr,
      width: '1200px',
      maxWidth: '200vw',
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        width: '1200px',
        maxWidth: 'min(200vw, max(0px, calc(100vw - 32px)))',
      }),
    );
  });

  it('replace-by-group: opening with same groupId closes previous', async () => {
    const overlayRef1 = createMockOverlayRef();
    const overlayRef2 = createMockOverlayRef();
    mockCreate.mockReturnValueOnce(overlayRef1).mockReturnValueOnce(overlayRef2);
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const vcr = fixture.componentInstance.vcr;
    const tpl = {} as TemplateRef<unknown>;
    snackbarService.open(tpl, {
      placement: 'bottom-end',
      viewContainerRef: vcr,
      groupId: 'notifications',
    });
    const ref2 = snackbarService.open(tpl, {
      placement: 'bottom-end',
      viewContainerRef: vcr,
      groupId: 'notifications',
    });
    expect(overlayRef1.close).toHaveBeenCalled();
    expect(ref2).toBeDefined();
  });

  it('cleans group registry when attach fails', async () => {
    const failedAttachRef = createMockOverlayRef({ attachResolve: false });
    const successfulRef = createMockOverlayRef({ attachResolve: true });
    mockCreate.mockReturnValueOnce(failedAttachRef).mockReturnValueOnce(successfulRef);
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const vcr = fixture.componentInstance.vcr;
    const tpl = {} as TemplateRef<unknown>;

    snackbarService.open(tpl, {
      placement: 'bottom-end',
      viewContainerRef: vcr,
      groupId: 'notifications',
    });
    await Promise.resolve();
    snackbarService.open(tpl, {
      placement: 'bottom-end',
      viewContainerRef: vcr,
      groupId: 'notifications',
    });

    expect(failedAttachRef.close).not.toHaveBeenCalled();
  });

  it('throws when notify defaults are not configured', () => {
    expect(() =>
      snackbarService.notify({
        inputs: { message: 'Saved' },
      }),
    ).toThrow(/no defaults configured/);
  });

  it('notify merges defaults and explicit options before opening default component', () => {
    const actionClick = vi.fn();
    configure([
      provideSnackbarDefaults({
        component: DefaultSnackbarComponent,
        defaultOpenOptions: {
          duration: 5000,
          placement: 'bottom-end',
          panelClass: 'default-snackbar',
        },
      }),
    ]);

    const mockRef: SnackbarRef<unknown> = {
      close: vi.fn(),
      dismiss: vi.fn(),
      afterClosed: vi.fn(() => new Subject<unknown>().asObservable()),
      getPaneElement: vi.fn(() => null),
      autoCloseState: vi.fn(() => new Subject<SnackbarAutoCloseState>().asObservable()),
      pauseAutoClose: vi.fn(),
      resumeAutoClose: vi.fn(),
    };
    const openSpy = vi.spyOn(snackbarService, 'open').mockReturnValue(mockRef);

    snackbarService.notify({
      duration: 3000,
      panelClass: 'explicit-class',
      maxVisibleSnackbars: 2,
      inputs: {
        variant: 'success',
        title: 'Saved',
        message: 'Profile updated',
        actionLabel: 'Undo',
      },
      outputs: {
        actionClick,
      },
    });

    expect(openSpy).toHaveBeenCalledWith(
      DefaultSnackbarComponent,
      expect.objectContaining({
        duration: 3000,
        placement: 'bottom-end',
        panelClass: 'explicit-class',
        maxVisibleSnackbars: 2,
        inputs: {
          variant: 'success',
          title: 'Saved',
          message: 'Profile updated',
          actionLabel: 'Undo',
        },
        outputs: {
          actionClick,
        },
      }),
    );
  });

  it('hides oldest snackbar when max visible is exceeded and reveals on close', async () => {
    const pane1 = document.createElement('div');
    const pane2 = document.createElement('div');
    const pane3 = document.createElement('div');
    const pane4 = document.createElement('div');
    const overlayRef1 = createMockOverlayRef({ pane: pane1 });
    const overlayRef2 = createMockOverlayRef({ pane: pane2 });
    const overlayRef3 = createMockOverlayRef({ pane: pane3 });
    const overlayRef4 = createMockOverlayRef({ pane: pane4 });
    mockCreate
      .mockReturnValueOnce(overlayRef1)
      .mockReturnValueOnce(overlayRef2)
      .mockReturnValueOnce(overlayRef3)
      .mockReturnValueOnce(overlayRef4);
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const opts = { viewContainerRef: fixture.componentInstance.vcr, maxVisibleSnackbars: 3 };
    const ref1 = snackbarService.open({} as TemplateRef<unknown>, opts);
    const ref2 = snackbarService.open({} as TemplateRef<unknown>, opts);
    snackbarService.open({} as TemplateRef<unknown>, opts);
    snackbarService.open({} as TemplateRef<unknown>, opts);
    await Promise.resolve();

    expect(overlayRef1.close).not.toHaveBeenCalled();
    expect(pane1.hasAttribute('hidden')).toBe(true);
    expect(pane2.hasAttribute('hidden')).toBe(false);
    expect(pane3.hasAttribute('hidden')).toBe(false);
    expect(pane4.hasAttribute('hidden')).toBe(false);

    ref2.close();
    await Promise.resolve();
    expect(pane1.hasAttribute('hidden')).toBe(false);
    expect(pane1.getAttribute('aria-hidden')).toBeNull();
    ref1.close();
  });

  it('uses defaults provider maxVisibleSnackbars when open options omit it', async () => {
    configure([
      provideSnackbarDefaults({
        component: DefaultSnackbarComponent,
        maxVisibleSnackbars: 1,
      }),
    ]);
    const pane1 = document.createElement('div');
    const pane2 = document.createElement('div');
    const overlayRef1 = createMockOverlayRef({ pane: pane1 });
    const overlayRef2 = createMockOverlayRef({ pane: pane2 });
    mockCreate.mockReturnValueOnce(overlayRef1).mockReturnValueOnce(overlayRef2);
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    snackbarService.open({} as TemplateRef<unknown>, {
      viewContainerRef: fixture.componentInstance.vcr,
    });
    snackbarService.open({} as TemplateRef<unknown>, {
      viewContainerRef: fixture.componentInstance.vcr,
    });
    await Promise.resolve();

    expect(pane1.hasAttribute('hidden')).toBe(true);
    expect(pane2.hasAttribute('hidden')).toBe(false);
  });

  it('ignores non-finite maxVisibleSnackbars values', async () => {
    const pane1 = document.createElement('div');
    const pane2 = document.createElement('div');
    const overlayRef1 = createMockOverlayRef({ pane: pane1 });
    const overlayRef2 = createMockOverlayRef({ pane: pane2 });
    mockCreate.mockReturnValueOnce(overlayRef1).mockReturnValueOnce(overlayRef2);
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    snackbarService.open({} as TemplateRef<unknown>, {
      viewContainerRef: fixture.componentInstance.vcr,
      maxVisibleSnackbars: Number.POSITIVE_INFINITY,
    });
    snackbarService.open({} as TemplateRef<unknown>, {
      viewContainerRef: fixture.componentInstance.vcr,
      maxVisibleSnackbars: Number.NaN,
    });
    await Promise.resolve();

    expect(pane1.hasAttribute('hidden')).toBe(false);
    expect(pane2.hasAttribute('hidden')).toBe(false);
  });

  it('keeps hidden snackbar auto-close lifecycle active', async () => {
    vi.useFakeTimers();
    const pane1 = document.createElement('div');
    const pane2 = document.createElement('div');
    const overlayRef1 = createMockOverlayRef({ pane: pane1 });
    const overlayRef2 = createMockOverlayRef({ pane: pane2 });
    mockCreate.mockReturnValueOnce(overlayRef1).mockReturnValueOnce(overlayRef2);
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    snackbarService.open({} as TemplateRef<unknown>, {
      viewContainerRef: fixture.componentInstance.vcr,
      duration: 100,
      maxVisibleSnackbars: 1,
    });
    snackbarService.open({} as TemplateRef<unknown>, {
      viewContainerRef: fixture.componentInstance.vcr,
      duration: 1000,
      maxVisibleSnackbars: 1,
    });
    await Promise.resolve();

    expect(pane1.hasAttribute('hidden')).toBe(true);
    vi.advanceTimersByTime(120);
    expect(overlayRef1.close).toHaveBeenCalled();
  });

  it('locks placement cap while queue is active and applies new cap after drain', async () => {
    const pane1 = document.createElement('div');
    const pane2 = document.createElement('div');
    const pane3 = document.createElement('div');
    const pane4 = document.createElement('div');
    const pane5 = document.createElement('div');
    const pane6 = document.createElement('div');
    const overlayRef1 = createMockOverlayRef({ pane: pane1 });
    const overlayRef2 = createMockOverlayRef({ pane: pane2 });
    const overlayRef3 = createMockOverlayRef({ pane: pane3 });
    const overlayRef4 = createMockOverlayRef({ pane: pane4 });
    const overlayRef5 = createMockOverlayRef({ pane: pane5 });
    const overlayRef6 = createMockOverlayRef({ pane: pane6 });
    mockCreate
      .mockReturnValueOnce(overlayRef1)
      .mockReturnValueOnce(overlayRef2)
      .mockReturnValueOnce(overlayRef3)
      .mockReturnValueOnce(overlayRef4)
      .mockReturnValueOnce(overlayRef5)
      .mockReturnValueOnce(overlayRef6);
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const vcr = fixture.componentInstance.vcr;

    const r1 = snackbarService.open({} as TemplateRef<unknown>, {
      viewContainerRef: vcr,
      maxVisibleSnackbars: 3,
    });
    const r2 = snackbarService.open({} as TemplateRef<unknown>, {
      viewContainerRef: vcr,
      maxVisibleSnackbars: 3,
    });
    const r3 = snackbarService.open({} as TemplateRef<unknown>, {
      viewContainerRef: vcr,
      maxVisibleSnackbars: 3,
    });
    const r4 = snackbarService.open({} as TemplateRef<unknown>, {
      viewContainerRef: vcr,
      maxVisibleSnackbars: 1,
    });
    await Promise.resolve();

    expect(pane1.hasAttribute('hidden')).toBe(true);
    expect(pane2.hasAttribute('hidden')).toBe(false);
    expect(pane3.hasAttribute('hidden')).toBe(false);
    expect(pane4.hasAttribute('hidden')).toBe(false);

    r1.close();
    r2.close();
    r3.close();
    r4.close();
    await Promise.resolve();

    snackbarService.open({} as TemplateRef<unknown>, {
      viewContainerRef: vcr,
      maxVisibleSnackbars: 1,
    });
    snackbarService.open({} as TemplateRef<unknown>, {
      viewContainerRef: vcr,
      maxVisibleSnackbars: 1,
    });
    await Promise.resolve();
    expect(pane5.hasAttribute('hidden')).toBe(true);
    expect(pane6.hasAttribute('hidden')).toBe(false);
  });

  it('handles manual close for hidden snackbar and keeps queue consistent', async () => {
    const pane1 = document.createElement('div');
    const pane2 = document.createElement('div');
    const overlayRef1 = createMockOverlayRef({ pane: pane1 });
    const overlayRef2 = createMockOverlayRef({ pane: pane2 });
    mockCreate.mockReturnValueOnce(overlayRef1).mockReturnValueOnce(overlayRef2);
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const ref1 = snackbarService.open({} as TemplateRef<unknown>, {
      viewContainerRef: fixture.componentInstance.vcr,
      maxVisibleSnackbars: 1,
    });
    snackbarService.open({} as TemplateRef<unknown>, {
      viewContainerRef: fixture.componentInstance.vcr,
      maxVisibleSnackbars: 1,
    });
    await Promise.resolve();

    expect(pane1.hasAttribute('hidden')).toBe(true);
    ref1.close();
    await Promise.resolve();
    expect(overlayRef1.close).toHaveBeenCalled();
    expect(pane2.hasAttribute('hidden')).toBe(false);
  });

  it('does not leave stale hidden state when an attach fails under cap', async () => {
    const pane1 = document.createElement('div');
    const pane2 = document.createElement('div');
    const failedAttachRef = createMockOverlayRef({ attachResolve: false, pane: pane1 });
    const successfulRef = createMockOverlayRef({ attachResolve: true, pane: pane2 });
    mockCreate.mockReturnValueOnce(failedAttachRef).mockReturnValueOnce(successfulRef);
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    snackbarService.open({} as TemplateRef<unknown>, {
      viewContainerRef: fixture.componentInstance.vcr,
      maxVisibleSnackbars: 1,
    });
    snackbarService.open({} as TemplateRef<unknown>, {
      viewContainerRef: fixture.componentInstance.vcr,
      maxVisibleSnackbars: 1,
    });
    await Promise.resolve();
    await Promise.resolve();

    expect(pane2.hasAttribute('hidden')).toBe(false);
  });

  it('auto-close progress updates and clears CSS progress on close', async () => {
    vi.useFakeTimers();
    const pane = document.createElement('div');
    const overlayRef = createMockOverlayRef({ pane });
    mockCreate.mockReturnValue(overlayRef);
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const ref = snackbarService.open({} as TemplateRef<unknown>, {
      viewContainerRef: fixture.componentInstance.vcr,
      duration: 1000,
      showProgress: true,
    });

    await Promise.resolve();

    let latestProgress = 0;
    ref.autoCloseState().subscribe((state) => {
      latestProgress = state.progress;
    });

    vi.advanceTimersByTime(500);

    expect(latestProgress).toBeLessThan(1);
    expect(latestProgress).toBeGreaterThan(0);
    expect(pane.style.getPropertyValue('--nxr-snackbar-progress')).not.toBe('');

    ref.close();

    expect(pane.style.getPropertyValue('--nxr-snackbar-progress')).toBe('');
  });

  it('pauseOnHover pauses and resumes auto-close countdown', async () => {
    vi.useFakeTimers();
    const pane = document.createElement('div');
    const overlayRef = createMockOverlayRef({ pane });
    mockCreate.mockReturnValue(overlayRef);
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const ref = snackbarService.open({} as TemplateRef<unknown>, {
      viewContainerRef: fixture.componentInstance.vcr,
      duration: 1000,
      pauseOnHover: true,
    });

    await Promise.resolve();

    let remainingMs = 0;
    ref.autoCloseState().subscribe((state) => {
      remainingMs = state.remainingMs;
    });

    vi.advanceTimersByTime(250);
    pane.dispatchEvent(new MouseEvent('mouseenter'));
    const pausedRemainingMs = remainingMs;

    vi.advanceTimersByTime(400);
    expect(Math.abs(remainingMs - pausedRemainingMs)).toBeLessThan(30);
    expect(overlayRef.close).not.toHaveBeenCalled();

    pane.dispatchEvent(new MouseEvent('mouseleave'));
    vi.advanceTimersByTime(1000);
    expect(overlayRef.close).toHaveBeenCalled();
  });

  it('does not pause on hover by default', async () => {
    vi.useFakeTimers();
    const pane = document.createElement('div');
    const overlayRef = createMockOverlayRef({ pane });
    mockCreate.mockReturnValue(overlayRef);
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    snackbarService.open({} as TemplateRef<unknown>, {
      viewContainerRef: fixture.componentInstance.vcr,
      duration: 200,
    });

    await Promise.resolve();

    pane.dispatchEvent(new MouseEvent('mouseenter'));
    vi.advanceTimersByTime(250);

    expect(overlayRef.close).toHaveBeenCalled();
  });

  it('does not schedule auto-close when duration is zero', async () => {
    vi.useFakeTimers();
    const pane = document.createElement('div');
    const overlayRef = createMockOverlayRef({ pane });
    mockCreate.mockReturnValue(overlayRef);
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const ref = snackbarService.open({} as TemplateRef<unknown>, {
      viewContainerRef: fixture.componentInstance.vcr,
      duration: 0,
      showProgress: true,
    });

    await Promise.resolve();
    vi.advanceTimersByTime(5000);

    let latestRemaining = -1;
    ref.autoCloseState().subscribe((state) => {
      latestRemaining = state.remainingMs;
    });
    expect(overlayRef.close).not.toHaveBeenCalled();
    expect(latestRemaining).toBe(0);
    expect(pane.style.getPropertyValue('--nxr-snackbar-progress')).toBe('');
  });

  it('does not schedule auto-close when duration is negative', async () => {
    vi.useFakeTimers();
    const overlayRef = createMockOverlayRef();
    mockCreate.mockReturnValue(overlayRef);
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    snackbarService.open({} as TemplateRef<unknown>, {
      viewContainerRef: fixture.componentInstance.vcr,
      duration: -1,
      showProgress: true,
    });

    await Promise.resolve();
    vi.advanceTimersByTime(5000);
    expect(overlayRef.close).not.toHaveBeenCalled();
  });

  it('is safe when pane element is unavailable with hover/progress options', async () => {
    vi.useFakeTimers();
    const overlayRef = createMockOverlayRef({ pane: null });
    mockCreate.mockReturnValue(overlayRef);
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    snackbarService.open({} as TemplateRef<unknown>, {
      viewContainerRef: fixture.componentInstance.vcr,
      duration: 200,
      showProgress: true,
      pauseOnHover: true,
    });

    await Promise.resolve();
    vi.advanceTimersByTime(250);
    expect(overlayRef.close).toHaveBeenCalled();
  });
});

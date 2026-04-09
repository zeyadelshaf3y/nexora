import { Component, type TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { OverlayService, type CloseReason, type OverlayRef } from '@nexora-ui/overlay';
import { Subject, type Observable } from 'rxjs';
import { vi } from 'vitest';

import { SnackbarService } from './snackbar.service';

@Component({
  standalone: true,
  template: '<ng-container #vc></ng-container>',
})
class HostComponent {
  @ViewChild('vc', { read: ViewContainerRef }) vcr!: ViewContainerRef;
}

function createMockOverlayRef(attachResolve = true): OverlayRef {
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
    getPaneElement: vi.fn(() => null) as OverlayRef['getPaneElement'],
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

  beforeEach(() => {
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
      ],
    });
    snackbarService = TestBed.inject(SnackbarService);
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
    const failedAttachRef = createMockOverlayRef(false);
    const successfulRef = createMockOverlayRef(true);
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
});

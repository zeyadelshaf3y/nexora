import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { attachDrawerDragController, detachDrawerDragController } from './drawer-drag-controller';
import { DrawerDragHandleDirective } from './drawer-drag-handle.directive';

@Component({
  standalone: true,
  imports: [DrawerDragHandleDirective],
  template: `<div data-nxr-overlay="pane" data-placement="drawer-end">
    <div nxrDrawerDragHandle class="handle"></div>
  </div>`,
})
class DrawerDragHandleHostComponent {}

describe('DrawerDragHandleDirective', () => {
  afterEach(() => {
    document.querySelectorAll('[data-nxr-overlay="pane"]').forEach((pane) => {
      detachDrawerDragController(pane as HTMLElement);
    });
  });

  it('registers handle with drawer drag controller when dragToClose is enabled', async () => {
    TestBed.configureTestingModule({ imports: [DrawerDragHandleHostComponent] });
    const fixture = TestBed.createComponent(DrawerDragHandleHostComponent);
    const pane = fixture.nativeElement.querySelector('[data-nxr-overlay="pane"]') as HTMLElement;

    attachDrawerDragController({ close: vi.fn() } as never, pane, null, {
      threshold: 0.25,
      minVelocity: 0.4,
      dragFrom: 'handle',
    });

    fixture.detectChanges();
    await fixture.whenStable();

    const handle = fixture.nativeElement.querySelector('.handle') as HTMLElement;
    expect(handle.style.touchAction).toBe('none');
    expect(handle.getAttribute('data-nxr-drawer-drag-edge')).toBe('inline-start');
  });

  it('is inert when no drag controller is attached', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    TestBed.configureTestingModule({ imports: [DrawerDragHandleHostComponent] });
    const fixture = TestBed.createComponent(DrawerDragHandleHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});

import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { CLOSE_REASON_PROGRAMMATIC, type CloseReason } from '../ref/close-reason';

import { CloseDialogDirective } from './close-dialog.directive';
import { CloseDrawerDirective } from './close-drawer.directive';
import { registerCloseableRef, unregisterCloseableRef } from './closeable-ref-registry';

@Component({
  standalone: true,
  imports: [CloseDialogDirective],
  template: '<div data-nxr-overlay="pane"><button nxrDialogClose>Close</button></div>',
})
class DialogCloseHostComponent {}

@Component({
  standalone: true,
  imports: [CloseDialogDirective],
  template: `<div data-nxr-overlay="pane"><button [nxrDialogClose]="reason">Close</button></div>`,
})
class DialogCloseWithReasonHostComponent {
  reason: CloseReason = 'backdrop';
}

@Component({
  standalone: true,
  imports: [CloseDrawerDirective],
  template: `<div data-nxr-overlay="pane"><button nxrDrawerClose>Close</button></div>`,
})
class DrawerCloseHostComponent {}

describe('CloseDialogDirective', () => {
  it('should call ref.close with programmatic when no reason input', () => {
    const closeSpy = vi.fn();
    TestBed.configureTestingModule({
      imports: [CloseDialogDirective],
    });
    const fixture = TestBed.createComponent(DialogCloseHostComponent);
    fixture.detectChanges();
    const pane = fixture.nativeElement.querySelector('[data-nxr-overlay="pane"]') as HTMLElement;
    registerCloseableRef(pane, { close: closeSpy });
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    expect(closeSpy).toHaveBeenCalledWith(CLOSE_REASON_PROGRAMMATIC);
  });

  afterEach(() => {
    const panes = document.querySelectorAll('[data-nxr-overlay="pane"]');
    panes.forEach((p) => unregisterCloseableRef(p as HTMLElement));
  });
});

describe('CloseDrawerDirective', () => {
  it('should call ref.close with programmatic when clicked', () => {
    const closeSpy = vi.fn();
    TestBed.configureTestingModule({
      imports: [CloseDrawerDirective],
    });
    const fixture = TestBed.createComponent(DrawerCloseHostComponent);
    fixture.detectChanges();
    const pane = fixture.nativeElement.querySelector('[data-nxr-overlay="pane"]') as HTMLElement;
    registerCloseableRef(pane, { close: closeSpy });
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    expect(closeSpy).toHaveBeenCalledWith(CLOSE_REASON_PROGRAMMATIC);
  });

  afterEach(() => {
    const panes = document.querySelectorAll('[data-nxr-overlay="pane"]');
    panes.forEach((p) => unregisterCloseableRef(p as HTMLElement));
  });
});

describe('Close directive with reason input', () => {
  it('should call ref.close with the bound reason', () => {
    const closeSpy = vi.fn();
    TestBed.configureTestingModule({
      imports: [CloseDialogDirective],
    });
    const fixture = TestBed.createComponent(DialogCloseWithReasonHostComponent);
    fixture.detectChanges();
    const pane = fixture.nativeElement.querySelector('[data-nxr-overlay="pane"]') as HTMLElement;
    registerCloseableRef(pane, { close: closeSpy });
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    expect(closeSpy).toHaveBeenCalledWith('backdrop');
  });

  afterEach(() => {
    const panes = document.querySelectorAll('[data-nxr-overlay="pane"]');
    panes.forEach((p) => unregisterCloseableRef(p as HTMLElement));
  });
});

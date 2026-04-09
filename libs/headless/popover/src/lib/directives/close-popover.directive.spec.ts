import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CLOSE_REASON_PROGRAMMATIC } from '@nexora-ui/overlay';
import { registerCloseableRef, unregisterCloseableRef } from '@nexora-ui/overlay/internal';
import { vi } from 'vitest';

import { ClosePopoverDirective } from './close-popover.directive';

@Component({
  standalone: true,
  imports: [ClosePopoverDirective],
  template: '<div data-nxr-overlay="pane"><button nxrPopoverClose>Close</button></div>',
})
class PopoverCloseHostComponent {}

@Component({
  standalone: true,
  imports: [ClosePopoverDirective],
  template: '<div data-nxr-overlay="pane"><button [nxrPopoverClose]="reason">Close</button></div>',
})
class PopoverCloseWithReasonHostComponent {
  reason: 'backdrop' | 'escape' | 'outside' | 'programmatic' = 'escape';
}

describe('ClosePopoverDirective', () => {
  it('should call ref.close with programmatic when no reason input', () => {
    const closeSpy = vi.fn();
    TestBed.configureTestingModule({
      imports: [ClosePopoverDirective],
    });
    const fixture = TestBed.createComponent(PopoverCloseHostComponent);
    fixture.detectChanges();
    const pane = fixture.nativeElement.querySelector('[data-nxr-overlay="pane"]') as HTMLElement;
    registerCloseableRef(pane, { close: closeSpy });
    const button = fixture.nativeElement.querySelector('button');
    button?.click();
    expect(closeSpy).toHaveBeenCalledWith(CLOSE_REASON_PROGRAMMATIC);
  });

  it('should call ref.close with bound reason when nxrPopoverClose input is set', () => {
    const closeSpy = vi.fn();
    TestBed.configureTestingModule({
      imports: [ClosePopoverDirective],
    });
    const fixture = TestBed.createComponent(PopoverCloseWithReasonHostComponent);
    fixture.detectChanges();
    const pane = fixture.nativeElement.querySelector('[data-nxr-overlay="pane"]') as HTMLElement;
    registerCloseableRef(pane, { close: closeSpy });
    const button = fixture.nativeElement.querySelector('button');
    button?.click();
    expect(closeSpy).toHaveBeenCalledWith('escape');
  });

  afterEach(() => {
    const panes = document.querySelectorAll('[data-nxr-overlay="pane"]');
    panes.forEach((p) => unregisterCloseableRef(p as HTMLElement));
  });
});

import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { CloseSnackbarDirective } from './close-snackbar.directive';

@Component({
  standalone: true,
  imports: [CloseSnackbarDirective],
  template: '<button nxrSnackbarClose>Dismiss</button>',
})
class HostWithoutPane {}

describe('CloseSnackbarDirective', () => {
  it('should create without an overlay pane (no-op on click)', () => {
    const fixture = TestBed.createComponent(HostWithoutPane);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn).toBeTruthy();
    expect(() => btn.click()).not.toThrow();
  });
});

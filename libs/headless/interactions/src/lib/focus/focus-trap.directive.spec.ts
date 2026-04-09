import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { FocusTrapDirective } from './focus-trap.directive';

@Component({
  standalone: true,
  imports: [FocusTrapDirective],
  template: `
    <div nxrFocusTrap [nxrFocusTrapEnabled]="enabled()">
      <button id="first">First</button>
      <input id="middle" />
      <button id="last">Last</button>
    </div>
  `,
})
class TestHostComponent {
  readonly enabled = signal(true);
}

@Component({
  standalone: true,
  imports: [FocusTrapDirective],
  template: `
    <div nxrFocusTrap>
      <span>No focusable elements</span>
    </div>
  `,
})
class NoFocusablesComponent {
  /** Used only as a host for focus-trap test with no focusable elements. */
  readonly _host = true;
}

function tabKeydown(shiftKey = false): KeyboardEvent {
  return new KeyboardEvent('keydown', { key: 'Tab', shiftKey, bubbles: true });
}

describe('FocusTrapDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let first: HTMLButtonElement;
  let middle: HTMLInputElement;
  let last: HTMLButtonElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    first = fixture.nativeElement.querySelector('#first');
    middle = fixture.nativeElement.querySelector('#middle');
    last = fixture.nativeElement.querySelector('#last');
  });

  it('wraps focus from last to first on Tab', () => {
    last.focus();
    expect(document.activeElement).toBe(last);

    last.dispatchEvent(tabKeydown());
    expect(document.activeElement).toBe(first);
  });

  it('wraps focus from first to last on Shift+Tab', () => {
    first.focus();
    expect(document.activeElement).toBe(first);

    first.dispatchEvent(tabKeydown(true));
    expect(document.activeElement).toBe(last);
  });

  it('does not wrap when focus is on a middle element', () => {
    middle.focus();
    expect(document.activeElement).toBe(middle);

    middle.dispatchEvent(tabKeydown());
    expect(document.activeElement).toBe(middle);
  });

  it('does not trap when disabled', () => {
    fixture.componentInstance.enabled.set(false);
    fixture.detectChanges();

    last.focus();
    last.dispatchEvent(tabKeydown());
    expect(document.activeElement).toBe(last);
  });

  it('handles container with no focusable elements', () => {
    const noFocusFixture = TestBed.createComponent(NoFocusablesComponent);
    noFocusFixture.detectChanges();

    const container = noFocusFixture.nativeElement.querySelector('[nxrFocusTrap]');
    expect(() => container.dispatchEvent(tabKeydown())).not.toThrow();
  });
});

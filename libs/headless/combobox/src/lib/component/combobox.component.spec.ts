import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';

import { ComboboxComponent } from './combobox.component';
import {
  COMBOBOX_SPEC_HOST_IMPORTS,
  ComboboxBeforeOpenHostComponent,
  ComboboxClosedReasonHostComponent,
  ComboboxFormHostComponent,
  ComboboxHostComponent,
  ComboboxMultiHostComponent,
  ComboboxVirtualMultiSelectedIndexHostComponent,
  ComboboxVirtualTrackKeyHostComponent,
} from './combobox.component.spec-helpers';

/** Lets close animation / overlay microtasks settle (matches prior `setTimeout(0)` pattern). */
async function settleAfterStable(fixture: ComponentFixture<unknown>): Promise<void> {
  await fixture.whenStable();
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  fixture.detectChanges();
}

describe('ComboboxComponent', () => {
  let fixture: ComponentFixture<ComboboxHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [...COMBOBOX_SPEC_HOST_IMPORTS],
    }).compileComponents();

    fixture = TestBed.createComponent(ComboboxHostComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('defaults virtualTrackKeyFn to accessors.value when virtualTrackByKey is unset', () => {
    const vFixture = TestBed.createComponent(ComboboxVirtualTrackKeyHostComponent);
    vFixture.detectChanges();
    const comboDbg = vFixture.debugElement.query(By.directive(ComboboxComponent));
    expect(comboDbg).toBeTruthy();
    const combo = comboDbg.componentInstance as ComboboxComponent<{ id: number; name: string }>;
    const items = combo.virtualItems();
    expect(items != null && items.length > 0).toBe(true);
    const keyFn = combo.virtualTrackKeyFn();
    const clone = { id: 10, name: 'Other' };
    if (items != null && items.length > 0) {
      expect(keyFn(items[0])).toBe(10);
    }
    expect(keyFn(clone)).toBe(10);
  });

  it('virtualSelectedIndex in multi mode is first list index matching any selected value', () => {
    const vFixture = TestBed.createComponent(ComboboxVirtualMultiSelectedIndexHostComponent);
    vFixture.detectChanges();
    const comboDbg = vFixture.debugElement.query(By.directive(ComboboxComponent));
    expect(comboDbg).toBeTruthy();
    const combo = comboDbg.componentInstance as ComboboxComponent<{ id: number; name: string }>;
    expect(combo.virtualSelectedIndex()).toBe(0);
  });

  it('normalizes null to [] in multi writeValue', () => {
    const multiFixture = TestBed.createComponent(ComboboxMultiHostComponent);
    const host = multiFixture.componentInstance;
    multiFixture.detectChanges();

    host.comboRef().writeValue(null);
    multiFixture.detectChanges();

    expect(host.comboRef().value()).toEqual([]);
  });

  it('uses latest beforeOpen callback value across opens', async () => {
    const beforeFixture = TestBed.createComponent(ComboboxBeforeOpenHostComponent);
    const host = beforeFixture.componentInstance;
    beforeFixture.detectChanges();

    let opened = await host.comboRef().open();
    expect(opened).toBe(false);
    expect(host.comboRef().isOpen()).toBe(false);

    host.allowOpen.set(true);
    beforeFixture.detectChanges();

    opened = await host.comboRef().open();
    await beforeFixture.whenStable();
    beforeFixture.detectChanges();
    expect(opened).toBe(true);
    expect(host.comboRef().isOpen()).toBe(true);
  });

  it('does not open on Space key when input is closed', () => {
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    const preventSpy = vi.spyOn(event, 'preventDefault');

    input.dispatchEvent(event);
    fixture.detectChanges();

    const combo = fixture.debugElement.children[0].componentInstance as ComboboxComponent<unknown>;
    expect(combo.isOpen()).toBe(false);
    expect(preventSpy).not.toHaveBeenCalled();
  });

  it('marks form control as touched on input blur when panel is closed', () => {
    const formFixture = TestBed.createComponent(ComboboxFormHostComponent);
    formFixture.detectChanges();
    const host = formFixture.componentInstance;
    const input = formFixture.nativeElement.querySelector('input') as HTMLInputElement;

    expect(host.control.touched).toBe(false);
    input.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
    formFixture.detectChanges();

    expect(host.control.touched).toBe(true);
  });

  it('emits "programmatic" when closed via API', async () => {
    const closedFixture = TestBed.createComponent(ComboboxClosedReasonHostComponent);
    const host = closedFixture.componentInstance;
    closedFixture.detectChanges();

    const opened = await host.comboRef().open();
    closedFixture.detectChanges();
    await settleAfterStable(closedFixture);
    expect(opened).toBe(true);
    expect(host.comboRef().isOpen()).toBe(true);

    host.comboRef().close();
    closedFixture.detectChanges();
    await settleAfterStable(closedFixture);

    expect(host.lastCloseReason).toBe('programmatic');
  });

  it('disable() closes panel when open', async () => {
    const closedFixture = TestBed.createComponent(ComboboxClosedReasonHostComponent);
    const host = closedFixture.componentInstance;
    closedFixture.detectChanges();

    expect(await host.comboRef().open()).toBe(true);
    closedFixture.detectChanges();
    await settleAfterStable(closedFixture);
    expect(host.comboRef().isOpen()).toBe(true);

    host.comboRef().disable();
    closedFixture.detectChanges();
    await settleAfterStable(closedFixture);

    expect(host.comboRef().isOpen()).toBe(false);
    expect(host.lastCloseReason).toBe('programmatic');
    expect(host.comboRef().isDisabled()).toBe(true);
  });
});

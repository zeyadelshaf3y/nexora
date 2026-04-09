import { type ComponentFixture, TestBed } from '@angular/core/testing';

import {
  BasicSelectHost,
  ClosedReasonHost,
  FRUITS,
  MultiSelectHost,
  OutputSelectHost,
  PanelClassSelectHost,
  RequiredSelectHost,
  VirtualMultiVirtualIndexSelectHost,
  VirtualTrackSelectHost,
  closeByEscape,
  flushMicrotasks,
  getListbox,
  getOptions,
  getTrigger,
  openSelect,
  settleOverlayClose,
} from './select.component.spec-helpers';

describe('SelectComponent', () => {
  describe('open() return value', () => {
    let fixture: ComponentFixture<BasicSelectHost>;
    let host: BasicSelectHost;

    beforeEach(async () => {
      TestBed.configureTestingModule({ imports: [BasicSelectHost] });
      fixture = TestBed.createComponent(BasicSelectHost);
      host = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should return true when open succeeds', async () => {
      const result = await host.selectRef().open();
      fixture.detectChanges();
      expect(result).toBe(true);
      expect(host.selectRef().isOpen()).toBe(true);
    });

    it('should return false when disabled', async () => {
      host.isDisabled.set(true);
      fixture.detectChanges();
      const result = await host.selectRef().open();
      expect(result).toBe(false);
      expect(host.selectRef().isOpen()).toBe(false);
    });
  });

  describe('opened and closed outputs', () => {
    let fixture: ComponentFixture<OutputSelectHost>;

    beforeEach(async () => {
      TestBed.configureTestingModule({ imports: [OutputSelectHost] });
      fixture = TestBed.createComponent(OutputSelectHost);
      fixture.detectChanges();
    });

    it('should emit opened when panel opens', async () => {
      const host = fixture.componentInstance;
      await openSelect(fixture);
      expect(host.openCount).toBe(1);
    });

    it('should emit closed when panel closes', async () => {
      const host = fixture.componentInstance;
      await openSelect(fixture);
      await closeByEscape(fixture);
      expect(host.closeCount).toBe(1);
    });
  });

  describe('closed output reason', () => {
    it('should emit "selection" when closed by single selection', async () => {
      TestBed.configureTestingModule({ imports: [ClosedReasonHost] });
      const fixture = TestBed.createComponent(ClosedReasonHost);
      fixture.detectChanges();
      await openSelect(fixture);
      getOptions()[1].click();
      await settleOverlayClose(fixture);
      expect(fixture.componentInstance.lastCloseReason).toBe('selection');
    });

    it('should emit "escape" when closed by Escape key', async () => {
      TestBed.configureTestingModule({ imports: [ClosedReasonHost] });
      const fixture = TestBed.createComponent(ClosedReasonHost);
      fixture.detectChanges();
      await openSelect(fixture);
      await closeByEscape(fixture);
      expect(fixture.componentInstance.lastCloseReason).toBe('escape');
    });

    it('should emit "programmatic" when closed via API', async () => {
      TestBed.configureTestingModule({ imports: [ClosedReasonHost] });
      const fixture = TestBed.createComponent(ClosedReasonHost);
      fixture.detectChanges();
      await openSelect(fixture);
      fixture.componentInstance.selectRef().close();
      await settleOverlayClose(fixture);
      expect(fixture.componentInstance.lastCloseReason).toBe('programmatic');
    });
  });

  describe('panelClass', () => {
    let fixture: ComponentFixture<PanelClassSelectHost>;

    beforeEach(async () => {
      TestBed.configureTestingModule({ imports: [PanelClassSelectHost] });
      fixture = TestBed.createComponent(PanelClassSelectHost);
      fixture.detectChanges();
    });

    it('should apply panelClass to the overlay pane', async () => {
      await openSelect(fixture);
      const pane = document.querySelector('.nxr-select-pane');
      expect(pane).toBeTruthy();
      expect(pane?.classList.contains('my-custom-panel')).toBe(true);
    });
  });

  describe('programmatic open/close', () => {
    let fixture: ComponentFixture<BasicSelectHost>;
    let host: BasicSelectHost;

    beforeEach(async () => {
      TestBed.configureTestingModule({ imports: [BasicSelectHost] });
      fixture = TestBed.createComponent(BasicSelectHost);
      host = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should open and close via component ref', async () => {
      await host.selectRef().open();
      fixture.detectChanges();
      await flushMicrotasks();
      fixture.detectChanges();
      expect(host.selectRef().isOpen()).toBe(true);
      expect(getListbox()).toBeTruthy();

      host.selectRef().close();
      fixture.detectChanges();
      await flushMicrotasks();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(host.selectRef().isOpen()).toBe(false);
    });
  });

  describe('reset()', () => {
    it('should clear single selection and update display', async () => {
      TestBed.configureTestingModule({ imports: [BasicSelectHost] });
      const fixture = TestBed.createComponent(BasicSelectHost);
      const host = fixture.componentInstance;
      fixture.detectChanges();
      host.selected.set(FRUITS[1]);
      fixture.detectChanges();
      expect(host.selectRef().displayValue()).toBe('Banana');

      host.selectRef().reset();
      fixture.detectChanges();
      expect(host.selected()).toBeNull();
      expect(host.selectRef().displayValue()).toBe('Pick a fruit');
    });

    it('should clear multi selection', async () => {
      TestBed.configureTestingModule({ imports: [MultiSelectHost] });
      const fixture = TestBed.createComponent(MultiSelectHost);
      const host = fixture.componentInstance;
      fixture.detectChanges();
      host.selected.set([FRUITS[0], FRUITS[1]]);
      fixture.detectChanges();

      host.selectRef().reset();
      fixture.detectChanges();
      expect(host.selected().length).toBe(0);
    });

    it('should close panel when open', async () => {
      TestBed.configureTestingModule({ imports: [BasicSelectHost] });
      const fixture = TestBed.createComponent(BasicSelectHost);
      const host = fixture.componentInstance;
      fixture.detectChanges();
      await openSelect(fixture);
      expect(host.selectRef().isOpen()).toBe(true);

      host.selectRef().reset();
      await settleOverlayClose(fixture);
      expect(host.selectRef().isOpen()).toBe(false);
    });
  });

  describe('focusTrigger()', () => {
    it('should focus the trigger element', async () => {
      TestBed.configureTestingModule({ imports: [BasicSelectHost] });
      const fixture = TestBed.createComponent(BasicSelectHost);
      fixture.detectChanges();
      const trigger = getTrigger(fixture);
      (document.activeElement as HTMLElement)?.blur();
      expect(document.activeElement).not.toBe(trigger);

      const host = fixture.componentInstance;
      host.selectRef().focusTrigger();
      fixture.detectChanges();
      expect(document.activeElement).toBe(trigger);
    });
  });

  describe('double-open guard', () => {
    it('should not open twice when open() is called concurrently', async () => {
      TestBed.configureTestingModule({ imports: [BasicSelectHost] });
      const fixture = TestBed.createComponent(BasicSelectHost);
      const host = fixture.componentInstance;
      fixture.detectChanges();

      const p1 = host.selectRef().open();
      const p2 = host.selectRef().open();
      const [r1, r2] = await Promise.all([p1, p2]);

      expect(r1).toBe(true);
      expect(r2).toBe(false);
      expect(host.selectRef().isOpen()).toBe(true);
      const listboxes = document.querySelectorAll('[role="listbox"]');
      expect(listboxes.length).toBe(1);
    });
  });

  describe('required', () => {
    it('should set aria-required when required is true', () => {
      TestBed.configureTestingModule({ imports: [RequiredSelectHost] });
      const fixture = TestBed.createComponent(RequiredSelectHost);
      fixture.detectChanges();
      expect(getTrigger(fixture).getAttribute('aria-required')).toBe('true');
    });

    it('should not set aria-required when required is false', () => {
      TestBed.configureTestingModule({ imports: [BasicSelectHost] });
      const fixture = TestBed.createComponent(BasicSelectHost);
      fixture.detectChanges();
      expect(getTrigger(fixture).getAttribute('aria-required')).toBeNull();
    });
  });

  describe('virtualScroll track key', () => {
    it('defaults virtualTrackKeyFn to accessors.value when virtualTrackByKey is unset', () => {
      TestBed.configureTestingModule({ imports: [VirtualTrackSelectHost] });
      const fixture = TestBed.createComponent(VirtualTrackSelectHost);
      fixture.detectChanges();
      const sel = fixture.componentInstance.selectRef();
      const items = sel.virtualItems();
      expect(items != null && items.length > 0).toBe(true);
      const keyFn = sel.virtualTrackKeyFn();
      const clone = { id: 7, name: 'X' };
      if (items != null && items.length > 0) {
        expect(keyFn(items[0])).toBe(7);
      }
      expect(keyFn(clone)).toBe(7);
    });

    it('virtualSelectedIndex in multi mode is first list index matching any selected value', () => {
      TestBed.configureTestingModule({ imports: [VirtualMultiVirtualIndexSelectHost] });
      const fixture = TestBed.createComponent(VirtualMultiVirtualIndexSelectHost);
      fixture.detectChanges();
      expect(fixture.componentInstance.selectRef().virtualSelectedIndex()).toBe(0);
    });
  });
});

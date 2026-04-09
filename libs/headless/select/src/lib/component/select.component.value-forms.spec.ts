import { type ComponentFixture, TestBed } from '@angular/core/testing';

import type { SelectComponent } from './select.component';
import {
  BasicSelectHost,
  BeforeOpenSelectHost,
  CompareWithSelectHost,
  FormControlSelectHost,
  FRUITS,
  GroupedSelectHost,
  MultiSelectHost,
  closeByEscape,
  getListbox,
  getOptions,
  openSelect,
  settleOverlayClose,
} from './select.component.spec-helpers';

describe('SelectComponent', () => {
  describe('displayValue', () => {
    let fixture: ComponentFixture<BasicSelectHost>;
    let host: BasicSelectHost;

    beforeEach(async () => {
      TestBed.configureTestingModule({ imports: [BasicSelectHost] });
      fixture = TestBed.createComponent(BasicSelectHost);
      host = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should show placeholder when value is null', () => {
      expect(host.selectRef().displayValue()).toBe('Pick a fruit');
    });

    it('should show label when value is set', () => {
      host.selected.set(FRUITS[0]);
      fixture.detectChanges();
      expect(host.selectRef().displayValue()).toBe('Apple');
    });
  });

  describe('hasValue and selectedValues', () => {
    it('single: hasValue is false when null, true when set', () => {
      TestBed.configureTestingModule({ imports: [BasicSelectHost] });
      const fixture = TestBed.createComponent(BasicSelectHost);
      const host = fixture.componentInstance;
      fixture.detectChanges();
      expect(host.selectRef().hasValue()).toBe(false);
      host.selected.set(FRUITS[0]);
      fixture.detectChanges();
      expect(host.selectRef().hasValue()).toBe(true);
    });

    it('single: selectedValues returns [] when null, [value] when set', () => {
      TestBed.configureTestingModule({ imports: [BasicSelectHost] });
      const fixture = TestBed.createComponent(BasicSelectHost);
      const host = fixture.componentInstance;
      fixture.detectChanges();
      expect(host.selectRef().selectedValues()).toEqual([]);
      host.selected.set(FRUITS[1]);
      fixture.detectChanges();
      expect(host.selectRef().selectedValues()).toEqual([FRUITS[1]]);
    });

    it('multi: hasValue is false when empty array, true when length > 0', () => {
      TestBed.configureTestingModule({ imports: [MultiSelectHost] });
      const fixture = TestBed.createComponent(MultiSelectHost);
      const host = fixture.componentInstance;
      fixture.detectChanges();
      expect(host.selectRef().hasValue()).toBe(false);
      host.selected.set([FRUITS[0]]);
      fixture.detectChanges();
      expect(host.selectRef().hasValue()).toBe(true);
    });

    it('multi: selectedValues returns value array', () => {
      TestBed.configureTestingModule({ imports: [MultiSelectHost] });
      const fixture = TestBed.createComponent(MultiSelectHost);
      const host = fixture.componentInstance;
      host.selected.set([FRUITS[0], FRUITS[2]]);
      fixture.detectChanges();
      expect(host.selectRef().selectedValues()).toEqual([FRUITS[0], FRUITS[2]]);
    });
  });

  describe('multi-select', () => {
    let fixture: ComponentFixture<MultiSelectHost>;
    let host: MultiSelectHost;

    beforeEach(async () => {
      TestBed.configureTestingModule({ imports: [MultiSelectHost] });
      fixture = TestBed.createComponent(MultiSelectHost);
      host = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should stay open after selection in multi mode', async () => {
      await openSelect(fixture);
      getOptions()[0].click();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(getListbox()).toBeTruthy();
    });

    it('should support multiple selections', async () => {
      await openSelect(fixture);
      getOptions()[0].click();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      getOptions()[2].click();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(host.selected().length).toBe(2);
    });
  });

  describe('CVA / FormControl', () => {
    let fixture: ComponentFixture<FormControlSelectHost>;
    let host: FormControlSelectHost;

    beforeEach(async () => {
      TestBed.configureTestingModule({ imports: [FormControlSelectHost] });
      fixture = TestBed.createComponent(FormControlSelectHost);
      host = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should write value from FormControl', () => {
      host.control.setValue(FRUITS[1]);
      fixture.detectChanges();
      const sel = fixture.debugElement.children[0].componentInstance as SelectComponent;
      expect(sel.value()).toEqual(FRUITS[1]);
    });

    it('should update FormControl on selection', async () => {
      await openSelect(fixture);
      getOptions()[0].click();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(host.control.value?.name).toBe('Apple');
    });

    it('should mark FormControl as touched on panel close', async () => {
      expect(host.control.touched).toBe(false);
      await openSelect(fixture);
      await closeByEscape(fixture);
      expect(host.control.touched).toBe(true);
    });

    it('should respect FormControl disabled state', () => {
      host.control.disable();
      fixture.detectChanges();
      const sel = fixture.debugElement.children[0].componentInstance as SelectComponent;
      expect(sel.isDisabled()).toBe(true);
    });
  });

  describe('CVA normalization', () => {
    it('normalizes null to [] in multi writeValue', () => {
      TestBed.configureTestingModule({ imports: [MultiSelectHost] });
      const fixture = TestBed.createComponent(MultiSelectHost);
      const host = fixture.componentInstance;
      fixture.detectChanges();

      host.selectRef().writeValue(null);
      fixture.detectChanges();

      expect(host.selectRef().value()).toEqual([]);
    });
  });

  describe('reactive beforeOpen', () => {
    it('uses latest beforeOpen callback value across opens', async () => {
      TestBed.configureTestingModule({ imports: [BeforeOpenSelectHost] });
      const fixture = TestBed.createComponent(BeforeOpenSelectHost);
      const host = fixture.componentInstance;
      fixture.detectChanges();

      let opened = await host.selectRef().open();
      expect(opened).toBe(false);
      expect(host.selectRef().isOpen()).toBe(false);

      host.allowOpen.set(true);
      fixture.detectChanges();

      opened = await host.selectRef().open();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(opened).toBe(true);
      expect(host.selectRef().isOpen()).toBe(true);
    });
  });

  describe('grouped options', () => {
    let fixture: ComponentFixture<GroupedSelectHost>;

    beforeEach(async () => {
      TestBed.configureTestingModule({ imports: [GroupedSelectHost] });
      fixture = TestBed.createComponent(GroupedSelectHost);
      fixture.detectChanges();
    });

    it('should render grouped options with separator', async () => {
      await openSelect(fixture);
      expect(getOptions().length).toBe(4);
      expect(document.querySelector('[role="separator"]')).toBeTruthy();
    });
  });

  describe('compareWith', () => {
    let fixture: ComponentFixture<CompareWithSelectHost>;
    let host: CompareWithSelectHost;

    beforeEach(async () => {
      TestBed.configureTestingModule({ imports: [CompareWithSelectHost] });
      fixture = TestBed.createComponent(CompareWithSelectHost);
      host = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should match value by custom comparator', async () => {
      host.selected.set({ id: 2, name: 'Banana (old ref)' });
      fixture.detectChanges();

      await openSelect(fixture);
      const options = getOptions();
      expect(options[1].getAttribute('aria-selected')).toBe('true');
    });
  });

  describe('isSelected', () => {
    let fixture: ComponentFixture<BasicSelectHost>;
    let host: BasicSelectHost;

    beforeEach(async () => {
      TestBed.configureTestingModule({ imports: [BasicSelectHost] });
      fixture = TestBed.createComponent(BasicSelectHost);
      host = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should return false when panel is closed', () => {
      expect(host.selectRef().isSelected(FRUITS[0])).toBe(false);
    });

    it('should return true for selected item when panel is open', async () => {
      await openSelect(fixture);
      getOptions()[0].click();
      await settleOverlayClose(fixture);

      // Re-open to check isSelected
      await openSelect(fixture);
      expect(host.selectRef().isSelected(FRUITS[0])).toBe(true);
      expect(host.selectRef().isSelected(FRUITS[1])).toBe(false);
    });
  });
});

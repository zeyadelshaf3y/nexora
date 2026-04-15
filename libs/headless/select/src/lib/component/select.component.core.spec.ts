import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideOverlayDefaults } from '@nexora-ui/overlay';

import {
  BackdropDefaultsPrecedenceSelectHost,
  BasicSelectHost,
  closeByEscape,
  flushMicrotasks,
  getListbox,
  getOptions,
  getTrigger,
  openSelect,
  settleOverlayClose,
} from './select.component.spec-helpers';
import { provideSelectDefaults } from './select-defaults.config';

describe('SelectComponent', () => {
  describe('open and close', () => {
    let fixture: ComponentFixture<BasicSelectHost>;
    let host: BasicSelectHost;

    beforeEach(async () => {
      TestBed.configureTestingModule({ imports: [BasicSelectHost] });
      fixture = TestBed.createComponent(BasicSelectHost);
      host = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should render trigger with placeholder when no value is selected', () => {
      expect(getTrigger(fixture).textContent?.trim()).toBe('Pick a fruit');
    });

    it('should open panel on trigger click', async () => {
      await openSelect(fixture);
      expect(host.selectRef().isOpen()).toBe(true);
      expect(getListbox()).toBeTruthy();
    });

    it('should render options inside overlay', async () => {
      await openSelect(fixture);
      const options = getOptions();
      expect(options.length).toBe(3);
      expect(options[0].textContent?.trim()).toBe('Apple');
    });

    it('should close panel on Escape', async () => {
      await openSelect(fixture);
      await closeByEscape(fixture);
      expect(host.selectRef().isOpen()).toBe(false);
      expect(getListbox()).toBeFalsy();
    });

    it('should close panel after single selection', async () => {
      await openSelect(fixture);
      getOptions()[1].click();
      await settleOverlayClose(fixture);

      expect(host.selected()?.name).toBe('Banana');
      expect(host.selectRef().isOpen()).toBe(false);
    });

    it('should focus trigger after close', async () => {
      await openSelect(fixture);
      await closeByEscape(fixture);
      expect(document.activeElement).toBe(getTrigger(fixture));
    });
  });

  describe('ARIA attributes', () => {
    let fixture: ComponentFixture<BasicSelectHost>;

    beforeEach(async () => {
      TestBed.configureTestingModule({ imports: [BasicSelectHost] });
      fixture = TestBed.createComponent(BasicSelectHost);
      fixture.detectChanges();
    });

    it('should set aria-haspopup="listbox" on trigger', () => {
      expect(getTrigger(fixture).getAttribute('aria-haspopup')).toBe('listbox');
    });

    it('should set aria-expanded="false" when closed', () => {
      expect(getTrigger(fixture).getAttribute('aria-expanded')).toBe('false');
    });

    it('should set aria-expanded="true" when open', async () => {
      await openSelect(fixture);
      expect(getTrigger(fixture).getAttribute('aria-expanded')).toBe('true');
    });

    it('should set aria-controls to listbox ID when open', async () => {
      await openSelect(fixture);
      const listbox = getListbox();
      expect(listbox).toBeTruthy();
      if (!listbox) {
        return;
      }
      expect(getTrigger(fixture).getAttribute('aria-controls')).toBe(listbox.id);
    });

    it('should not set aria-disabled when not disabled', () => {
      expect(getTrigger(fixture).getAttribute('aria-disabled')).toBeNull();
    });

    it('should set aria-disabled when disabled', () => {
      fixture.componentInstance.isDisabled.set(true);
      fixture.detectChanges();
      expect(getTrigger(fixture).getAttribute('aria-disabled')).toBe('true');
    });
  });

  describe('selection', () => {
    let fixture: ComponentFixture<BasicSelectHost>;
    let host: BasicSelectHost;

    beforeEach(async () => {
      TestBed.configureTestingModule({ imports: [BasicSelectHost] });
      fixture = TestBed.createComponent(BasicSelectHost);
      host = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should select option on click and update value', async () => {
      await openSelect(fixture);
      getOptions()[2].click();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(host.selected()?.name).toBe('Cherry');
    });

    it('should update trigger display when value changes', async () => {
      await openSelect(fixture);
      getOptions()[0].click();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(getTrigger(fixture).textContent?.trim()).toBe('Apple');
    });
  });

  describe('keyboard', () => {
    let fixture: ComponentFixture<BasicSelectHost>;

    beforeEach(async () => {
      TestBed.configureTestingModule({ imports: [BasicSelectHost] });
      fixture = TestBed.createComponent(BasicSelectHost);
      fixture.detectChanges();
    });

    it('should open panel on Enter key', async () => {
      getTrigger(fixture).dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
      );
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(getListbox()).toBeTruthy();
    });

    it('should open panel on Space key', async () => {
      getTrigger(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(getListbox()).toBeTruthy();
    });

    it('should open panel on ArrowDown key', async () => {
      getTrigger(fixture).dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
      );
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(getListbox()).toBeTruthy();
    });

    it('should not open panel on random key', async () => {
      getTrigger(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(getListbox()).toBeFalsy();
    });

    it('should close panel on Tab key when open', async () => {
      await openSelect(fixture);
      getTrigger(fixture).dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }),
      );
      await settleOverlayClose(fixture);
      expect(getListbox()).toBeFalsy();
    });
  });

  describe('disabled', () => {
    let fixture: ComponentFixture<BasicSelectHost>;
    let host: BasicSelectHost;

    beforeEach(async () => {
      TestBed.configureTestingModule({ imports: [BasicSelectHost] });
      fixture = TestBed.createComponent(BasicSelectHost);
      host = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should not open when disabled', async () => {
      host.isDisabled.set(true);
      fixture.detectChanges();
      await openSelect(fixture);
      expect(host.selectRef().isOpen()).toBe(false);
    });

    it('should not open on keyboard when disabled', async () => {
      host.isDisabled.set(true);
      fixture.detectChanges();
      getTrigger(fixture).dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
      );
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(getListbox()).toBeFalsy();
    });

    it('should not open when programmatically disabled and open again after enable', async () => {
      host.selectRef().disable();
      fixture.detectChanges();
      expect(host.selectRef().isDisabled()).toBe(true);
      await openSelect(fixture);
      expect(host.selectRef().isOpen()).toBe(false);

      host.selectRef().enable();
      fixture.detectChanges();
      expect(host.selectRef().isDisabled()).toBe(false);
      await openSelect(fixture);
      expect(host.selectRef().isOpen()).toBe(true);
    });

    it('should close panel when disable() is called while open', async () => {
      await openSelect(fixture);
      expect(host.selectRef().isOpen()).toBe(true);

      host.selectRef().disable();
      fixture.detectChanges();
      await flushMicrotasks();
      fixture.detectChanges();

      expect(host.selectRef().isOpen()).toBe(false);
      expect(host.selectRef().isDisabled()).toBe(true);
    });
  });

  describe('defaults precedence', () => {
    let fixture: ComponentFixture<BackdropDefaultsPrecedenceSelectHost>;

    beforeEach(async () => {
      TestBed.configureTestingModule({
        imports: [BackdropDefaultsPrecedenceSelectHost],
        providers: [
          provideOverlayDefaults({
            classMergeMode: 'append',
            backdropClass: 'defaults-overlay-backdrop',
            nxrBackdropClass: 'defaults-overlay-nxr-backdrop',
          }),
          provideSelectDefaults({
            backdropClass: 'defaults-select-backdrop',
          }),
        ],
      });
      fixture = TestBed.createComponent(BackdropDefaultsPrecedenceSelectHost);
      fixture.detectChanges();
    });

    it('applies backdrop class precedence (overlay defaults < select defaults < instance inputs)', async () => {
      await openSelect(fixture);
      const backdrop = document.querySelector('.nxr-select-backdrop') as HTMLElement | null;

      expect(backdrop).not.toBeNull();
      expect(backdrop?.classList.contains('defaults-select-backdrop')).toBe(true);
      expect(backdrop?.classList.contains('instance-select-backdrop')).toBe(true);
      expect(backdrop?.classList.contains('defaults-overlay-nxr-backdrop')).toBe(true);
      expect(backdrop?.classList.contains('instance-select-nxr-backdrop')).toBe(true);
    });
  });
});

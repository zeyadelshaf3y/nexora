import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ListboxGroupLabelDirective } from './listbox-group-label.directive';
import { ListboxGroupDirective } from './listbox-group.directive';
import { ListboxOptionDirective } from './listbox-option.directive';
import { ListboxDirective } from './listbox.directive';

interface Option {
  id: number;
  name: string;
}

@Component({
  standalone: true,
  imports: [ListboxDirective, ListboxOptionDirective],
  template: `
    <div
      nxrListbox
      [nxrListboxValue]="value()"
      (nxrListboxValueChange)="onValueChange($event)"
      (nxrListboxOptionActivated)="onActivated($event)"
      [nxrListboxAccessors]="accessors"
      nxrListboxInitialHighlight="first"
    >
      @for (item of options(); track item.id) {
        <div [nxrListboxOption]="item" data-option>{{ item.name }}</div>
      }
    </div>
  `,
})
class SelectionModeHostComponent {
  readonly options = signal<Option[]>([
    { id: 1, name: 'One' },
    { id: 2, name: 'Two' },
    { id: 3, name: 'Three' },
  ]);
  readonly value = signal<Option | null>(null);
  readonly accessors = {
    value: (o: Option) => o.id,
    label: (o: Option) => o.name,
  };
  valueChangeEvents: (Option | null)[] = [];
  activatedEvents: Option[] = [];

  onValueChange(v: Option | null): void {
    this.valueChangeEvents.push(v);
    this.value.set(v);
  }

  onActivated(e: { option: Option }): void {
    this.activatedEvents.push(e.option);
  }
}

@Component({
  standalone: true,
  imports: [ListboxDirective, ListboxOptionDirective],
  template: `
    <div
      nxrListbox
      nxrListboxMode="action"
      nxrListboxRole="menu"
      (nxrListboxOptionActivated)="onActivated($event)"
      [nxrListboxAccessors]="accessors"
      nxrListboxInitialHighlight="first"
    >
      @for (a of actions(); track a.id) {
        <div [nxrListboxOption]="a" data-option>{{ a.label }}</div>
      }
    </div>
  `,
})
class ActionModeHostComponent {
  readonly actions = signal<{ id: number; label: string }[]>([
    { id: 1, label: 'Create' },
    { id: 2, label: 'Edit' },
  ]);
  readonly accessors = {
    value: (a: { id: number; label: string }) => a.id,
    label: (a: { id: number; label: string }) => a.label,
  };
  activatedEvents: { id: number; label: string }[] = [];

  onActivated(e: { option: { id: number; label: string } }): void {
    this.activatedEvents.push(e.option);
  }
}

const LISTBOX_GROUP_IMPORTS = [
  ListboxDirective,
  ListboxOptionDirective,
  ListboxGroupDirective,
  ListboxGroupLabelDirective,
];

@Component({
  standalone: true,
  imports: LISTBOX_GROUP_IMPORTS,
  template: `
    <div
      nxrListbox
      [nxrListboxValue]="value()"
      (nxrListboxValueChange)="value.set($event)"
      [nxrListboxAccessors]="accessors"
      nxrListboxInitialHighlight="first"
    >
      <div nxrListboxGroup data-group>
        <span nxrListboxGroupLabel data-group-label>Fruits</span>
        <div [nxrListboxOption]="apple" data-option>Apple</div>
        <div [nxrListboxOption]="banana" data-option>Banana</div>
      </div>
    </div>
  `,
})
class GroupWithSemanticLabelHost {
  readonly value = signal<Option | null>(null);
  readonly accessors = { value: (o: Option) => o.id, label: (o: Option) => o.name };
  readonly apple = { id: 1, name: 'Apple' };
  readonly banana = { id: 2, name: 'Banana' };
}

@Component({
  standalone: true,
  imports: LISTBOX_GROUP_IMPORTS,
  template: `
    <div
      nxrListbox
      [nxrListboxValue]="value()"
      (nxrListboxValueChange)="value.set($event)"
      [nxrListboxAccessors]="accessors"
      nxrListboxInitialHighlight="first"
    >
      <div [nxrListboxGroup]="'my-group-id'" data-group>
        <span id="my-group-id" data-group-label>Fruits</span>
        <div [nxrListboxOption]="apple" data-option>Apple</div>
        <div [nxrListboxOption]="banana" data-option>Banana</div>
      </div>
    </div>
  `,
})
class GroupWithLegacyManualIdHost {
  readonly value = signal<Option | null>(null);
  readonly accessors = { value: (o: Option) => o.id, label: (o: Option) => o.name };
  readonly apple = { id: 1, name: 'Apple' };
  readonly banana = { id: 2, name: 'Banana' };
}

@Component({
  standalone: true,
  imports: LISTBOX_GROUP_IMPORTS,
  template: `
    <div
      nxrListbox
      [nxrListboxValue]="value()"
      (nxrListboxValueChange)="value.set($event)"
      [nxrListboxAccessors]="accessors"
      nxrListboxInitialHighlight="first"
    >
      <div [nxrListboxGroup]="'manual-fallback-id'" data-group>
        <span nxrListboxGroupLabel data-group-label>Fruits</span>
        <div [nxrListboxOption]="apple" data-option>Apple</div>
      </div>
    </div>
  `,
})
class GroupWithPrecedenceHost {
  readonly value = signal<Option | null>(null);
  readonly accessors = { value: (o: Option) => o.id, label: (o: Option) => o.name };
  readonly apple = { id: 1, name: 'Apple' };
}

@Component({
  standalone: true,
  imports: [ListboxDirective, ListboxOptionDirective],
  template: `
    <div
      nxrListbox
      [nxrListboxCompareWith]="compareById"
      [nxrListboxAccessors]="accessors"
      nxrListboxInitialHighlight="none"
    >
      @for (item of options(); track item.id) {
        <div [nxrListboxOption]="item" data-option>{{ item.name }}</div>
      }
    </div>
  `,
})
class CompareWithEquivalentHost {
  readonly options = signal<Option[]>([
    { id: 1, name: 'One' },
    { id: 2, name: 'Two' },
  ]);
  readonly accessors = {
    value: (o: Option) => o.id,
    label: (o: Option) => o.name,
  };
  readonly compareById = (a: Option, b: Option) => a.id === b.id;
}

@Component({
  standalone: true,
  imports: [ListboxDirective, ListboxOptionDirective],
  template: `
    <div
      nxrListbox
      nxrListboxMode="action"
      nxrListboxInitialHighlight="none"
      nxrListboxPointerHighlight="hover"
      (nxrListboxOptionActivated)="onActivated($event)"
      data-listbox
    >
      <div [nxrListboxOption]="item1" data-option>One</div>
      <div [nxrListboxOption]="item2" data-option>Two</div>
      <div data-padding style="height: 24px"></div>
    </div>
  `,
})
class PointerHighlightHost {
  readonly item1 = { id: 1, label: 'One' };
  readonly item2 = { id: 2, label: 'Two' };
  activated: { id: number; label: string }[] = [];

  onActivated(e: { option: { id: number; label: string } }): void {
    this.activated.push(e.option);
  }
}

function dispatchKey(el: HTMLElement, key: string): void {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

describe('ListboxDirective', () => {
  describe('selection mode', () => {
    let fixture: ComponentFixture<SelectionModeHostComponent>;
    let host: HTMLElement;
    let listboxEl: HTMLElement;

    beforeEach(() => {
      TestBed.configureTestingModule({ imports: [SelectionModeHostComponent] });
      fixture = TestBed.createComponent(SelectionModeHostComponent);
      fixture.detectChanges();
      host = fixture.nativeElement as HTMLElement;
      listboxEl = host.querySelector('[nxrListbox]') as HTMLElement;
    });

    it('sets role and id on the listbox host', () => {
      expect(listboxEl.getAttribute('role')).toBe('listbox');
      expect(listboxEl.getAttribute('id')).toBeTruthy();
    });

    it('registers options and sets option role and id', () => {
      const options = host.querySelectorAll('[data-option]');
      expect(options.length).toBe(3);
      options.forEach((opt) => {
        expect(opt.getAttribute('role')).toBe('option');
        expect(opt.getAttribute('id')).toBeTruthy();
      });
    });

    it('ArrowDown sets active to next option', () => {
      listboxEl.focus();
      dispatchKey(listboxEl, 'ArrowDown');
      fixture.detectChanges();
      const options = host.querySelectorAll('[data-option]');
      const second = options[1] as HTMLElement;
      expect(second.getAttribute('id')).toBe(listboxEl.getAttribute('aria-activedescendant'));
    });

    it('Enter activates option and emits valueChange and optionActivated', () => {
      listboxEl.focus();
      dispatchKey(listboxEl, 'ArrowDown');
      fixture.detectChanges();
      dispatchKey(listboxEl, 'Enter');
      fixture.detectChanges();
      expect(fixture.componentInstance.valueChangeEvents.length).toBe(1);
      expect(fixture.componentInstance.valueChangeEvents[0]).toEqual({ id: 2, name: 'Two' });
      expect(fixture.componentInstance.activatedEvents.length).toBe(1);
      expect(fixture.componentInstance.activatedEvents[0]).toEqual({ id: 2, name: 'Two' });
    });

    it('click on option activates and emits', () => {
      const options = host.querySelectorAll('[data-option]');
      (options[1] as HTMLElement).click();
      fixture.detectChanges();
      expect(fixture.componentInstance.valueChangeEvents.length).toBe(1);
      expect(fixture.componentInstance.valueChangeEvents[0]).toEqual({ id: 2, name: 'Two' });
    });
  });

  describe('action mode', () => {
    let fixture: ComponentFixture<ActionModeHostComponent>;
    let host: HTMLElement;
    let listboxEl: HTMLElement;

    beforeEach(() => {
      TestBed.configureTestingModule({ imports: [ActionModeHostComponent] });
      fixture = TestBed.createComponent(ActionModeHostComponent);
      fixture.detectChanges();
      host = fixture.nativeElement as HTMLElement;
      listboxEl = host.querySelector('[nxrListbox]') as HTMLElement;
    });

    it('sets role="menu" on host', () => {
      expect(listboxEl.getAttribute('role')).toBe('menu');
    });

    it('Enter activates option and emits optionActivated only', () => {
      listboxEl.focus();
      dispatchKey(listboxEl, 'ArrowDown');
      fixture.detectChanges();
      dispatchKey(listboxEl, 'Enter');
      fixture.detectChanges();
      expect(fixture.componentInstance.activatedEvents.length).toBe(1);
      expect(fixture.componentInstance.activatedEvents[0]).toEqual({ id: 2, label: 'Edit' });
    });
  });

  describe('group and group label', () => {
    it('semantic label: group host gets aria-labelledby pointing to nxrListboxGroupLabel id', () => {
      TestBed.configureTestingModule({ imports: [GroupWithSemanticLabelHost] });
      const fixture = TestBed.createComponent(GroupWithSemanticLabelHost);
      fixture.detectChanges();
      const host = fixture.nativeElement as HTMLElement;
      const groupEl = host.querySelector('[data-group]') as HTMLElement;
      const labelEl = host.querySelector('[data-group-label]') as HTMLElement;
      expect(groupEl.getAttribute('role')).toBe('group');
      const labelId = labelEl.getAttribute('id');
      expect(labelId).toBeTruthy();
      expect(groupEl.getAttribute('aria-labelledby')).toBe(labelId);
    });

    it('legacy manual id: group host uses nxrListboxGroup input when no label directive', () => {
      TestBed.configureTestingModule({ imports: [GroupWithLegacyManualIdHost] });
      const fixture = TestBed.createComponent(GroupWithLegacyManualIdHost);
      fixture.detectChanges();
      const host = fixture.nativeElement as HTMLElement;
      const groupEl = host.querySelector('[data-group]') as HTMLElement;
      expect(groupEl.getAttribute('role')).toBe('group');
      expect(groupEl.getAttribute('aria-labelledby')).toBe('my-group-id');
    });

    it('precedence: discovered label directive id wins over manual nxrListboxGroup input', () => {
      TestBed.configureTestingModule({ imports: [GroupWithPrecedenceHost] });
      const fixture = TestBed.createComponent(GroupWithPrecedenceHost);
      fixture.detectChanges();
      const host = fixture.nativeElement as HTMLElement;
      const groupEl = host.querySelector('[data-group]') as HTMLElement;
      const labelEl = host.querySelector('[data-group-label]') as HTMLElement;
      const labelId = labelEl.getAttribute('id');
      expect(labelId).toBeTruthy();
      expect(groupEl.getAttribute('aria-labelledby')).toBe(labelId);
      expect(groupEl.getAttribute('aria-labelledby')).not.toBe('manual-fallback-id');
    });
  });

  describe('compareWith and equivalent item references', () => {
    it('activeOptionId resolves when active is a different object than the registered option', () => {
      TestBed.configureTestingModule({ imports: [CompareWithEquivalentHost] });
      const fixture = TestBed.createComponent(CompareWithEquivalentHost);
      fixture.detectChanges();
      const host = fixture.nativeElement as HTMLElement;
      const listboxElDbg = fixture.debugElement.query(By.directive(ListboxDirective));
      expect(listboxElDbg).toBeTruthy();
      const listbox = listboxElDbg.injector.get(ListboxDirective<Option>);
      const listboxEl = host.querySelector('[nxrListbox]') as HTMLElement;
      const firstOption = host.querySelector('[data-option]') as HTMLElement;
      const clone = { id: 1, name: 'One' };

      listbox.setActiveOption(clone);
      fixture.detectChanges();

      expect(firstOption.getAttribute('id')).toBeTruthy();
      expect(listboxEl.getAttribute('aria-activedescendant')).toBe(firstOption.getAttribute('id'));
    });
  });

  describe('pointer highlight mode', () => {
    let fixture: ComponentFixture<PointerHighlightHost>;
    let host: HTMLElement;
    let listboxEl: HTMLElement;

    beforeEach(() => {
      TestBed.configureTestingModule({ imports: [PointerHighlightHost] });
      fixture = TestBed.createComponent(PointerHighlightHost);
      fixture.detectChanges();
      host = fixture.nativeElement as HTMLElement;
      listboxEl = host.querySelector('[data-listbox]') as HTMLElement;
    });

    it('pointermove over an option sets data-active', () => {
      const second = host.querySelectorAll('[data-option]')[1] as HTMLElement;
      listboxEl.dispatchEvent(
        new PointerEvent('pointermove', { bubbles: true, pointerId: 1, clientX: 0, clientY: 0 }),
      );
      second.dispatchEvent(
        new PointerEvent('pointermove', { bubbles: true, pointerId: 1, clientX: 0, clientY: 0 }),
      );
      fixture.detectChanges();

      expect(second.hasAttribute('data-active')).toBe(true);
    });

    it('pointermove over non-option area clears data-active', () => {
      const listbox = fixture.debugElement
        .query(By.directive(ListboxDirective))
        .injector.get(ListboxDirective);
      listbox.setActiveOption(fixture.componentInstance.item1);
      fixture.detectChanges();

      const padding = host.querySelector('[data-padding]') as HTMLElement;
      listboxEl.dispatchEvent(
        new PointerEvent('pointermove', { bubbles: true, pointerId: 1, clientX: 0, clientY: 0 }),
      );
      padding.dispatchEvent(
        new PointerEvent('pointermove', { bubbles: true, pointerId: 1, clientX: 0, clientY: 0 }),
      );
      fixture.detectChanges();

      expect(host.querySelector('[data-option][data-active]')).toBeNull();
    });

    it('pointerleave the listbox clears data-active', () => {
      const listbox = fixture.debugElement
        .query(By.directive(ListboxDirective))
        .injector.get(ListboxDirective);
      listbox.setActiveOption(fixture.componentInstance.item1);
      fixture.detectChanges();

      listboxEl.dispatchEvent(
        new PointerEvent('pointerleave', { bubbles: true, relatedTarget: document.body }),
      );
      fixture.detectChanges();

      expect(host.querySelector('[data-option][data-active]')).toBeNull();
    });

    it('pointerdown on non-option area clears data-active', () => {
      const listbox = fixture.debugElement
        .query(By.directive(ListboxDirective))
        .injector.get(ListboxDirective);
      listbox.setActiveOption(fixture.componentInstance.item1);
      fixture.detectChanges();

      const padding = host.querySelector('[data-padding]') as HTMLElement;
      padding.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, clientX: 0, clientY: 0 }),
      );
      fixture.detectChanges();

      expect(host.querySelector('[data-option][data-active]')).toBeNull();
    });

    it('mousedown on option does not set data-active; click still activates', () => {
      const second = host.querySelectorAll('[data-option]')[1] as HTMLElement;
      second.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      fixture.detectChanges();
      expect(second.hasAttribute('data-active')).toBe(false);

      second.click();
      fixture.detectChanges();
      expect(fixture.componentInstance.activated).toEqual([{ id: 2, label: 'Two' }]);
    });
  });
});

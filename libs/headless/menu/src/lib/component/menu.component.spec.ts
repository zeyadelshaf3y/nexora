import { Component, viewChild } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuGroupLabelDirective } from '../directives/menu-group-label.directive';
import { MenuGroupDirective } from '../directives/menu-group.directive';
import { MenuItemDirective } from '../directives/menu-item.directive';
import { MenuPanelDirective } from '../directives/menu-panel.directive';
import { MenuSeparatorDirective } from '../directives/menu-separator.directive';
import { MenuTriggerDirective } from '../directives/menu-trigger.directive';

import { MenuComponent } from './menu.component';

const MENU_IMPORTS = [
  MenuComponent,
  MenuTriggerDirective,
  MenuPanelDirective,
  MenuItemDirective,
  MenuGroupDirective,
  MenuGroupLabelDirective,
  MenuSeparatorDirective,
] as const;

function getTrigger(fixture: ComponentFixture<unknown>): HTMLButtonElement {
  const el = fixture.nativeElement.querySelector<HTMLButtonElement>('[nxrMenuTrigger]');
  if (!el) throw new Error('Trigger not found');

  return el;
}

function getMenuItems(): NodeListOf<HTMLElement> {
  return document.querySelectorAll('[role="menuitem"]');
}

function getMenu(): HTMLElement | null {
  return document.querySelector('[role="menu"]');
}

function flushMicrotasks(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

async function openMenu(fixture: ComponentFixture<unknown>): Promise<void> {
  getTrigger(fixture).click();
  fixture.detectChanges();
  await flushMicrotasks();
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
}

@Component({
  standalone: true,
  imports: MENU_IMPORTS,
  template: `
    <nxr-menu
      (optionActivated)="onActivated($event)"
      (closed)="lastCloseReason = $event"
      [closeAnimationDurationMs]="0"
      #m="nxrMenu"
    >
      <button nxrMenuTrigger>Actions</button>
      <ng-template nxrMenuPanel>
        <button [nxrMenuItem]="item1">Item 1</button>
        <button [nxrMenuItem]="item2">Item 2</button>
      </ng-template>
    </nxr-menu>
  `,
})
class BasicMenuHost {
  readonly item1 = { id: 1, label: 'Item 1' };
  readonly item2 = { id: 2, label: 'Item 2' };
  activated: { option: unknown } | null = null;
  lastCloseReason: string | undefined;
  readonly menuRef = viewChild.required<MenuComponent>('m');

  onActivated(event: { option: unknown }): void {
    this.activated = event;
  }
}

describe('MenuComponent', () => {
  describe('basic open/close', () => {
    it('opens on trigger click and closes on Escape', async () => {
      await TestBed.configureTestingModule({
        imports: [BasicMenuHost],
      }).compileComponents();

      const fixture = TestBed.createComponent(BasicMenuHost);
      fixture.detectChanges();

      expect(fixture.componentInstance.menuRef().isOpen()).toBe(false);
      expect(getMenu()).toBeNull();

      getTrigger(fixture).click();
      fixture.detectChanges();
      await flushMicrotasks();
      fixture.detectChanges();

      expect(fixture.componentInstance.menuRef().isOpen()).toBe(true);
      expect(getMenu()).toBeTruthy();
      expect(getMenuItems().length).toBe(2);

      getTrigger(fixture).dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      );
      fixture.detectChanges();
      await flushMicrotasks();
      fixture.detectChanges();

      expect(fixture.componentInstance.menuRef().isOpen()).toBe(false);
    });

    it('emits optionActivated and closes when an item is activated', async () => {
      await TestBed.configureTestingModule({
        imports: [BasicMenuHost],
      }).compileComponents();

      const fixture = TestBed.createComponent(BasicMenuHost);
      fixture.detectChanges();
      await openMenu(fixture);

      const items = getMenuItems();
      expect(items.length).toBe(2);

      items[1].click();
      fixture.detectChanges();
      await flushMicrotasks();
      fixture.detectChanges();

      expect(fixture.componentInstance.activated).toEqual({
        option: fixture.componentInstance.item2,
      });
      expect(fixture.componentInstance.menuRef().isOpen()).toBe(false);
      expect(fixture.componentInstance.lastCloseReason).toBe('selection');
    });

    it('updates trigger aria-activedescendant during keyboard navigation', async () => {
      await TestBed.configureTestingModule({
        imports: [BasicMenuHost],
      }).compileComponents();

      const fixture = TestBed.createComponent(BasicMenuHost);
      fixture.detectChanges();
      await openMenu(fixture);

      const trigger = getTrigger(fixture);
      trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      fixture.detectChanges();
      await flushMicrotasks();
      fixture.detectChanges();

      expect(trigger.getAttribute('aria-activedescendant')).toBeTruthy();
    });

    it('emits "programmatic" when closed via API', async () => {
      await TestBed.configureTestingModule({
        imports: [BasicMenuHost],
      }).compileComponents();

      const fixture = TestBed.createComponent(BasicMenuHost);
      fixture.detectChanges();
      await openMenu(fixture);
      fixture.componentInstance.menuRef().close();
      fixture.detectChanges();
      await flushMicrotasks();
      fixture.detectChanges();

      expect(fixture.componentInstance.lastCloseReason).toBe('programmatic');
    });

    it('does not open when programmatically disabled; opens again after enable', async () => {
      await TestBed.configureTestingModule({
        imports: [BasicMenuHost],
      }).compileComponents();

      const fixture = TestBed.createComponent(BasicMenuHost);
      const menu = fixture.componentInstance.menuRef();
      fixture.detectChanges();

      menu.disable();
      fixture.detectChanges();
      expect(menu.isDisabled()).toBe(true);
      getTrigger(fixture).click();
      fixture.detectChanges();
      await flushMicrotasks();
      fixture.detectChanges();
      expect(menu.isOpen()).toBe(false);

      menu.enable();
      fixture.detectChanges();
      expect(menu.isDisabled()).toBe(false);
      await openMenu(fixture);
      expect(menu.isOpen()).toBe(true);
    });

    it('disable() closes panel when open', async () => {
      await TestBed.configureTestingModule({
        imports: [BasicMenuHost],
      }).compileComponents();

      const fixture = TestBed.createComponent(BasicMenuHost);
      fixture.detectChanges();
      await openMenu(fixture);
      expect(fixture.componentInstance.menuRef().isOpen()).toBe(true);

      fixture.componentInstance.menuRef().disable();
      fixture.detectChanges();
      await flushMicrotasks();
      fixture.detectChanges();

      expect(fixture.componentInstance.menuRef().isOpen()).toBe(false);
      expect(fixture.componentInstance.menuRef().isDisabled()).toBe(true);
    });
  });

  describe('with groups', () => {
    @Component({
      standalone: true,
      imports: MENU_IMPORTS,
      template: `
        <nxr-menu (optionActivated)="onActivated($event)" [closeAnimationDurationMs]="0">
          <button nxrMenuTrigger>Open</button>
          <ng-template nxrMenuPanel>
            <div nxrMenuGroup>
              <span nxrMenuGroupLabel>Group A</span>
              <button [nxrMenuItem]="a">A</button>
            </div>
            <div nxrMenuSeparator></div>
            <div nxrMenuGroup>
              <span nxrMenuGroupLabel>Group B</span>
              <button [nxrMenuItem]="b">B</button>
            </div>
          </ng-template>
        </nxr-menu>
      `,
    })
    class GroupedMenuHost {
      readonly a = { name: 'A' };
      readonly b = { name: 'B' };
      activated: { option: unknown } | null = null;

      onActivated(event: { option: unknown }): void {
        this.activated = event;
      }
    }

    it('renders groups and separators with correct roles', async () => {
      await TestBed.configureTestingModule({
        imports: [GroupedMenuHost],
      }).compileComponents();

      const fixture = TestBed.createComponent(GroupedMenuHost);
      fixture.detectChanges();
      await openMenu(fixture);

      expect(document.querySelector('[role="menu"]')).toBeTruthy();
      const groups = document.querySelectorAll('[role="group"]');
      expect(groups.length).toBe(2);
      expect(document.querySelectorAll('[role="separator"]').length).toBe(1);
      expect(getMenuItems().length).toBe(2);
    });
  });
});

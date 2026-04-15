import { Component, model, signal, viewChild } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { SelectClearDirective } from '../directives/select-clear.directive';
import { SelectGroupLabelDirective } from '../directives/select-group-label.directive';
import { SelectGroupDirective } from '../directives/select-group.directive';
import { SelectOptionDirective } from '../directives/select-option.directive';
import { SelectPanelDirective } from '../directives/select-panel.directive';
import { SelectSeparatorDirective } from '../directives/select-separator.directive';
import { SelectTriggerDirective } from '../directives/select-trigger.directive';
import type { SelectAccessors } from '../types/select-types';

import { SelectComponent } from './select.component';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

export interface Fruit {
  readonly id: number;
  readonly name: string;
  readonly disabled?: boolean;
}

export const FRUITS: readonly Fruit[] = [
  { id: 1, name: 'Apple' },
  { id: 2, name: 'Banana' },
  { id: 3, name: 'Cherry' },
];

export const FRUIT_ACCESSORS: SelectAccessors<Fruit> = {
  value: (f) => f.id,
  label: (f) => f.name,
  disabled: (f) => !!f.disabled,
};

export const SELECT_IMPORTS = [
  SelectComponent,
  SelectTriggerDirective,
  SelectClearDirective,
  SelectPanelDirective,
  SelectOptionDirective,
  SelectGroupDirective,
  SelectGroupLabelDirective,
  SelectSeparatorDirective,
] as const;

export function getTrigger(fixture: ComponentFixture<unknown>): HTMLButtonElement {
  const root = fixture.nativeElement as HTMLElement;
  const el = root.querySelector('[nxrSelectTrigger]') as HTMLButtonElement | null;
  if (!el) {
    throw new Error('expected [nxrSelectTrigger] in fixture');
  }

  return el;
}

export function getOptions(): readonly HTMLElement[] {
  return Array.from(document.querySelectorAll('[role="option"]'));
}

export function getListbox(): HTMLElement | null {
  return document.querySelector('[role="listbox"]');
}

export function flushMicrotasks(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/** Flush async overlay/dropdown close (same tail as {@link closeByEscape}). */
export async function settleOverlayClose(fixture: ComponentFixture<unknown>): Promise<void> {
  fixture.detectChanges();
  await flushMicrotasks();
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
}

export async function openSelect(fixture: ComponentFixture<unknown>): Promise<void> {
  getTrigger(fixture).click();
  fixture.detectChanges();
  await flushMicrotasks();
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
}

export async function closeByEscape(fixture: ComponentFixture<unknown>): Promise<void> {
  getTrigger(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  await settleOverlayClose(fixture);
}

// ---------------------------------------------------------------------------
// Test host components
// ---------------------------------------------------------------------------

@Component({
  standalone: true,
  imports: [...SELECT_IMPORTS],
  template: `
    <nxr-select
      [(value)]="selected"
      [accessors]="accessors"
      [disabled]="isDisabled()"
      placeholder="Pick a fruit"
      [closeAnimationDurationMs]="0"
      #sel="nxrSelect"
    >
      <button nxrSelectTrigger>{{ sel.displayValue() }}</button>
      <ng-template nxrSelectPanel>
        @for (fruit of fruits(); track fruit.id) {
          <div [nxrSelectOption]="fruit">{{ fruit.name }}</div>
        }
      </ng-template>
    </nxr-select>
  `,
})
export class BasicSelectHost {
  readonly fruits = signal(FRUITS);
  readonly selected = signal<Fruit | null>(null);
  readonly isDisabled = signal(false);
  readonly accessors = FRUIT_ACCESSORS;
  readonly selectRef = viewChild.required<SelectComponent>('sel');
}

@Component({
  standalone: true,
  imports: [...SELECT_IMPORTS],
  template: `
    <nxr-select
      [(value)]="selected"
      [multi]="true"
      [accessors]="accessors"
      placeholder="Pick fruits"
      [closeAnimationDurationMs]="0"
      #sel="nxrSelect"
    >
      <button nxrSelectTrigger>{{ selected().length }} selected</button>
      <ng-template nxrSelectPanel>
        @for (fruit of fruits(); track fruit.id) {
          <div [nxrSelectOption]="fruit">{{ fruit.name }}</div>
        }
      </ng-template>
    </nxr-select>
  `,
})
export class MultiSelectHost {
  readonly fruits = signal(FRUITS);
  readonly selected = signal<readonly Fruit[]>([]);
  readonly accessors = FRUIT_ACCESSORS;
  readonly selectRef = viewChild.required<SelectComponent<Fruit>>('sel');
}

@Component({
  standalone: true,
  imports: [...SELECT_IMPORTS, ReactiveFormsModule],
  template: `
    <nxr-select
      [formControl]="control"
      [accessors]="accessors"
      placeholder="Form select"
      [closeAnimationDurationMs]="0"
    >
      <button nxrSelectTrigger>Pick</button>
      <ng-template nxrSelectPanel>
        @for (fruit of fruits(); track fruit.id) {
          <div [nxrSelectOption]="fruit">{{ fruit.name }}</div>
        }
      </ng-template>
    </nxr-select>
  `,
})
export class FormControlSelectHost {
  readonly fruits = signal(FRUITS);
  readonly accessors = FRUIT_ACCESSORS;
  readonly control = new FormControl<Fruit | null>(null);
}

@Component({
  standalone: true,
  imports: [...SELECT_IMPORTS],
  template: `
    <nxr-select [(value)]="selected" [accessors]="accessors" [closeAnimationDurationMs]="0">
      <button nxrSelectTrigger>Pick</button>
      <ng-template nxrSelectPanel>
        <div nxrSelectGroup>
          <span nxrSelectGroupLabel>Citrus</span>
          @for (f of citrus(); track f.id) {
            <div [nxrSelectOption]="f">{{ f.name }}</div>
          }
        </div>
        <div nxrSelectSeparator></div>
        <div nxrSelectGroup>
          <span nxrSelectGroupLabel>Berries</span>
          @for (f of berries(); track f.id) {
            <div [nxrSelectOption]="f">{{ f.name }}</div>
          }
        </div>
      </ng-template>
    </nxr-select>
  `,
})
export class GroupedSelectHost {
  readonly citrus = signal([
    { id: 10, name: 'Orange' },
    { id: 11, name: 'Lemon' },
  ]);
  readonly berries = signal([
    { id: 20, name: 'Strawberry' },
    { id: 21, name: 'Blueberry' },
  ]);
  readonly selected = signal<{ id: number; name: string } | null>(null);
  readonly accessors = {
    value: (f: { id: number; name: string }) => f.id,
    label: (f: { id: number; name: string }) => f.name,
  };
}

@Component({
  standalone: true,
  imports: [...SELECT_IMPORTS],
  template: `
    <nxr-select
      [(value)]="selected"
      [accessors]="accessors"
      [compareWith]="comparator"
      [closeAnimationDurationMs]="0"
    >
      <button nxrSelectTrigger>Pick</button>
      <ng-template nxrSelectPanel>
        @for (f of fruits(); track f.id) {
          <div [nxrSelectOption]="f">{{ f.name }}</div>
        }
      </ng-template>
    </nxr-select>
  `,
})
export class CompareWithSelectHost {
  readonly fruits = signal(FRUITS);
  readonly selected = signal<Fruit | null>(null);
  readonly accessors = FRUIT_ACCESSORS;
  readonly comparator = (a: unknown, b: unknown) => (a as Fruit)?.id === (b as Fruit)?.id;
}

@Component({
  standalone: true,
  imports: [...SELECT_IMPORTS],
  template: `
    <nxr-select
      [(value)]="selected"
      [accessors]="accessors"
      [closeAnimationDurationMs]="0"
      (opened)="openCount = openCount + 1"
      (closed)="closeCount = closeCount + 1"
    >
      <button nxrSelectTrigger>Pick</button>
      <ng-template nxrSelectPanel>
        @for (fruit of fruits(); track fruit.id) {
          <div [nxrSelectOption]="fruit">{{ fruit.name }}</div>
        }
      </ng-template>
    </nxr-select>
  `,
})
export class OutputSelectHost {
  readonly fruits = signal(FRUITS);
  readonly selected = signal<Fruit | null>(null);
  readonly accessors = FRUIT_ACCESSORS;
  openCount = 0;
  closeCount = 0;
}

@Component({
  standalone: true,
  imports: [...SELECT_IMPORTS],
  template: `
    <nxr-select
      [(value)]="selected"
      [accessors]="accessors"
      panelClass="my-custom-panel"
      [closeAnimationDurationMs]="0"
    >
      <button nxrSelectTrigger>Pick</button>
      <ng-template nxrSelectPanel>
        @for (fruit of fruits(); track fruit.id) {
          <div [nxrSelectOption]="fruit">{{ fruit.name }}</div>
        }
      </ng-template>
    </nxr-select>
  `,
})
export class PanelClassSelectHost {
  readonly fruits = signal(FRUITS);
  readonly selected = signal<Fruit | null>(null);
  readonly accessors = FRUIT_ACCESSORS;
}

@Component({
  standalone: true,
  imports: [...SELECT_IMPORTS],
  template: `
    <nxr-select
      [accessors]="accessors"
      [hasBackdrop]="true"
      backdropClass="instance-select-backdrop"
      nxrBackdropClass="instance-select-nxr-backdrop"
      [closeAnimationDurationMs]="0"
    >
      <button nxrSelectTrigger>Pick</button>
      <ng-template nxrSelectPanel>
        @for (fruit of fruits(); track fruit.id) {
          <div [nxrSelectOption]="fruit">{{ fruit.name }}</div>
        }
      </ng-template>
    </nxr-select>
  `,
})
export class BackdropDefaultsPrecedenceSelectHost {
  readonly fruits = signal(FRUITS);
  readonly accessors = FRUIT_ACCESSORS;
}

@Component({
  standalone: true,
  imports: [...SELECT_IMPORTS],
  template: `
    <nxr-select
      [(value)]="selected"
      [accessors]="accessors"
      [required]="true"
      placeholder="Pick"
      [closeAnimationDurationMs]="0"
    >
      <button nxrSelectTrigger>Pick</button>
      <ng-template nxrSelectPanel>
        @for (fruit of fruits(); track fruit.id) {
          <div [nxrSelectOption]="fruit">{{ fruit.name }}</div>
        }
      </ng-template>
    </nxr-select>
  `,
})
export class RequiredSelectHost {
  readonly fruits = signal(FRUITS);
  readonly selected = signal<Fruit | null>(null);
  readonly accessors = FRUIT_ACCESSORS;
}

@Component({
  standalone: true,
  imports: [...SELECT_IMPORTS],
  template: `
    <nxr-select
      [(value)]="selected"
      [accessors]="accessors"
      [closeAnimationDurationMs]="0"
      (closed)="lastCloseReason = $event"
      #sel="nxrSelect"
    >
      <button nxrSelectTrigger>Pick</button>
      <ng-template nxrSelectPanel>
        @for (fruit of fruits(); track fruit.id) {
          <div [nxrSelectOption]="fruit">{{ fruit.name }}</div>
        }
      </ng-template>
    </nxr-select>
  `,
})
export class ClosedReasonHost {
  readonly fruits = signal(FRUITS);
  readonly selected = signal<Fruit | null>(null);
  readonly accessors = FRUIT_ACCESSORS;
  lastCloseReason: string | undefined;
  readonly selectRef = viewChild.required<SelectComponent<Fruit>>('sel');
}

@Component({
  standalone: true,
  imports: [...SELECT_IMPORTS],
  template: `
    <nxr-select [beforeOpen]="beforeOpenCb()" [closeAnimationDurationMs]="0" #sel="nxrSelect">
      <button nxrSelectTrigger>Pick</button>
      <ng-template nxrSelectPanel>
        @for (fruit of fruits(); track fruit.id) {
          <div [nxrSelectOption]="fruit">{{ fruit.name }}</div>
        }
      </ng-template>
    </nxr-select>
  `,
})
export class BeforeOpenSelectHost {
  readonly fruits = signal(FRUITS);
  readonly allowOpen = signal(false);
  readonly beforeOpenCb = signal(() => this.allowOpen());
  readonly selectRef = viewChild.required<SelectComponent<Fruit>>('sel');
}

@Component({
  standalone: true,
  imports: [SelectComponent, SelectTriggerDirective],
  template: `
    <nxr-select [virtualScroll]="true" [virtualItems]="opts" [accessors]="acc" #s="nxrSelect">
      <button nxrSelectTrigger>Open</button>
    </nxr-select>
  `,
})
export class VirtualTrackSelectHost {
  readonly opts = [{ id: 7, name: 'Seven' }] as { id: number; name: string }[];
  readonly acc = {
    value: (o: { id: number; name: string }) => o.id,
    label: (o: { id: number; name: string }) => o.name,
  };
  readonly selectRef = viewChild.required<SelectComponent<{ id: number; name: string }>>('s');
}

@Component({
  standalone: true,
  imports: [SelectComponent, SelectTriggerDirective],
  template: `
    <nxr-select
      [multi]="true"
      [virtualScroll]="true"
      [virtualItems]="opts"
      [accessors]="acc"
      [(value)]="selected"
      #s="nxrSelect"
    >
      <button nxrSelectTrigger>Open</button>
    </nxr-select>
  `,
})
export class VirtualMultiVirtualIndexSelectHost {
  readonly opts = [
    { id: 1, name: 'a' },
    { id: 2, name: 'b' },
    { id: 3, name: 'c' },
  ] as { id: number; name: string }[];
  readonly acc = {
    value: (o: { id: number; name: string }) => o.id,
    label: (o: { id: number; name: string }) => o.name,
  };
  readonly selected = model<readonly { id: number; name: string }[]>([
    { id: 3, name: 'c' },
    { id: 1, name: 'a' },
  ]);
  readonly selectRef = viewChild.required<SelectComponent<{ id: number; name: string }>>('s');
}

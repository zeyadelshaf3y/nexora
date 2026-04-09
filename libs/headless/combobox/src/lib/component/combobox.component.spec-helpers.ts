import { Component, model, signal, viewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { ComboboxInputDirective } from '../directives/combobox-input.directive';
import { ComboboxPanelDirective } from '../directives/combobox-panel.directive';

import { ComboboxComponent } from './combobox.component';

@Component({
  standalone: true,
  imports: [ComboboxComponent, ComboboxInputDirective, ComboboxPanelDirective],
  template: `
    <nxr-combobox #combo="nxrCombobox">
      <input nxrComboboxInput />
      <ng-template nxrComboboxPanel></ng-template>
    </nxr-combobox>
  `,
})
export class ComboboxHostComponent {}

@Component({
  standalone: true,
  imports: [ComboboxComponent, ComboboxInputDirective, ComboboxPanelDirective],
  template: `
    <nxr-combobox [multi]="true" #combo="nxrCombobox">
      <input nxrComboboxInput />
      <ng-template nxrComboboxPanel></ng-template>
    </nxr-combobox>
  `,
})
export class ComboboxMultiHostComponent {
  readonly comboRef = viewChild.required<ComboboxComponent<unknown>>('combo');
}

@Component({
  standalone: true,
  imports: [ComboboxComponent, ComboboxInputDirective, ComboboxPanelDirective],
  template: `
    <nxr-combobox [beforeOpen]="beforeOpenCb()" #combo="nxrCombobox">
      <input nxrComboboxInput />
      <ng-template nxrComboboxPanel></ng-template>
    </nxr-combobox>
  `,
})
export class ComboboxBeforeOpenHostComponent {
  readonly allowOpen = signal(false);
  readonly beforeOpenCb = signal(() => this.allowOpen());
  readonly comboRef = viewChild.required<ComboboxComponent<unknown>>('combo');
}

@Component({
  standalone: true,
  imports: [ComboboxComponent, ComboboxInputDirective, ComboboxPanelDirective, ReactiveFormsModule],
  template: `
    <nxr-combobox [formControl]="control">
      <input nxrComboboxInput />
      <ng-template nxrComboboxPanel></ng-template>
    </nxr-combobox>
  `,
})
export class ComboboxFormHostComponent {
  readonly control = new FormControl<unknown>(null);
}

@Component({
  standalone: true,
  imports: [ComboboxComponent, ComboboxInputDirective, ComboboxPanelDirective],
  template: `
    <nxr-combobox
      (closed)="lastCloseReason = $event"
      [closeAnimationDurationMs]="0"
      #combo="nxrCombobox"
    >
      <input nxrComboboxInput />
      <ng-template nxrComboboxPanel></ng-template>
    </nxr-combobox>
  `,
})
export class ComboboxClosedReasonHostComponent {
  lastCloseReason: string | undefined;
  readonly comboRef = viewChild.required<ComboboxComponent<unknown>>('combo');
}

@Component({
  standalone: true,
  imports: [ComboboxComponent, ComboboxInputDirective],
  template: `
    <nxr-combobox [virtualScroll]="true" [virtualItems]="opts" [accessors]="acc">
      <input nxrComboboxInput />
    </nxr-combobox>
  `,
})
export class ComboboxVirtualTrackKeyHostComponent {
  readonly opts = [{ id: 10, name: 'Ten' }] as { id: number; name: string }[];
  readonly acc = {
    value: (o: { id: number; name: string }) => o.id,
    label: (o: { id: number; name: string }) => o.name,
  };
}

@Component({
  standalone: true,
  imports: [ComboboxComponent, ComboboxInputDirective],
  template: `
    <nxr-combobox
      [multi]="true"
      [virtualScroll]="true"
      [virtualItems]="opts"
      [accessors]="acc"
      [(value)]="selected"
    >
      <input nxrComboboxInput />
    </nxr-combobox>
  `,
})
export class ComboboxVirtualMultiSelectedIndexHostComponent {
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
}

export const COMBOBOX_SPEC_HOST_IMPORTS = [
  ComboboxHostComponent,
  ComboboxMultiHostComponent,
  ComboboxBeforeOpenHostComponent,
  ComboboxFormHostComponent,
  ComboboxClosedReasonHostComponent,
  ComboboxVirtualTrackKeyHostComponent,
  ComboboxVirtualMultiSelectedIndexHostComponent,
] as const;

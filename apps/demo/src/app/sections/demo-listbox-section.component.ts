import { JsonPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import {
  ListboxDirective,
  ListboxGroupDirective,
  ListboxOptionDirective,
  ListboxSeparatorDirective,
} from '@nexora-ui/listbox';

interface Fruit {
  id: string;
  name: string;
  disabled?: boolean;
}

interface MenuAction {
  id: string;
  label: string;
}

function asSingle<T>(v: T | null | readonly T[]): T | null {
  return Array.isArray(v) ? null : (v as T | null);
}

@Component({
  selector: 'app-demo-listbox-section',
  standalone: true,
  imports: [
    JsonPipe,
    ListboxDirective,
    ListboxOptionDirective,
    ListboxGroupDirective,
    ListboxSeparatorDirective,
  ],
  templateUrl: './demo-listbox-section.component.html',
  styleUrl: './demo-listbox-section.component.scss',
})
export class DemoListboxSectionComponent {
  readonly fruits: Fruit[] = [
    { id: 'a', name: 'Apple' },
    { id: 'b', name: 'Banana' },
    { id: 'c', name: 'Cherry', disabled: true },
    { id: 'd', name: 'Date' },
    { id: 'e', name: 'Elderberry' },
  ];

  readonly singleValue = signal<Fruit | null>(null);
  readonly multiValue = signal<readonly Fruit[]>([]);
  readonly lastActivated = signal<Fruit | MenuAction | string | null>(null);
  readonly primitiveValue = signal<string | null>(null);
  readonly horizontalValue = signal<string | null>(null);
  readonly groupedValue = signal<Fruit | null>(null);

  readonly accessors = {
    value: (f: Fruit) => f.id,
    label: (f: Fruit) => f.name,
    disabled: (f: Fruit) => f.disabled ?? false,
  };

  readonly compareById = (a: unknown, b: unknown): boolean => (a as Fruit)?.id === (b as Fruit)?.id;

  readonly menuActions: MenuAction[] = [
    { id: 'create', label: 'Create' },
    { id: 'edit', label: 'Edit' },
    { id: 'duplicate', label: 'Duplicate' },
    { id: 'delete', label: 'Delete' },
  ];

  readonly menuAccessors = {
    value: (a: MenuAction) => a.id,
    label: (a: MenuAction) => a.label,
  };

  readonly tags = signal<string[]>(['Angular', 'TypeScript', 'Signals', 'Standalone', 'Vitest']);

  readonly groups = signal<{ id: string; label: string; options: Fruit[] }[]>([
    {
      id: 'citrus',
      label: 'Citrus',
      options: [
        { id: 'lemon', name: 'Lemon' },
        { id: 'lime', name: 'Lime' },
        { id: 'orange', name: 'Orange' },
      ],
    },
    {
      id: 'berries',
      label: 'Berries',
      options: [
        { id: 'strawberry', name: 'Strawberry' },
        { id: 'blueberry', name: 'Blueberry' },
        { id: 'raspberry', name: 'Raspberry' },
      ],
    },
  ]);

  onSingleChange(v: Fruit | null | readonly Fruit[]): void {
    this.singleValue.set(asSingle(v));
  }

  onMultiChange(v: readonly Fruit[] | Fruit | null): void {
    this.multiValue.set(Array.isArray(v) ? v : []);
  }

  onActivated(e: { option: Fruit } | { option: MenuAction } | { option: string }): void {
    this.lastActivated.set(e.option);
  }

  onPrimitiveChange(v: string | null | readonly string[]): void {
    this.primitiveValue.set(asSingle(v));
  }

  onGroupedChange(v: Fruit | null | readonly Fruit[]): void {
    this.groupedValue.set(asSingle(v));
  }

  onHorizontalChange(v: string | null | readonly string[]): void {
    this.horizontalValue.set(asSingle(v));
  }

  getGroupLabelId(groupId: string): string {
    return `listbox-group-${groupId}`;
  }

  getMultiSelectedNames(): string {
    const v = this.multiValue();
    return v.length ? v.map((f) => f.name).join(', ') : '—';
  }
}

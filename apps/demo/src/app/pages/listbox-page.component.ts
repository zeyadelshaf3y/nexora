import { JsonPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import {
  ListboxDirective,
  ListboxGroupDirective,
  ListboxOptionDirective,
  ListboxSeparatorDirective,
} from '@nexora-ui/listbox';
import { OverlayArrowDirective } from '@nexora-ui/overlay';
import { PopoverTriggerDirective } from '@nexora-ui/popover';

import { IconComponent } from '../core/icons';

import { ListboxVirtualScrollDemoComponent } from './listbox-virtual-scroll-demo.component';

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
  selector: 'app-listbox-page',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    JsonPipe,
    ListboxDirective,
    ListboxGroupDirective,
    ListboxOptionDirective,
    ListboxSeparatorDirective,
    PopoverTriggerDirective,
    OverlayArrowDirective,
    IconComponent,
    ListboxVirtualScrollDemoComponent,
  ],
  template: `
    <div id="listbox">
      <!-- Single-select -->
      <section class="page-section sub-section">
        <h2 class="page-section-title">Single Select</h2>
        <p class="page-section-desc">
          Object options with accessors, compareWith, and a disabled option.
        </p>
        <div class="listbox-page-row">
          <div
            class="listbox-host"
            nxrListbox
            [nxrListboxValue]="singleValue()"
            (nxrListboxValueChange)="onSingleChange($event)"
            [nxrListboxAccessors]="accessors"
            [nxrListboxCompareWith]="compareById"
            nxrListboxInitialHighlight="selected"
          >
            @for (item of fruits; track item.id) {
              <div class="listbox-option" [nxrListboxOption]="item">{{ item.name }}</div>
            }
          </div>
          <div class="listbox-page-meta listbox-meta-line">
            Selected: {{ singleValue() ? singleValue()!.name : '—' }}
          </div>
        </div>
      </section>

      <!-- Multi-select -->
      <section class="page-section sub-section">
        <h2 class="page-section-title">Multi Select</h2>
        <p class="page-section-desc">Space toggles selection, Enter activates.</p>
        <div class="listbox-page-row">
          <div
            class="listbox-host"
            nxrListbox
            [nxrListboxValue]="multiValue()"
            (nxrListboxValueChange)="onMultiChange($event)"
            [nxrListboxMulti]="true"
            [nxrListboxAccessors]="accessors"
            [nxrListboxCompareWith]="compareById"
          >
            @for (item of fruits; track item.id) {
              <div class="listbox-option" [nxrListboxOption]="item">{{ item.name }}</div>
            }
          </div>
          <div class="listbox-page-meta listbox-meta-line">
            Selected: {{ multiSelectedNames() }}
          </div>
        </div>
      </section>

      <!-- Virtual scroll (single) — raw listbox + listbox-cdk -->
      <section class="page-section sub-section">
        <h2 class="page-section-title">Virtual Scroll (single)</h2>
        <p class="page-section-desc">
          <code>nxr-listbox-cdk-virtual-panel</code> inside <code>nxrListbox</code> with a per-tree
          <code>NxrListboxVirtualScrollRegistry</code>. Same pattern combobox/select use in built-in
          virtual mode.
        </p>
        <app-listbox-virtual-scroll-demo />
      </section>

      <!-- Virtual scroll (multi) -->
      <section class="page-section sub-section">
        <h2 class="page-section-title">Virtual Scroll (multi)</h2>
        <p class="page-section-desc">
          Multi-select with CDK viewport; initial focus scrolls to the first selected row in list
          order.
        </p>
        <app-listbox-virtual-scroll-demo [multi]="true" />
      </section>

      <!-- Action mode -->
      <section class="page-section sub-section">
        <h2 class="page-section-title">Action Mode</h2>
        <p class="page-section-desc">
          Menu role, no value — only optionActivated fires on Enter/click.
        </p>
        <div class="listbox-page-row">
          <div
            class="listbox-host listbox-host--menu"
            nxrListbox
            nxrListboxMode="action"
            nxrListboxRole="menu"
            [nxrListboxAccessors]="menuAccessors"
            (nxrListboxOptionActivated)="onActivated($event)"
          >
            @for (action of menuActions; track action.id) {
              <div class="listbox-option" [nxrListboxOption]="action">{{ action.label }}</div>
            }
          </div>
          <div class="listbox-page-meta listbox-meta-line">
            Last activated: {{ lastActivated() ? (lastActivated() | json) : '—' }}
          </div>
        </div>
      </section>

      <!-- Primitive strings -->
      <section class="page-section sub-section">
        <h2 class="page-section-title">Primitive Options</h2>
        <p class="page-section-desc">String array — no accessors needed.</p>
        <div class="listbox-page-row">
          <div
            class="listbox-host"
            nxrListbox
            [nxrListboxValue]="primitiveValue()"
            (nxrListboxValueChange)="onPrimitiveChange($event)"
          >
            @for (tag of tags(); track tag) {
              <div class="listbox-option" [nxrListboxOption]="tag">{{ tag }}</div>
            }
          </div>
          <div class="listbox-page-meta listbox-meta-line">
            Selected: {{ primitiveValue() ?? '—' }}
          </div>
        </div>
      </section>

      <!-- Grouped + Separator -->
      <section class="page-section sub-section">
        <h2 class="page-section-title">Grouped with Separators</h2>
        <p class="page-section-desc">
          Options organized into labeled groups with visual separators.
        </p>
        <div class="listbox-page-row">
          <div
            class="listbox-host"
            nxrListbox
            [nxrListboxValue]="groupedValue()"
            (nxrListboxValueChange)="onGroupedChange($event)"
            [nxrListboxAccessors]="accessors"
            [nxrListboxCompareWith]="compareById"
          >
            @for (group of groups; track group.id) {
              <div class="listbox-group" [nxrListboxGroup]="getGroupLabelId(group.id)">
                <span [id]="getGroupLabelId(group.id)" class="listbox-group-label">{{
                  group.label
                }}</span>
                @for (item of group.options; track item.id) {
                  <div class="listbox-option" [nxrListboxOption]="item">{{ item.name }}</div>
                }
              </div>
              @if (!$last) {
                <div class="listbox-separator" nxrListboxSeparator></div>
              }
            }
          </div>
          <div class="listbox-page-meta listbox-meta-line">
            Selected: {{ groupedValue() ? groupedValue()!.name : '—' }}
          </div>
        </div>
      </section>

      <!-- Horizontal + Wrap -->
      <section class="page-section sub-section">
        <h2 class="page-section-title">Horizontal with Wrap</h2>
        <p class="page-section-desc">
          Horizontal orientation with arrow key navigation and wrap-around.
        </p>
        <div class="listbox-page-row">
          <div
            class="listbox-host listbox-host--horizontal"
            nxrListbox
            [nxrListboxValue]="horizontalValue()"
            (nxrListboxValueChange)="onHorizontalChange($event)"
            nxrListboxOrientation="horizontal"
            [nxrListboxWrap]="true"
          >
            @for (tag of tags(); track tag) {
              <div class="listbox-option listbox-option--horizontal" [nxrListboxOption]="tag">
                {{ tag }}
              </div>
            }
          </div>
          <div class="listbox-page-meta listbox-meta-line">
            Selected: {{ horizontalValue() ?? '—' }}
          </div>
        </div>
      </section>

      <!-- Mixed: Popover + Listbox (Dropdown) -->
      <section class="page-section sub-section">
        <h2 class="page-section-title">Mixed: Popover Dropdown</h2>
        <p class="page-section-desc">
          A button triggers a popover containing a listbox — classic dropdown pattern.
        </p>
        <div class="listbox-page-row">
          <button
            class="btn"
            [nxrPopover]="dropdownTpl"
            nxrPopoverPlacement="bottom-start"
            nxrPopoverPanelClass="demo-popover-pane"
            [nxrPopoverCloseAnimationDurationMs]="150"
          >
            <app-icon name="list" [size]="16" />
            {{ dropdownValue() ? dropdownValue()!.name : 'Select a fruit…' }}
          </button>
          <div class="listbox-page-meta listbox-meta-line">
            Dropdown value: {{ dropdownValue() ? dropdownValue()!.name : '—' }}
          </div>
        </div>
      </section>
    </div>
    <!-- Dropdown template -->
    <ng-template #dropdownTpl>
      <div nxrOverlayArrow class="demo-arrow"></div>
      <div
        class="listbox-host"
        nxrListbox
        [nxrListboxValue]="dropdownValue()"
        (nxrListboxValueChange)="onDropdownChange($event)"
        [nxrListboxAccessors]="accessors"
        [nxrListboxCompareWith]="compareById"
        nxrListboxInitialHighlight="selected"
      >
        @for (item of fruits; track item.id) {
          <div class="listbox-option" [nxrListboxOption]="item">{{ item.name }}</div>
        }
      </div>
    </ng-template>
  `,
  styleUrl: './listbox-page.component.scss',
})
export class ListboxPageComponent {
  readonly fruits: Fruit[] = [
    { id: 'a', name: 'Apple' },
    { id: 'b', name: 'Banana' },
    { id: 'c', name: 'Cherry', disabled: true },
    { id: 'd', name: 'Date' },
    { id: 'e', name: 'Elderberry' },
  ];

  readonly singleValue = signal<Fruit | null>(null);
  readonly multiValue = signal<readonly Fruit[]>([]);
  readonly multiSelectedNames = computed(() => {
    const v = this.multiValue();

    return v.length ? v.map((f) => f.name).join(', ') : '—';
  });
  readonly lastActivated = signal<Fruit | MenuAction | string | null>(null);
  readonly primitiveValue = signal<string | null>(null);
  readonly horizontalValue = signal<string | null>(null);
  readonly groupedValue = signal<Fruit | null>(null);
  readonly dropdownValue = signal<Fruit | null>(null);

  readonly tags = signal(['Angular', 'TypeScript', 'Signals', 'Standalone', 'Vitest']);

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

  readonly groups = [
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
  ];

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

  onDropdownChange(v: Fruit | null | readonly Fruit[]): void {
    this.dropdownValue.set(asSingle(v));
  }

  getGroupLabelId(groupId: string): string {
    return `listbox-page-group-${groupId}`;
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { ListboxDirective, NxrListboxVirtualScrollRegistry } from '@nexora-ui/listbox';
import { ListboxCdkVirtualPanelComponent } from '@nexora-ui/listbox-cdk';

const VIRTUAL_DEMO_SIZE = 2000;

/** Frozen logical list — shared by both demo instances (single + multi). */
const LISTBOX_VIRTUAL_DEMO_ITEMS = Object.freeze(
  Array.from({ length: VIRTUAL_DEMO_SIZE }, (_, i) => ({
    id: `lb-v-${i}`,
    name: `Item ${i + 1}`,
  })),
) as readonly ListboxVirtualRow[];

/** O(1) row lookup for virtual demo metadata (multi-select initial scroll index). */
const LISTBOX_VIRTUAL_INDEX_BY_ID = new Map<string, number>(
  LISTBOX_VIRTUAL_DEMO_ITEMS.map((row, index) => [row.id, index]),
);

interface ListboxVirtualRow {
  id: string;
  name: string;
}

const accessors = {
  value: (r: ListboxVirtualRow) => r.id,
  label: (r: ListboxVirtualRow) => r.name,
  disabled: () => false,
};

const compareById = (a: unknown, b: unknown) =>
  (a as ListboxVirtualRow)?.id === (b as ListboxVirtualRow)?.id;

const labelFor = (r: ListboxVirtualRow) => r.name;
const trackByKey = (r: ListboxVirtualRow) => r.id;

@Component({
  selector: 'app-listbox-virtual-scroll-demo',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [NxrListboxVirtualScrollRegistry],
  imports: [ListboxDirective, ListboxCdkVirtualPanelComponent],
  templateUrl: './listbox-virtual-scroll-demo.component.html',
  styleUrl: './listbox-virtual-scroll-demo.component.scss',
})
export class ListboxVirtualScrollDemoComponent {
  /** When true, multi-select; each instance still gets its own virtual-scroll registry. */
  readonly multi = input(false);

  readonly items = LISTBOX_VIRTUAL_DEMO_ITEMS;
  readonly accessors = accessors;
  readonly compareById = compareById;
  readonly labelForFn = labelFor;
  readonly trackByKeyFn = trackByKey;

  private readonly singleValue = signal<ListboxVirtualRow | null>(
    LISTBOX_VIRTUAL_DEMO_ITEMS[842] ?? null,
  );

  private readonly multiValue = signal<readonly ListboxVirtualRow[]>(
    [LISTBOX_VIRTUAL_DEMO_ITEMS[120], LISTBOX_VIRTUAL_DEMO_ITEMS[1800]].filter(
      (r): r is ListboxVirtualRow => r != null,
    ),
  );

  readonly listboxValue = computed(() => (this.multi() ? this.multiValue() : this.singleValue()));

  readonly initialIndex = computed(() => {
    if (this.multi()) {
      const v = this.multiValue();
      if (v.length === 0) return -1;
      const minIdx = Math.min(
        ...v.map((r) => LISTBOX_VIRTUAL_INDEX_BY_ID.get(r.id) ?? Number.POSITIVE_INFINITY),
      );

      return minIdx === Number.POSITIVE_INFINITY ? -1 : minIdx;
    }

    const v = this.singleValue();
    if (!v || Array.isArray(v)) return -1;

    return this.items.findIndex((item) => compareById(item, v));
  });

  readonly metaLine = computed(() => {
    if (this.multi()) {
      const v = this.multiValue();

      return v.length ? v.map((r) => r.name).join(', ') : '—';
    }

    const v = this.singleValue();

    return v ? v.name : '—';
  });

  onValueChange(v: ListboxVirtualRow | null | readonly ListboxVirtualRow[]): void {
    if (this.multi()) {
      this.multiValue.set(Array.isArray(v) ? v : []);
    } else {
      this.singleValue.set(Array.isArray(v) ? null : (v as ListboxVirtualRow | null));
    }
  }
}

import { JsonPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
  ViewEncapsulation,
  viewChild,
} from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  ComboboxComponent,
  ComboboxInputDirective,
  ComboboxToggleDirective,
  ComboboxPanelDirective,
  ComboboxOptionDirective,
  ComboboxGroupDirective,
  ComboboxGroupLabelDirective,
  ComboboxSeparatorDirective,
  ComboboxClearDirective,
  ComboboxVirtualFooterTemplateDirective,
  ComboboxVirtualHeaderTemplateDirective,
  ComboboxVirtualOptionTemplateDirective,
} from '@nexora-ui/combobox';

import { filterByQuery } from '../core/filter-by-query';
import { IconComponent } from '../core/icons';

interface Country {
  code: string;
  name: string;
  continent: string;
  disabled?: boolean;
}

const COUNTRIES: Country[] = [
  { code: 'us', name: 'United States', continent: 'North America' },
  { code: 'ca', name: 'Canada', continent: 'North America' },
  { code: 'mx', name: 'Mexico', continent: 'North America' },
  { code: 'gb', name: 'United Kingdom', continent: 'Europe' },
  { code: 'de', name: 'Germany', continent: 'Europe' },
  { code: 'fr', name: 'France', continent: 'Europe' },
  { code: 'jp', name: 'Japan', continent: 'Asia' },
  { code: 'kr', name: 'South Korea', continent: 'Asia' },
  { code: 'au', name: 'Australia', continent: 'Oceania' },
  { code: 'br', name: 'Brazil', continent: 'South America' },
  { code: 'ar', name: 'Argentina', continent: 'South America' },
];

const LANGUAGES = ['TypeScript', 'JavaScript', 'Python', 'Rust', 'Go', 'Java', 'C#', 'Swift'];

/** Large list for virtual scroll demo (e.g. 2000 items). */
const VIRTUAL_SCROLL_COUNT = 5000;

/** Frozen at load — avoids accidental mutation; combobox virtual list is read-only. */
const VIRTUAL_SCROLL_COUNTRIES = Object.freeze(
  Array.from({ length: VIRTUAL_SCROLL_COUNT }, (_, i) => ({
    code: `item-${i}`,
    name: `Country ${i + 1}`,
    continent: ['North America', 'Europe', 'Asia', 'Oceania', 'South America'][i % 5],
  })),
) as readonly Country[];

const CONTINENTS = [...new Set(COUNTRIES.map((c) => c.continent))];

/** Normalize combobox `valueChange` payload to a single selection (demo-only). */
function asCountrySingle(v: Country | null | readonly Country[]): Country | null {
  return Array.isArray(v) ? null : (v as Country | null);
}

function asCountryMulti(v: Country | null | readonly Country[]): readonly Country[] {
  return Array.isArray(v) ? v : [];
}

function groupByContinent(): { continent: string; countries: Country[] }[] {
  return CONTINENTS.map((continent) => ({
    continent,
    countries: COUNTRIES.filter((c) => c.continent === continent),
  }));
}

@Component({
  selector: 'app-combobox-page',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    JsonPipe,
    FormsModule,
    ReactiveFormsModule,
    ComboboxComponent,
    ComboboxInputDirective,
    ComboboxToggleDirective,
    ComboboxPanelDirective,
    ComboboxOptionDirective,
    ComboboxGroupDirective,
    ComboboxGroupLabelDirective,
    ComboboxSeparatorDirective,
    ComboboxClearDirective,
    ComboboxVirtualOptionTemplateDirective,
    ComboboxVirtualHeaderTemplateDirective,
    ComboboxVirtualFooterTemplateDirective,
    IconComponent,
  ],
  templateUrl: './combobox-page.component.html',
  styleUrl: './combobox-page.component.scss',
})
export class ComboboxPageComponent {
  private readonly virtualSingleRef = viewChild<ComboboxComponent<Country>>('virtual');
  private readonly virtualMultiRef = viewChild<ComboboxComponent<Country>>('virtualMulti');

  readonly countries = COUNTRIES;
  readonly languages = LANGUAGES;
  readonly countryGroups = groupByContinent();
  readonly VIRTUAL_SCROLL_COUNT = VIRTUAL_SCROLL_COUNT;

  readonly countryAccessors = {
    value: (c: Country) => c.code,
    label: (c: Country) => c.name,
    disabled: (c: Country) => !!c.disabled,
  };
  readonly compareByCode = (a: unknown, b: unknown) =>
    (a as Country)?.code === (b as Country)?.code;

  readonly singleValue = signal<Country | null>(null);
  readonly singleSearch = signal('');

  private readonly countryFilterOpts = { exclude: (c: Country) => !!c.disabled };

  readonly filteredCountriesSingle = computed(() =>
    filterByQuery(COUNTRIES, this.singleSearch(), (c) => c.name, this.countryFilterOpts),
  );

  readonly multiValue = signal<readonly Country[]>([]);
  readonly multiSearch = signal('');
  readonly filteredCountriesMulti = computed(() =>
    filterByQuery(COUNTRIES, this.multiSearch(), (c) => c.name, this.countryFilterOpts),
  );

  readonly oneWayValue = signal<Country | null>(null);
  readonly oneWaySearch = signal('');
  readonly oneWayChangeCount = signal(0);
  readonly filteredOneWay = computed(() =>
    filterByQuery(COUNTRIES, this.oneWaySearch(), (c) => c.name, this.countryFilterOpts),
  );

  onOneWayChange(v: Country | null | readonly Country[]): void {
    this.oneWayValue.set(asCountrySingle(v));
    this.oneWayChangeCount.update((n) => n + 1);
  }

  setSingleValue(v: Country | null | readonly Country[]): void {
    this.singleValue.set(asCountrySingle(v));
  }

  setMultiValue(v: Country | null | readonly Country[]): void {
    this.multiValue.set(asCountryMulti(v));
  }

  setScrollNoopValue(v: Country | null | readonly Country[]): void {
    this.scrollNoopValue.set(asCountrySingle(v));
  }
  setScrollRepositionValue(v: Country | null | readonly Country[]): void {
    this.scrollRepositionValue.set(asCountrySingle(v));
  }
  setScrollCloseValue(v: Country | null | readonly Country[]): void {
    this.scrollCloseValue.set(asCountrySingle(v));
  }
  setApiValue(v: Country | null | readonly Country[]): void {
    this.apiValue.set(asCountrySingle(v));
  }
  setGroupedValue(v: Country | null | readonly Country[]): void {
    this.groupedValue.set(asCountrySingle(v));
  }

  readonly countryControl = new FormControl<Country | null>(null);
  readonly controlSearch = signal('');
  readonly filteredControl = computed(() =>
    filterByQuery(COUNTRIES, this.controlSearch(), (c) => c.name, this.countryFilterOpts),
  );

  readonly ngModelValue = signal<Country | null>(null);
  readonly ngModelSearch = signal('');
  readonly filteredNgModel = computed(() =>
    filterByQuery(COUNTRIES, this.ngModelSearch(), (c) => c.name, this.countryFilterOpts),
  );

  readonly profileForm = new FormGroup({
    name: new FormControl(''),
    country: new FormControl<Country | null>(null),
  });
  readonly formGroupSearch = signal('');
  readonly filteredFormGroup = computed(() =>
    filterByQuery(COUNTRIES, this.formGroupSearch(), (c) => c.name, this.countryFilterOpts),
  );

  readonly scrollNoopValue = signal<Country | null>(null);
  readonly scrollNoopSearch = signal('');
  readonly scrollRepositionValue = signal<Country | null>(null);
  readonly scrollRepositionSearch = signal('');
  readonly scrollCloseValue = signal<Country | null>(null);
  readonly scrollCloseSearch = signal('');
  private readonly scrollList = COUNTRIES.slice(0, 8);

  readonly scrollFiltered = computed(() =>
    filterByQuery(this.scrollList, this.scrollNoopSearch(), (c) => c.name),
  );
  readonly scrollRepositionFiltered = computed(() =>
    filterByQuery(this.scrollList, this.scrollRepositionSearch(), (c) => c.name),
  );
  readonly scrollCloseFiltered = computed(() =>
    filterByQuery(this.scrollList, this.scrollCloseSearch(), (c) => c.name),
  );

  readonly apiValue = signal<Country | null>(null);
  readonly apiSearch = signal('');
  readonly apiFiltered = computed(() =>
    filterByQuery(COUNTRIES, this.apiSearch(), (c) => c.name, this.countryFilterOpts),
  );

  readonly groupedValue = signal<Country | null>(null);
  readonly groupedSearch = signal('');
  readonly filteredGroups = computed(() => {
    const q = this.groupedSearch().toLowerCase().trim();
    return this.countryGroups
      .map((g) => ({
        continent: g.continent,
        countries: filterByQuery(g.countries, q, (c) => c.name),
      }))
      .filter((g) => g.countries.length > 0);
  });

  // ─── Virtual scroll demo ─────────────────────────────────────────────────
  readonly virtualScrollValue = signal<Country | null>(null);
  private virtualScrollItemsCache: { normalizedQuery: string; items: readonly Country[] } = {
    normalizedQuery: '',
    items: VIRTUAL_SCROLL_COUNTRIES,
  };
  /** Virtual rows from combobox search; memoized for stable `virtualItems` references. */
  filterVirtualScrollByQuery(query: string): readonly Country[] {
    const normalizedQuery = query.toLowerCase().trim();
    if (this.virtualScrollItemsCache.normalizedQuery === normalizedQuery) {
      return this.virtualScrollItemsCache.items;
    }
    const items =
      normalizedQuery === ''
        ? VIRTUAL_SCROLL_COUNTRIES
        : filterByQuery(VIRTUAL_SCROLL_COUNTRIES, query, (c) => c.name);
    this.virtualScrollItemsCache = { normalizedQuery, items };
    return items;
  }
  setVirtualScrollValue(v: Country | null | readonly Country[]): void {
    this.virtualScrollValue.set(asCountrySingle(v));
  }
  readonly virtualScrollTrackByKey = (c: Country) => c.code;

  readonly virtualMultiValue = signal<readonly Country[]>(
    [VIRTUAL_SCROLL_COUNTRIES[88], VIRTUAL_SCROLL_COUNTRIES[4100]].filter(
      (c): c is Country => c != null,
    ),
  );

  setVirtualMultiValue(v: Country | null | readonly Country[]): void {
    this.virtualMultiValue.set(asCountryMulti(v));
  }

  /** Filtered virtual rows for the single large-list combobox (one compute per CD cycle). */
  readonly virtualSingleFiltered = computed(() => {
    const ref = this.virtualSingleRef();
    return this.filterVirtualScrollByQuery(ref?.search() ?? '');
  });

  /** Filtered virtual rows for the multi large-list combobox. */
  readonly virtualMultiFiltered = computed(() => {
    const ref = this.virtualMultiRef();
    return this.filterVirtualScrollByQuery(ref?.search() ?? '');
  });

  /** Typed selection for virtual-multi chips (avoids `unknown` in the template). */
  readonly virtualMultiSelectedCountries = computed((): readonly Country[] => {
    const ref = this.virtualMultiRef();
    if (!ref) return [];

    return ref.selectedValues() as readonly Country[];
  });
}

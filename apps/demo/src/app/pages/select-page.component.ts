import { JsonPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  SelectComponent,
  SelectTriggerDirective,
  SelectClearDirective,
  SelectPanelDirective,
  SelectOptionDirective,
  SelectGroupDirective,
  SelectGroupLabelDirective,
  SelectSeparatorDirective,
  SelectVirtualHeaderTemplateDirective,
  SelectVirtualOptionTemplateDirective,
} from '@nexora-ui/select';

import { IconComponent } from '../core/icons';
// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

interface Country {
  code: string;
  name: string;
  continent: string;
  disabled?: boolean;
}

interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const COUNTRIES: Country[] = [
  { code: 'us', name: 'United States', continent: 'North America' },
  { code: 'ca', name: 'Canada', continent: 'North America' },
  { code: 'mx', name: 'Mexico', continent: 'North America', disabled: true },
  { code: 'gb', name: 'United Kingdom', continent: 'Europe' },
  { code: 'de', name: 'Germany', continent: 'Europe' },
  { code: 'fr', name: 'France', continent: 'Europe' },
  { code: 'jp', name: 'Japan', continent: 'Asia' },
  { code: 'kr', name: 'South Korea', continent: 'Asia' },
  { code: 'au', name: 'Australia', continent: 'Oceania' },
  { code: 'br', name: 'Brazil', continent: 'South America' },
  { code: 'ar', name: 'Argentina', continent: 'South America' },
];

const MOCK_USERS: User[] = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', avatar: 'AJ' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', avatar: 'BS' },
  { id: 3, name: 'Carol Williams', email: 'carol@example.com', avatar: 'CW' },
  { id: 4, name: 'David Brown', email: 'david@example.com', avatar: 'DB' },
  { id: 5, name: 'Emma Davis', email: 'emma@example.com', avatar: 'ED' },
];

const LANGUAGES = ['TypeScript', 'JavaScript', 'Python', 'Rust', 'Go', 'Java', 'C#', 'Swift'];

/** Large list for virtual scroll demo. */
const VIRTUAL_SCROLL_SELECT_COUNT = 2000;

const VIRTUAL_SCROLL_SELECT_ITEMS = Object.freeze(
  Array.from({ length: VIRTUAL_SCROLL_SELECT_COUNT }, (_, i) => ({
    code: `item-${i}`,
    name: `Country ${i + 1}`,
    continent: ['North America', 'Europe', 'Asia', 'Oceania', 'South America'][i % 5],
  })),
) as readonly Country[];

const CONTINENTS = [...new Set(COUNTRIES.map((c) => c.continent))];

function groupByContinent(): { continent: string; countries: Country[] }[] {
  return CONTINENTS.map((continent) => ({
    continent,
    countries: COUNTRIES.filter((c) => c.continent === continent),
  }));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

@Component({
  selector: 'app-select-page',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    JsonPipe,
    RouterLink,
    ReactiveFormsModule,
    SelectComponent,
    SelectTriggerDirective,
    SelectClearDirective,
    SelectPanelDirective,
    SelectOptionDirective,
    SelectGroupDirective,
    SelectGroupLabelDirective,
    SelectSeparatorDirective,
    SelectVirtualHeaderTemplateDirective,
    SelectVirtualOptionTemplateDirective,
    IconComponent,
  ],
  template: `
    <div id="select">
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- 1. Basic single select                                             -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <section class="page-section sub-section">
        <h2 class="page-section-title">Basic Single Select</h2>
        <p class="page-section-desc">Simple select with object options and accessors.</p>
        <div class="select-demo-row">
          <nxr-select
            [(value)]="singleValue"
            [accessors]="countryAccessors"
            [compareWith]="compareByCode"
            placeholder="Select a country"
            #basicSel="nxrSelect"
          >
            <button class="select-trigger" nxrSelectTrigger>
              <span class="select-trigger-label">{{ basicSel.displayValue() }}</span>
              @if (basicSel.hasValue()) {
                <span
                  class="select-clear"
                  nxrSelectClear
                  role="button"
                  tabindex="0"
                  aria-label="Clear"
                  >×</span
                >
              }
              <app-icon name="chevron-down" [size]="14" class="select-trigger-icon" />
            </button>
            <ng-template nxrSelectPanel>
              @for (country of countries; track country.code) {
                <div class="select-option" [nxrSelectOption]="country">
                  {{ country.name }}
                </div>
              }
            </ng-template>
          </nxr-select>
          <div class="select-api-buttons">
            <button type="button" class="btn btn-sm" (click)="basicSel.disable()">
              Disable API
            </button>
            <button type="button" class="btn btn-sm" (click)="basicSel.enable()">Enable API</button>
          </div>
          <span class="select-meta"> Value: {{ singleValue()?.name ?? '—' }} </span>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- 2. Multi select                                                    -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <section class="page-section sub-section">
        <h2 class="page-section-title">Multi Select</h2>
        <p class="page-section-desc">
          Select multiple values. Panel stays open after each selection.
        </p>
        <div class="select-demo-row">
          <nxr-select
            [(value)]="multiValue"
            [multi]="true"
            [accessors]="countryAccessors"
            [compareWith]="compareByCode"
            placeholder="Select countries"
            #multiSel="nxrSelect"
          >
            <button class="select-trigger" nxrSelectTrigger>
              @if (!multiSel.hasValue()) {
                <span class="select-trigger-label placeholder">Select countries</span>
              } @else {
                <span class="select-trigger-chips">
                  @for (c of multiSel.selectedValues(); track c.code) {
                    <span class="select-chip">{{ c.name }}</span>
                  }
                </span>
              }
              @if (multiSel.hasValue()) {
                <span
                  class="select-clear"
                  nxrSelectClear
                  role="button"
                  tabindex="0"
                  aria-label="Clear all"
                  >×</span
                >
              }
              <app-icon name="chevron-down" [size]="14" class="select-trigger-icon" />
            </button>
            <ng-template nxrSelectPanel>
              @for (country of countries; track country.code) {
                <div class="select-option select-option--check" [nxrSelectOption]="country">
                  <span class="select-checkbox" [class.checked]="multiSel.isSelected(country)">
                    @if (multiSel.isSelected(country)) {
                      <app-icon name="check" [size]="12" />
                    }
                  </span>
                  {{ country.name }}
                </div>
              }
            </ng-template>
          </nxr-select>
          <span class="select-meta"> {{ multiSel.selectedValues().length }} selected </span>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- 3. Disabled options                                                -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <section class="page-section sub-section">
        <h2 class="page-section-title">Disabled Options</h2>
        <p class="page-section-desc">
          Mexico is disabled via accessors. The entire select can also be disabled.
        </p>
        <div class="select-demo-row">
          <nxr-select
            [(value)]="disabledDemoValue"
            [accessors]="countryAccessors"
            [compareWith]="compareByCode"
            [disabled]="selectDisabled()"
            placeholder="Select a country"
            #disabledSel="nxrSelect"
          >
            <button class="select-trigger" nxrSelectTrigger>
              <span class="select-trigger-label">{{ disabledSel.displayValue() }}</span>
              <app-icon name="chevron-down" [size]="14" class="select-trigger-icon" />
            </button>
            <ng-template nxrSelectPanel>
              @for (country of countries; track country.code) {
                <div class="select-option" [nxrSelectOption]="country">
                  {{ country.name }}
                  @if (country.disabled) {
                    <span class="select-option-badge">Unavailable</span>
                  }
                </div>
              }
            </ng-template>
          </nxr-select>
          <label class="select-toggle-label">
            <input
              type="checkbox"
              [checked]="selectDisabled()"
              (change)="selectDisabled.set(!selectDisabled())"
            />
            Disable entire select
          </label>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- 3b. Scroll strategies (in scrollable area)                         -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <section class="page-section sub-section">
        <h2 class="page-section-title">Scroll Strategies</h2>
        <p class="page-section-desc">
          Inside a scrollable area: <strong>noop</strong> — panel sticks to trigger;
          <strong>reposition</strong> — panel repositions to stay in viewport;
          <strong>close</strong> — panel closes on scroll. Open each and scroll the box to compare.
        </p>
        <div class="scroll-strategy-demo">
          <div class="scroll-strategy-scrollbox">
            <div class="scroll-strategy-spacer"></div>
            <div class="scroll-strategy-row">
              <nxr-select
                [(value)]="scrollStrategyNoopValue"
                [accessors]="countryAccessors"
                [compareWith]="compareByCode"
                placeholder="noop"
                scrollStrategy="noop"
              >
                <button class="select-trigger select-trigger--sm" nxrSelectTrigger>
                  <span class="select-trigger-label">{{
                    scrollStrategyNoopValue()?.name ?? 'noop'
                  }}</span>
                  <app-icon name="chevron-down" [size]="14" class="select-trigger-icon" />
                </button>
                <ng-template nxrSelectPanel>
                  @for (c of countries.slice(0, 5); track c.code) {
                    <div class="select-option" [nxrSelectOption]="c">{{ c.name }}</div>
                  }
                </ng-template>
              </nxr-select>
              <nxr-select
                [(value)]="scrollStrategyRepositionValue"
                [accessors]="countryAccessors"
                [compareWith]="compareByCode"
                placeholder="reposition"
                scrollStrategy="reposition"
              >
                <button class="select-trigger select-trigger--sm" nxrSelectTrigger>
                  <span class="select-trigger-label">{{
                    scrollStrategyRepositionValue()?.name ?? 'reposition'
                  }}</span>
                  <app-icon name="chevron-down" [size]="14" class="select-trigger-icon" />
                </button>
                <ng-template nxrSelectPanel>
                  @for (c of countries.slice(0, 5); track c.code) {
                    <div class="select-option" [nxrSelectOption]="c">{{ c.name }}</div>
                  }
                </ng-template>
              </nxr-select>
              <nxr-select
                [(value)]="scrollStrategyCloseValue"
                [accessors]="countryAccessors"
                [compareWith]="compareByCode"
                placeholder="close"
                scrollStrategy="close"
              >
                <button class="select-trigger select-trigger--sm" nxrSelectTrigger>
                  <span class="select-trigger-label">{{
                    scrollStrategyCloseValue()?.name ?? 'close'
                  }}</span>
                  <app-icon name="chevron-down" [size]="14" class="select-trigger-icon" />
                </button>
                <ng-template nxrSelectPanel>
                  @for (c of countries.slice(0, 5); track c.code) {
                    <div class="select-option" [nxrSelectOption]="c">{{ c.name }}</div>
                  }
                </ng-template>
              </nxr-select>
            </div>
            <div class="scroll-strategy-spacer"></div>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- 4. Reactive Forms (FormControl)                                    -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <section class="page-section sub-section">
        <h2 class="page-section-title">Reactive Forms (FormControl)</h2>
        <p class="page-section-desc">
          Integrated with Angular's FormControl. Shows touched/dirty state.
        </p>
        <div class="select-demo-row">
          <nxr-select
            [formControl]="countryControl"
            [accessors]="countryAccessors"
            [compareWith]="compareByCode"
            placeholder="FormControl select"
            #fcSel="nxrSelect"
          >
            <button class="select-trigger" nxrSelectTrigger>
              <span class="select-trigger-label">{{ fcSel.displayValue() }}</span>
              <app-icon name="chevron-down" [size]="14" class="select-trigger-icon" />
            </button>
            <ng-template nxrSelectPanel>
              @for (country of countries; track country.code) {
                <div class="select-option" [nxrSelectOption]="country">
                  {{ country.name }}
                </div>
              }
            </ng-template>
          </nxr-select>
          <div class="select-form-state">
            <span class="badge" [class.active]="countryControl.touched">touched</span>
            <span class="badge" [class.active]="countryControl.dirty">dirty</span>
            <span class="badge" [class.active]="countryControl.valid">valid</span>
            <span>Value: {{ countryControl.value?.name ?? '—' }}</span>
            <button class="btn btn-sm" (click)="countryControl.reset()">Reset</button>
            <button class="btn btn-sm" (click)="countryControl.disable()">Disable</button>
            <button class="btn btn-sm" (click)="countryControl.enable()">Enable</button>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- 5. Reactive Forms (FormGroup)                                      -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <section class="page-section sub-section">
        <h2 class="page-section-title">Reactive Form Group</h2>
        <p class="page-section-desc">Select inside a FormGroup with other controls.</p>
        <div class="select-demo-row">
          <form [formGroup]="profileForm" class="select-form-group">
            <input class="demo-input" formControlName="name" placeholder="Full name" />
            <nxr-select
              formControlName="country"
              [accessors]="countryAccessors"
              [compareWith]="compareByCode"
              placeholder="Select country"
              #fgSel="nxrSelect"
            >
              <button class="select-trigger" nxrSelectTrigger>
                <span class="select-trigger-label">{{ fgSel.displayValue() }}</span>
                <app-icon name="chevron-down" [size]="14" class="select-trigger-icon" />
              </button>
              <ng-template nxrSelectPanel>
                @for (country of countries; track country.code) {
                  <div class="select-option" [nxrSelectOption]="country">
                    {{ country.name }}
                  </div>
                }
              </ng-template>
            </nxr-select>
          </form>
          <pre class="select-pre">{{ profileForm.value | json }}</pre>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- 6. Signal-based two-way binding [(value)]                          -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <section class="page-section sub-section">
        <h2 class="page-section-title">Signal-Based [(value)]</h2>
        <p class="page-section-desc">
          Two-way signal binding without forms. The simplest integration.
        </p>
        <div class="select-demo-row">
          <nxr-select [(value)]="signalValue" placeholder="Pick a language" #sigSel="nxrSelect">
            <button class="select-trigger" nxrSelectTrigger>
              <span class="select-trigger-label">{{ sigSel.displayValue() }}</span>
              <app-icon name="chevron-down" [size]="14" class="select-trigger-icon" />
            </button>
            <ng-template nxrSelectPanel>
              @for (lang of languages; track lang) {
                <div class="select-option" [nxrSelectOption]="lang">{{ lang }}</div>
              }
            </ng-template>
          </nxr-select>
          <span class="select-meta">Value: {{ signalValue() ?? '—' }}</span>
          <button class="btn btn-sm" (click)="signalValue.set(null)">Clear</button>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- 7. One-way [value] + (valueChange)                                 -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <section class="page-section sub-section">
        <h2 class="page-section-title">[value] + (valueChange)</h2>
        <p class="page-section-desc">
          One-way binding with explicit change handler. Useful for controlled patterns.
        </p>
        <div class="select-demo-row">
          <nxr-select
            [value]="oneWayValue()"
            (valueChange)="onOneWayChange($event)"
            placeholder="One-way binding"
            #owSel="nxrSelect"
          >
            <button class="select-trigger" nxrSelectTrigger>
              <span class="select-trigger-label">{{ owSel.displayValue() }}</span>
              <app-icon name="chevron-down" [size]="14" class="select-trigger-icon" />
            </button>
            <ng-template nxrSelectPanel>
              @for (lang of languages; track lang) {
                <div class="select-option" [nxrSelectOption]="lang">{{ lang }}</div>
              }
            </ng-template>
          </nxr-select>
          <span class="select-meta">
            Value: {{ oneWayValue() ?? '—' }} (changes: {{ oneWayChangeCount() }})
          </span>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- 8. Narrowing options (outside panel — listbox-safe)                 -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <section class="page-section sub-section">
        <h2 class="page-section-title">Narrowing the option list</h2>
        <p class="page-section-desc">
          The panel is a <code>listbox</code>: only options, groups, and separators. Do not put a
          search field inside <code>nxrSelectPanel</code>. For type-to-filter, use the
          <a routerLink="/combobox" class="select-demo-combobox-link">Combobox</a> demo. Here,
          continent controls <strong>outside</strong> the panel narrow which countries appear.
        </p>
        <div class="select-narrow-filters" role="group" aria-label="Filter countries by continent">
          <button
            type="button"
            class="btn btn-sm"
            [class.btn-primary]="narrowContinent() === null"
            (click)="setNarrowContinent(null)"
          >
            All
          </button>
          @for (continent of continents; track continent) {
            <button
              type="button"
              class="btn btn-sm"
              [class.btn-primary]="narrowContinent() === continent"
              (click)="setNarrowContinent(continent)"
            >
              {{ continent }}
            </button>
          }
        </div>
        <div class="select-demo-row">
          <nxr-select
            [(value)]="narrowSelectValue"
            [accessors]="countryAccessors"
            [compareWith]="compareByCode"
            placeholder="Select a country"
            #narrowSel="nxrSelect"
          >
            <button class="select-trigger" nxrSelectTrigger>
              <span class="select-trigger-label">{{ narrowSel.displayValue() }}</span>
              <app-icon name="chevron-down" [size]="14" class="select-trigger-icon" />
            </button>
            <ng-template nxrSelectPanel>
              @for (country of countriesNarrowed(); track country.code) {
                <div class="select-option" [nxrSelectOption]="country">
                  {{ country.name }}
                </div>
              } @empty {
                <div class="select-empty">No countries for this filter</div>
              }
            </ng-template>
          </nxr-select>
          <span class="select-meta">Value: {{ narrowSelectValue()?.name ?? '—' }}</span>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- 9. Custom option template                                          -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <section class="page-section sub-section">
        <h2 class="page-section-title">Custom Option Template</h2>
        <p class="page-section-desc">
          Rich option rendering with avatars, descriptions, and icons.
        </p>
        <div class="select-demo-row">
          <nxr-select
            [(value)]="customTemplateValue"
            [accessors]="userAccessors"
            [compareWith]="compareById"
            placeholder="Select a team member"
            #customSel="nxrSelect"
          >
            <button class="select-trigger select-trigger--wide" nxrSelectTrigger>
              @if (customTemplateValue(); as user) {
                <span class="select-avatar sm">{{ user.avatar }}</span>
                <span class="select-trigger-label">{{ user.name }}</span>
              } @else {
                <span class="select-trigger-label placeholder">Select a team member</span>
              }
              <app-icon name="chevron-down" [size]="14" class="select-trigger-icon" />
            </button>
            <ng-template nxrSelectPanel>
              @for (user of users; track user.id) {
                <div class="select-option select-option--user" [nxrSelectOption]="user">
                  <span class="select-avatar">{{ user.avatar }}</span>
                  <span class="select-user-info">
                    <span class="select-user-name">{{ user.name }}</span>
                    <span class="select-user-email">{{ user.email }}</span>
                  </span>
                  @if (customSel.isSelected(user)) {
                    <app-icon name="check" [size]="16" class="select-check-icon" />
                  }
                </div>
              }
            </ng-template>
          </nxr-select>
          <span class="select-meta">Value: {{ customTemplateValue()?.name ?? '—' }}</span>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- 10. Grouped options                                                -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <section class="page-section sub-section">
        <h2 class="page-section-title">Grouped Options</h2>
        <p class="page-section-desc">Countries grouped by continent with visual separators.</p>
        <div class="select-demo-row">
          <nxr-select
            [(value)]="groupedValue"
            [accessors]="countryAccessors"
            [compareWith]="compareByCode"
            placeholder="Select a country"
            #groupSel="nxrSelect"
          >
            <button class="select-trigger" nxrSelectTrigger>
              <span class="select-trigger-label">{{ groupSel.displayValue() }}</span>
              <app-icon name="chevron-down" [size]="14" class="select-trigger-icon" />
            </button>
            <ng-template nxrSelectPanel>
              @for (group of countryGroups; track group.continent) {
                <div nxrSelectGroup>
                  <span nxrSelectGroupLabel class="select-group-label">
                    {{ group.continent }}
                  </span>
                  @for (country of group.countries; track country.code) {
                    <div class="select-option" [nxrSelectOption]="country">
                      {{ country.name }}
                    </div>
                  }
                </div>
                @if (!$last) {
                  <div class="select-separator" nxrSelectSeparator></div>
                }
              }
            </ng-template>
          </nxr-select>
          <span class="select-meta">Value: {{ groupedValue()?.name ?? '—' }}</span>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- 11. Select with header + footer                                    -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <section class="page-section sub-section">
        <h2 class="page-section-title">Panel Header &amp; Footer</h2>
        <p class="page-section-desc">Custom header with count and footer with action button.</p>
        <div class="select-demo-row">
          <nxr-select
            [(value)]="headerFooterValue"
            [multi]="true"
            [accessors]="countryAccessors"
            [compareWith]="compareByCode"
            placeholder="Select countries"
            #hfSel="nxrSelect"
          >
            <button class="select-trigger" nxrSelectTrigger>
              <span class="select-trigger-label">{{
                hfSel.displayValue() || 'Select countries'
              }}</span>
              @if (hfSel.hasValue()) {
                <span class="select-count-badge">{{ hfSel.selectedValues().length }}</span>
              }
              <app-icon name="chevron-down" [size]="14" class="select-trigger-icon" />
            </button>
            <ng-template nxrSelectPanel>
              <div class="select-panel-header">
                <span class="select-panel-title">Countries</span>
                <span class="select-panel-count">{{ hfSel.selectedValues().length }} selected</span>
              </div>
              @for (country of countries; track country.code) {
                <div class="select-option select-option--check" [nxrSelectOption]="country">
                  <span class="select-checkbox" [class.checked]="hfSel.isSelected(country)">
                    @if (hfSel.isSelected(country)) {
                      <app-icon name="check" [size]="12" />
                    }
                  </span>
                  {{ country.name }}
                </div>
              }
              <div class="select-panel-footer">
                <button class="btn btn-sm btn-ghost" nxrSelectClear>Clear all</button>
                <button class="btn btn-sm btn-primary" (click)="hfSel.close()">Done</button>
              </div>
            </ng-template>
          </nxr-select>
          <span class="select-meta">{{ hfSel.selectedValues().length }} selected</span>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- 12. Select with check icons (single)                               -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <section class="page-section sub-section">
        <h2 class="page-section-title">Check Icon (Single)</h2>
        <p class="page-section-desc">A check icon marks the selected option inside the panel.</p>
        <div class="select-demo-row">
          <nxr-select
            [(value)]="checkIconValue"
            placeholder="Select a language"
            #checkSel="nxrSelect"
          >
            <button class="select-trigger" nxrSelectTrigger>
              <span class="select-trigger-label">{{ checkSel.displayValue() }}</span>
              <app-icon name="chevron-down" [size]="14" class="select-trigger-icon" />
            </button>
            <ng-template nxrSelectPanel>
              @for (lang of languages; track lang) {
                <div class="select-option select-option--with-check" [nxrSelectOption]="lang">
                  <span>{{ lang }}</span>
                  @if (checkSel.isSelected(lang)) {
                    <app-icon name="check" [size]="16" class="select-check-icon" />
                  }
                </div>
              }
            </ng-template>
          </nxr-select>
          <span class="select-meta">Value: {{ checkIconValue() ?? '—' }}</span>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- 13. Primitive select (no accessors)                                -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <section class="page-section sub-section">
        <h2 class="page-section-title">Primitive Options</h2>
        <p class="page-section-desc">
          String values, no accessors needed. The simplest possible select.
        </p>
        <div class="select-demo-row">
          <nxr-select [(value)]="primitiveValue" placeholder="Select a color" #primSel="nxrSelect">
            <button class="select-trigger" nxrSelectTrigger>
              @if (primitiveValue(); as color) {
                <span class="select-color-dot" [style.background]="color"></span>
                <span class="select-trigger-label">{{ color }}</span>
              } @else {
                <span class="select-trigger-label placeholder">Select a color</span>
              }
              <app-icon name="chevron-down" [size]="14" class="select-trigger-icon" />
            </button>
            <ng-template nxrSelectPanel>
              @for (color of colors; track color) {
                <div class="select-option" [nxrSelectOption]="color">
                  <span class="select-color-dot" [style.background]="color"></span>
                  {{ color }}
                </div>
              }
            </ng-template>
          </nxr-select>
          <span class="select-meta">Value: {{ primitiveValue() ?? '—' }}</span>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- 14. Pre-selected value                                             -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <section class="page-section sub-section">
        <h2 class="page-section-title">Pre-Selected Value</h2>
        <p class="page-section-desc">
          Select initialized with a pre-selected value via compareWith.
        </p>
        <div class="select-demo-row">
          <nxr-select
            [(value)]="preSelectedValue"
            [accessors]="countryAccessors"
            [compareWith]="compareByCode"
            placeholder="Select a country"
            #preSel="nxrSelect"
          >
            <button class="select-trigger" nxrSelectTrigger>
              <span class="select-trigger-label">{{ preSel.displayValue() }}</span>
              <app-icon name="chevron-down" [size]="14" class="select-trigger-icon" />
            </button>
            <ng-template nxrSelectPanel>
              @for (country of countries; track country.code) {
                <div class="select-option" [nxrSelectOption]="country">
                  {{ country.name }}
                </div>
              }
            </ng-template>
          </nxr-select>
          <span class="select-meta">Value: {{ preSelectedValue()?.name ?? '—' }}</span>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- 15. Large list (CDK virtual scroll)                                 -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <section class="page-section sub-section">
        <h2 class="page-section-title">Large List — Single (2000 items)</h2>
        <p class="page-section-desc">
          CDK virtual scroll; listbox virtual-scroll handler keeps keyboard nav (arrows, Home/End)
          in sync.
        </p>
        <div class="select-demo-row">
          <nxr-select
            [(value)]="virtualScrollValue"
            [accessors]="countryAccessors"
            [compareWith]="compareByCode"
            [virtualScroll]="true"
            [virtualItems]="virtualScrollItems"
            [virtualItemSize]="52"
            [virtualTrackByKey]="virtualScrollTrackByKey"
            placeholder="Select from 2000 items"
            #virtualSel="nxrSelect"
          >
            <button class="select-trigger" nxrSelectTrigger>
              <span class="select-trigger-label">{{ virtualSel.displayValue() }}</span>
              @if (virtualSel.hasValue()) {
                <span
                  class="select-clear"
                  nxrSelectClear
                  role="button"
                  tabindex="0"
                  aria-label="Clear"
                  >×</span
                >
              }
              <app-icon name="chevron-down" [size]="14" class="select-trigger-icon" />
            </button>
            <ng-template nxrSelectVirtualHeader>
              <div class="select-virtual-panel-header">
                <span class="select-virtual-panel-title">Countries</span>
                <span class="select-virtual-panel-meta">{{ virtualScrollItems.length }} items</span>
              </div>
            </ng-template>
            <ng-template nxrSelectVirtualOption let-c>
              <span class="select-virtual-option-text">
                <span class="select-virtual-option-main">{{ c.name }}</span>
                <span class="select-virtual-option-sub">{{ c.continent }}</span>
              </span>
            </ng-template>
          </nxr-select>
          <span class="select-meta">Value: {{ virtualScrollValue()?.name ?? '—' }}</span>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- 16. Large list + multi (CDK virtual scroll)                          -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <section class="page-section sub-section">
        <h2 class="page-section-title">
          Large List — Multi ({{ virtualScrollItems.length }} items)
        </h2>
        <p class="page-section-desc">
          Same virtual panel as single-select; initial open scrolls to the first row matching any
          selected value.
        </p>
        <div class="select-demo-row">
          <nxr-select
            [(value)]="virtualMultiValue"
            [multi]="true"
            [accessors]="countryAccessors"
            [compareWith]="compareByCode"
            [virtualScroll]="true"
            [virtualItems]="virtualScrollItems"
            [virtualItemSize]="40"
            [virtualTrackByKey]="virtualScrollTrackByKey"
            placeholder="Select from virtual list"
            #virtualMultiSel="nxrSelect"
          >
            <button class="select-trigger" nxrSelectTrigger>
              @if (!virtualMultiSel.hasValue()) {
                <span class="select-trigger-label placeholder">Select from virtual list</span>
              } @else {
                <span class="select-trigger-chips">
                  @for (c of virtualMultiSel.selectedValues(); track c.code) {
                    <span class="select-chip">{{ c.name }}</span>
                  }
                </span>
              }
              @if (virtualMultiSel.hasValue()) {
                <span
                  class="select-clear"
                  nxrSelectClear
                  role="button"
                  tabindex="0"
                  aria-label="Clear all"
                  >×</span
                >
              }
              <app-icon name="chevron-down" [size]="14" class="select-trigger-icon" />
            </button>
          </nxr-select>
          <span class="select-meta">{{ virtualMultiSel.selectedValues().length }} selected</span>
        </div>
      </section>
    </div>
  `,
  /* Styles moved to global styles/styles/_select-demo.scss (scoped under #select) to meet component style budget. */
})
export class SelectPageComponent {
  // ─── Data ───────────────────────────────────────────────────────────
  readonly countries = COUNTRIES;
  readonly users = MOCK_USERS;
  readonly languages = LANGUAGES;
  readonly countryGroups = groupByContinent();
  readonly colors = ['Red', 'Orange', 'Gold', 'Green', 'Blue', 'Indigo', 'Violet'];
  readonly continents = CONTINENTS;

  // ─── Accessors ──────────────────────────────────────────────────────
  readonly countryAccessors = {
    value: (c: Country) => c.code,
    label: (c: Country) => c.name,
    disabled: (c: Country) => !!c.disabled,
  };

  readonly userAccessors = {
    value: (u: User) => u.id,
    label: (u: User) => u.name,
  };

  readonly compareByCode = (a: unknown, b: unknown) =>
    (a as Country)?.code === (b as Country)?.code;

  readonly compareById = (a: unknown, b: unknown) => (a as User)?.id === (b as User)?.id;

  // ─── 1. Single ──────────────────────────────────────────────────────
  readonly singleValue = signal<Country | null>(null);

  // ─── 2. Multi ───────────────────────────────────────────────────────
  readonly multiValue = signal<readonly Country[]>([]);

  // ─── 3. Disabled ────────────────────────────────────────────────────
  readonly disabledDemoValue = signal<Country | null>(null);
  readonly selectDisabled = signal(false);

  readonly scrollStrategyNoopValue = signal<Country | null>(null);
  readonly scrollStrategyRepositionValue = signal<Country | null>(null);
  readonly scrollStrategyCloseValue = signal<Country | null>(null);

  // ─── 4. FormControl ─────────────────────────────────────────────────
  readonly countryControl = new FormControl<Country | null>(null);

  // ─── 5. FormGroup ───────────────────────────────────────────────────
  readonly profileForm = new FormGroup({
    name: new FormControl(''),
    country: new FormControl<Country | null>(null),
  });

  // ─── 6. Signal [(value)] ────────────────────────────────────────────
  readonly signalValue = signal<string | null>(null);

  // ─── 7. One-way ─────────────────────────────────────────────────────
  readonly oneWayValue = signal<string | null>(null);
  readonly oneWayChangeCount = signal(0);

  onOneWayChange(v: string | null | readonly string[]): void {
    this.oneWayValue.set(typeof v === 'string' ? v : null);
    this.oneWayChangeCount.update((n) => n + 1);
  }

  // ─── 8. Narrow list (outside panel) ───────────────────────────────
  readonly narrowContinent = signal<string | null>(null);
  readonly narrowSelectValue = signal<Country | null>(null);

  readonly countriesNarrowed = computed(() => {
    const cont = this.narrowContinent();
    return cont === null ? COUNTRIES : COUNTRIES.filter((c) => c.continent === cont);
  });

  setNarrowContinent(continent: string | null): void {
    this.narrowContinent.set(continent);
    const current = this.narrowSelectValue();
    if (!current) return;
    const allowed =
      continent === null ? COUNTRIES : COUNTRIES.filter((c) => c.continent === continent);
    if (!allowed.some((c) => c.code === current.code)) {
      this.narrowSelectValue.set(null);
    }
  }

  // ─── 9. Custom template ────────────────────────────────────────────
  readonly customTemplateValue = signal<User | null>(null);

  // ─── 10. Grouped ────────────────────────────────────────────────────
  readonly groupedValue = signal<Country | null>(null);

  // ─── 11. Header/Footer ──────────────────────────────────────────────
  readonly headerFooterValue = signal<readonly Country[]>([]);

  // ─── 12. Check icon ─────────────────────────────────────────────────
  readonly checkIconValue = signal<string | null>(null);

  // ─── 13. Primitive ──────────────────────────────────────────────────
  readonly primitiveValue = signal<string | null>(null);

  // ─── 14. Pre-selected ───────────────────────────────────────────────
  readonly preSelectedValue = signal<Country | null>(
    COUNTRIES.find((c) => c.code === 'de') ?? null,
  );

  // ─── 15. Virtual scroll ────────────────────────────────────────────
  readonly virtualScrollItems = VIRTUAL_SCROLL_SELECT_ITEMS;
  readonly virtualScrollValue = signal<Country | null>(null);
  readonly virtualScrollTrackByKey = (c: Country) => c.code;

  // ─── 16. Virtual + multi ─────────────────────────────────────────────
  readonly virtualMultiValue = signal<readonly Country[]>(
    [VIRTUAL_SCROLL_SELECT_ITEMS[64], VIRTUAL_SCROLL_SELECT_ITEMS[1204]].filter(
      (c): c is Country => c != null,
    ),
  );
}

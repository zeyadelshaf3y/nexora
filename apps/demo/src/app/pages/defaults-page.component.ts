import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { provideComboboxDefaults } from '@nexora-ui/combobox';
import { provideMenuDefaults } from '@nexora-ui/menu';
import { provideOverlayDefaults, providePanelServicesDefaults } from '@nexora-ui/overlay';
import { PopoverTriggerDirective, providePopoverDefaults } from '@nexora-ui/popover';
import { provideSelectDefaults } from '@nexora-ui/select';

const DEMO_DEFAULTS_PROVIDERS = [
  provideOverlayDefaults({
    classMergeMode: 'append',
    styleMergeMode: 'merge',
    nxrBackdropClass: 'demo-defaults-global-backdrop',
    closeAnimationDurationMs: 150,
  }),
  providePopoverDefaults({
    hasBackdrop: true,
    backdropClass: 'demo-defaults-popover-backdrop',
  }),
  provideSelectDefaults({
    hasBackdrop: true,
    backdropClass: 'demo-defaults-select-backdrop',
  }),
  provideComboboxDefaults({
    hasBackdrop: true,
    backdropClass: 'demo-defaults-combobox-backdrop',
  }),
  provideMenuDefaults({
    hasBackdrop: true,
    backdropClass: 'demo-defaults-menu-backdrop',
  }),
  ...providePanelServicesDefaults({
    dialog: { backdropClass: 'demo-defaults-dialog-backdrop' },
    drawer: { backdropClass: 'demo-defaults-drawer-backdrop' },
  }),
];

@Component({
  selector: 'app-defaults-page',
  standalone: true,
  imports: [PopoverTriggerDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: DEMO_DEFAULTS_PROVIDERS,
  template: `
    <section class="demo-page">
      <h1>Defaults Providers</h1>
      <p>
        This page scopes all defaults providers at the component level. The popover below has no
        explicit backdrop inputs, but it still gets backdrop behavior from defaults.
      </p>

      <button
        class="demo-btn"
        [nxrPopover]="defaultsPopover"
        nxrPopoverPanelClass="demo-popover-pane"
      >
        Open Popover Using Defaults
      </button>

      <ng-template #defaultsPopover>
        <div class="demo-card">
          <strong>Defaults applied</strong>
          <p>Backdrop is enabled by provider defaults.</p>
          <p>Backdrop classes come from overlay + popover defaults.</p>
        </div>
      </ng-template>

      <h2>Provider setup example</h2>
      <div class="demo-code">
        <p>provideOverlayDefaults + providePopoverDefaults + provideSelectDefaults</p>
        <p>provideComboboxDefaults + provideMenuDefaults + providePanelServicesDefaults</p>
      </div>
    </section>
  `,
  styles: [
    `
      .demo-page {
        display: grid;
        gap: 16px;
        max-width: 900px;
      }

      .demo-btn {
        inline-size: fit-content;
        padding: 8px 12px;
        border-radius: 8px;
        border: 1px solid var(--nxr-border);
        background: var(--nxr-bg-elevated);
        color: var(--nxr-text);
        cursor: pointer;
      }

      .demo-card {
        display: grid;
        gap: 6px;
        max-width: 280px;
      }

      .demo-code {
        margin: 0;
        overflow: auto;
        padding: 12px;
        border-radius: 8px;
        border: 1px solid var(--nxr-border);
        background: var(--nxr-bg-muted);
      }
    `,
  ],
})
export class DefaultsPageComponent {}

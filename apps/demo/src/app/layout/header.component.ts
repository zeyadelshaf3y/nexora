import { Component, inject, input, ViewEncapsulation } from '@angular/core';
import { TooltipTriggerDirective } from '@nexora-ui/tooltip';

import { IconComponent } from '../core/icons';
import { ThemeService } from '../core/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [IconComponent, TooltipTriggerDirective],
  template: `
    <header class="app-header">
      <h1 class="app-header__title">{{ title() }}</h1>

      <div class="app-header__actions">
        <button
          class="app-header__btn"
          (click)="themeSvc.toggleDirection()"
          [nxrTooltip]="themeSvc.direction() === 'ltr' ? 'Switch to RTL' : 'Switch to LTR'"
          nxrTooltipPlacement="bottom"
          nxrTooltipPanelClass="demo-tooltip-pane"
        >
          <app-icon name="languages" [size]="18" />
          <span class="app-header__btn-label">{{
            themeSvc.direction() === 'ltr' ? 'LTR' : 'RTL'
          }}</span>
        </button>

        <button
          class="app-header__btn"
          (click)="themeSvc.toggleTheme()"
          [nxrTooltip]="
            themeSvc.theme() === 'light' ? 'Switch to dark mode' : 'Switch to light mode'
          "
          nxrTooltipPlacement="bottom"
          nxrTooltipPanelClass="demo-tooltip-pane"
        >
          <app-icon [name]="themeSvc.theme() === 'light' ? 'moon' : 'sun'" [size]="18" />
        </button>
      </div>
    </header>
  `,
  styles: [
    `
      .app-header {
        position: sticky;
        top: 0;
        z-index: 50;
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: var(--nxr-header-height);
        padding: 0 24px;
        background: var(--nxr-header-bg);
        border-bottom: 1px solid var(--nxr-header-border);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
      }

      .app-header__title {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--nxr-text);
        margin: 0;
        letter-spacing: -0.01em;
      }

      .app-header__actions {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .app-header__btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 10px;
        border: 1px solid transparent;
        border-radius: var(--nxr-radius);
        background: transparent;
        color: var(--nxr-text-muted);
        font-size: 0.8125rem;
        font-weight: 500;
        cursor: pointer;
        transition:
          background var(--nxr-duration) var(--nxr-ease),
          color var(--nxr-duration) var(--nxr-ease),
          border-color var(--nxr-duration) var(--nxr-ease);
      }

      .app-header__btn:hover {
        background: var(--nxr-bg-subtle);
        color: var(--nxr-text);
        border-color: var(--nxr-border-subtle);
      }

      .app-header__btn-label {
        font-variant-numeric: tabular-nums;
      }
    `,
  ],
})
export class HeaderComponent {
  readonly title = input('');
  protected readonly themeSvc = inject(ThemeService);
}

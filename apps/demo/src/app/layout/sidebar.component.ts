import { Component, inject, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  ListboxDirective,
  ListboxOptionDirective,
  type ListboxAccessors,
} from '@nexora-ui/listbox';
import { OverlayArrowDirective } from '@nexora-ui/overlay';
import { PopoverTriggerDirective } from '@nexora-ui/popover';
import { TooltipTriggerDirective } from '@nexora-ui/tooltip';

import { IconComponent } from '../core/icons';
import { ThemeService } from '../core/theme.service';

interface NavItem {
  icon: string;
  label: string;
  route: string;
}

interface MenuAction {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    RouterLink,
    RouterLinkActive,
    IconComponent,
    PopoverTriggerDirective,
    OverlayArrowDirective,
    ListboxDirective,
    ListboxOptionDirective,
    TooltipTriggerDirective,
  ],
  template: `
    <aside class="sidebar" [class.sidebar--collapsed]="collapsed()">
      <!-- Logo -->
      <div class="sidebar-logo">
        @if (collapsed()) {
          <span class="sidebar-logo__badge">N</span>
        } @else {
          <app-icon name="sparkles" [size]="22" />
          <span class="sidebar-logo__text">Nexora UI</span>
        }
      </div>

      <!-- Collapse toggle -->
      <button
        class="sidebar-toggle"
        (click)="themeSvc.toggleSidebar()"
        [attr.aria-label]="collapsed() ? 'Expand sidebar' : 'Collapse sidebar'"
      >
        <app-icon [name]="collapsed() ? 'chevron-right' : 'chevron-left'" [size]="14" />
      </button>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        @for (item of navItems; track item.route) {
          <a
            class="sidebar-nav__item"
            [routerLink]="item.route"
            routerLinkActive="sidebar-nav__item--active"
            [nxrTooltip]="collapsed() ? item.label : ''"
            nxrTooltipPlacement="end"
            nxrTooltipPanelClass="demo-tooltip-pane"
          >
            <app-icon [name]="item.icon" [size]="20" />
            <span class="sidebar-nav__label">{{ item.label }}</span>
          </a>
        }
      </nav>

      <!-- User section -->
      <div class="sidebar-user">
        <button
          class="sidebar-user__trigger"
          [nxrPopover]="userMenuTpl"
          nxrPopoverPlacement="top-start"
          nxrPopoverPanelClass="demo-popover-pane"
        >
          <span class="sidebar-user__avatar">DU</span>
          @if (!collapsed()) {
            <span class="sidebar-user__name">Demo User</span>
          }
        </button>
      </div>

      <!-- User menu popover template -->
      <ng-template #userMenuTpl>
        <div nxrOverlayArrow class="demo-arrow"></div>
        <div class="user-menu-popover">
          <div
            nxrListbox
            nxrListboxMode="action"
            nxrListboxRole="menu"
            [nxrListboxAccessors]="menuAccessors"
            (nxrListboxOptionActivated)="onMenuAction($event)"
          >
            @for (action of menuActions; track action.id) {
              <div class="user-menu-item" [nxrListboxOption]="action">
                <app-icon [name]="action.icon" [size]="16" />
                <span>{{ action.label }}</span>
              </div>
            }
          </div>
        </div>
      </ng-template>
    </aside>
  `,
  styles: [
    `
      .sidebar {
        position: fixed;
        top: 0;
        bottom: 0;
        inset-inline-start: 0;
        z-index: 100;
        display: flex;
        flex-direction: column;
        width: var(--nxr-sidebar-width);
        background: var(--nxr-sidebar-bg);
        border-inline-end: 1px solid var(--nxr-sidebar-border);
        transition: width var(--nxr-duration-slow) var(--nxr-ease);
        overflow: hidden;
      }

      .sidebar--collapsed {
        width: var(--nxr-sidebar-width-compact);
      }

      /* Logo */
      .sidebar-logo {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 20px 16px 12px;
        min-height: 56px;
        color: var(--nxr-primary);
        font-weight: 700;
        font-size: 1.125rem;
        white-space: nowrap;
        overflow: hidden;
      }

      .sidebar--collapsed .sidebar-logo {
        justify-content: center;
        padding-inline: 0;
      }

      .sidebar-logo__badge {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        border-radius: var(--nxr-radius);
        background: var(--nxr-primary);
        color: #fff;
        font-size: 0.875rem;
        font-weight: 800;
        flex-shrink: 0;
      }

      .sidebar-logo__text {
        opacity: 1;
        transition: opacity var(--nxr-duration) var(--nxr-ease);
      }

      .sidebar--collapsed .sidebar-logo__text {
        opacity: 0;
      }

      /* Collapse toggle */
      .sidebar-toggle {
        position: absolute;
        top: 22px;
        inset-inline-end: -12px;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--nxr-radius-full);
        background: var(--nxr-bg-elevated);
        border: 1px solid var(--nxr-border);
        color: var(--nxr-text-muted);
        cursor: pointer;
        box-shadow: var(--nxr-shadow-sm);
        transition:
          color var(--nxr-duration) var(--nxr-ease),
          background var(--nxr-duration) var(--nxr-ease);
        z-index: 1;
      }

      .sidebar-toggle:hover {
        color: var(--nxr-primary);
        background: var(--nxr-primary-subtle);
      }

      /* Navigation */
      .sidebar-nav {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: 12px 10px;
        overflow-y: auto;
        overflow-x: hidden;
      }

      .sidebar-nav__item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        border-radius: var(--nxr-radius);
        color: var(--nxr-text-muted);
        text-decoration: none;
        font-size: 0.875rem;
        font-weight: 500;
        white-space: nowrap;
        transition:
          background var(--nxr-duration) var(--nxr-ease),
          color var(--nxr-duration) var(--nxr-ease),
          box-shadow var(--nxr-duration) var(--nxr-ease);
        cursor: pointer;
      }

      .sidebar--collapsed .sidebar-nav__item {
        justify-content: center;
        padding: 10px;
      }

      .sidebar-nav__item:hover {
        background: var(--nxr-sidebar-hover);
        color: var(--nxr-text);
      }

      .sidebar-nav__item--active {
        background: var(--nxr-sidebar-active-bg);
        color: var(--nxr-sidebar-active-text);
        box-shadow:
          0 0 0 1px var(--nxr-primary-muted),
          var(--nxr-primary-glow);
      }

      .sidebar-nav__item--active:hover {
        background: var(--nxr-sidebar-active-bg);
        color: var(--nxr-sidebar-active-text);
      }

      .sidebar-nav__label {
        opacity: 1;
        transition: opacity var(--nxr-duration) var(--nxr-ease);
      }

      .sidebar--collapsed .sidebar-nav__label {
        opacity: 0;
        width: 0;
        overflow: hidden;
      }

      /* User section */
      .sidebar-user {
        padding: 12px 10px;
        border-top: 1px solid var(--nxr-sidebar-border);
      }

      .sidebar-user__trigger {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 8px 10px;
        border: none;
        border-radius: var(--nxr-radius);
        background: transparent;
        color: var(--nxr-text);
        cursor: pointer;
        transition: background var(--nxr-duration) var(--nxr-ease);
        white-space: nowrap;
        overflow: hidden;
      }

      .sidebar--collapsed .sidebar-user__trigger {
        justify-content: center;
        padding: 8px;
      }

      .sidebar-user__trigger:hover {
        background: var(--nxr-sidebar-hover);
      }

      .sidebar-user__avatar {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        border-radius: var(--nxr-radius-full);
        background: linear-gradient(135deg, #6366f1, #06b6d4);
        color: #fff;
        font-size: 0.75rem;
        font-weight: 700;
        flex-shrink: 0;
        letter-spacing: 0.5px;
      }

      .sidebar-user__name {
        font-size: 0.8125rem;
        font-weight: 500;
        opacity: 1;
        transition: opacity var(--nxr-duration) var(--nxr-ease);
      }

      .sidebar--collapsed .sidebar-user__name {
        opacity: 0;
        width: 0;
        overflow: hidden;
      }

      /* User menu popover */
      .user-menu-popover {
        padding: 6px;
        min-width: 160px;
      }

      .user-menu-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 12px;
        border-radius: var(--nxr-radius);
        font-size: 0.8125rem;
        color: var(--nxr-text);
        cursor: pointer;
        transition:
          background var(--nxr-duration) var(--nxr-ease),
          color var(--nxr-duration) var(--nxr-ease);
      }

      .user-menu-item:hover,
      .user-menu-item[data-active] {
        background: var(--nxr-primary-subtle);
        color: var(--nxr-primary);
      }
    `,
  ],
})
export class SidebarComponent {
  protected readonly themeSvc = inject(ThemeService);
  protected readonly collapsed = this.themeSvc.sidebarCollapsed;

  readonly navItems: NavItem[] = [
    { icon: 'grid', label: 'Overview', route: '/overview' },
    { icon: 'layers', label: 'Popover', route: '/popover' },
    { icon: 'message-square', label: 'Tooltip', route: '/tooltip' },
    { icon: 'bell', label: 'Snackbar', route: '/snackbar' },
    { icon: 'box', label: 'Dialog', route: '/dialog' },
    { icon: 'panel-right', label: 'Drawer', route: '/drawer' },
    { icon: 'list', label: 'Listbox', route: '/listbox' },
    { icon: 'chevron-down', label: 'Select', route: '/select' },
    { icon: 'search', label: 'Combobox', route: '/combobox' },
    { icon: 'at-sign', label: 'Mention', route: '/mention' },
    { icon: 'menu', label: 'Menu', route: '/menu' },
    { icon: 'languages', label: 'RTL', route: '/rtl' },
  ];

  readonly menuActions: MenuAction[] = [
    { id: 'settings', label: 'Settings', icon: 'settings' },
    { id: 'sign-out', label: 'Sign out', icon: 'log-out' },
  ];

  readonly menuAccessors: ListboxAccessors<MenuAction> = {
    value: (a) => a.id,
    label: (a) => a.label,
  };

  onMenuAction(event: { option: MenuAction }): void {
    void event;
    /* Demo user menu — no app routing wired */
  }
}

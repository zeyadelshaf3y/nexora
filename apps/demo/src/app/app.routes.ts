import type { Routes } from '@angular/router';

import { LayoutComponent } from './layout/layout.component';

export const APP_ROUTES: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      {
        path: 'overview',
        title: 'Overview',
        loadComponent: () =>
          import('./pages/overview-page.component').then((m) => m.OverviewPageComponent),
      },
      {
        path: 'popover',
        title: 'Popover',
        loadComponent: () =>
          import('./pages/popover-page.component').then((m) => m.PopoverPageComponent),
      },
      {
        path: 'tooltip',
        title: 'Tooltip',
        loadComponent: () =>
          import('./pages/tooltip-page.component').then((m) => m.TooltipPageComponent),
      },
      {
        path: 'snackbar',
        title: 'Snackbar',
        loadComponent: () =>
          import('./pages/snackbar-page.component').then((m) => m.SnackbarPageComponent),
      },
      {
        path: 'dialog',
        title: 'Dialog',
        loadComponent: () =>
          import('./pages/dialog-page.component').then((m) => m.DialogPageComponent),
      },
      {
        path: 'drawer',
        title: 'Drawer',
        loadComponent: () =>
          import('./pages/drawer-page.component').then((m) => m.DrawerPageComponent),
      },
      {
        path: 'listbox',
        title: 'Listbox',
        loadComponent: () =>
          import('./pages/listbox-page.component').then((m) => m.ListboxPageComponent),
      },
      {
        path: 'select',
        title: 'Select',
        loadComponent: () =>
          import('./pages/select-page.component').then((m) => m.SelectPageComponent),
      },
      {
        path: 'combobox',
        title: 'Combobox',
        loadComponent: () =>
          import('./pages/combobox-page.component').then((m) => m.ComboboxPageComponent),
      },
      {
        path: 'mention',
        title: 'Mention',
        loadComponent: () =>
          import('./pages/mention-page.component').then((m) => m.MentionPageComponent),
      },
      {
        path: 'menu',
        title: 'Menu',
        loadComponent: () => import('./pages/menu-page.component').then((m) => m.MenuPageComponent),
      },
      {
        path: 'rtl',
        title: 'RTL',
        loadComponent: () => import('./pages/rtl-page.component').then((m) => m.RtlPageComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'overview' },
];

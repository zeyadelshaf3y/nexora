import { Component, inject, ViewEncapsulation } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter, map, startWith } from 'rxjs';

import { ThemeService } from '../core/theme.service';

import { HeaderComponent } from './header.component';
import { SidebarComponent } from './sidebar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <app-sidebar />
    <div
      class="layout-content"
      [style.margin-inline-start]="
        sidebarCollapsed() ? 'var(--nxr-sidebar-width-compact)' : 'var(--nxr-sidebar-width)'
      "
    >
      <app-header [title]="pageTitle()" />
      <div class="layout-page">
        <router-outlet />
      </div>
    </div>
  `,
  styles: [
    `
      .layout-content {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        transition: margin-inline-start var(--nxr-duration-slow) var(--nxr-ease);
        background: var(--nxr-bg);
      }

      .layout-page {
        flex: 1;
        padding: 24px;
        max-width: 1200px;
        width: 100%;
        margin: 0 auto;
        box-sizing: border-box;
      }
    `,
  ],
})
export class LayoutComponent {
  private readonly themeSvc = inject(ThemeService);
  private readonly router = inject(Router);

  protected readonly sidebarCollapsed = this.themeSvc.sidebarCollapsed;

  protected readonly pageTitle = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      startWith(null),
      map(() => this.resolveTitle()),
    ),
    { initialValue: '' },
  );

  private resolveTitle(): string {
    let route = this.router.routerState.root;
    let title = '';
    while (route?.firstChild) {
      route = route.firstChild;
      if (route?.snapshot?.title) {
        title = route.snapshot.title;
      }
    }
    return title;
  }
}

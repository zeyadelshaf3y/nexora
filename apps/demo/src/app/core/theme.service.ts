import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';
export type Direction = 'ltr' | 'rtl';

const STORAGE_THEME = 'nxr-theme';
const STORAGE_DIR = 'nxr-dir';
const STORAGE_SIDEBAR = 'nxr-sidebar-collapsed';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly doc = inject(DOCUMENT);

  readonly theme = signal<Theme>(this.stored(STORAGE_THEME, 'light') as Theme);
  readonly direction = signal<Direction>(this.stored(STORAGE_DIR, 'ltr') as Direction);
  readonly sidebarCollapsed = signal<boolean>(this.stored(STORAGE_SIDEBAR, 'false') === 'true');

  constructor() {
    this.applyTheme(this.theme());
    this.applyDirection(this.direction());
  }

  toggleTheme(): void {
    const next: Theme = this.theme() === 'light' ? 'dark' : 'light';
    this.theme.set(next);
    this.persist(STORAGE_THEME, next);
    this.applyTheme(next);
  }

  toggleDirection(): void {
    const next: Direction = this.direction() === 'ltr' ? 'rtl' : 'ltr';
    this.direction.set(next);
    this.persist(STORAGE_DIR, next);
    this.applyDirection(next);
  }

  toggleSidebar(): void {
    const next = !this.sidebarCollapsed();
    this.sidebarCollapsed.set(next);
    this.persist(STORAGE_SIDEBAR, String(next));
  }

  private applyTheme(theme: Theme): void {
    this.doc.documentElement.setAttribute('data-theme', theme);
  }

  private applyDirection(dir: Direction): void {
    this.doc.documentElement.dir = dir;
  }

  private stored(key: string, fallback: string): string {
    try {
      return localStorage.getItem(key) ?? fallback;
    } catch {
      return fallback;
    }
  }

  private persist(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* noop */
    }
  }
}

/**
 * Registry for virtual scroll handler so panel content (rendered in a child injector)
 * can register a handler that the listbox (on the panel host) can use.
 */

import { Injectable } from '@angular/core';

import type { NxrListboxVirtualScrollHandler } from '../types';

@Injectable({ providedIn: null })
export class NxrListboxVirtualScrollRegistry {
  private handler: NxrListboxVirtualScrollHandler<unknown> | null = null;

  /**
   * Stores the handler as `unknown` item-type: safe at runtime; cast is required because
   * `NxrListboxVirtualScrollHandler` uses `T` in method parameters (not safely covariant).
   */
  setHandler<T>(handler: NxrListboxVirtualScrollHandler<T> | null): void {
    this.handler = handler as NxrListboxVirtualScrollHandler<unknown> | null;
  }

  getHandler(): NxrListboxVirtualScrollHandler<unknown> | null {
    return this.handler;
  }
}

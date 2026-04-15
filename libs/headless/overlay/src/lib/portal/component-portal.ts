import type { ComponentRef, Injector, Type, ViewContainerRef } from '@angular/core';

import type { Portal } from './portal';

/**
 * Portal that attaches a component to a host element.
 * Uses the provided ViewContainerRef to create the component, then moves its host element into the overlay pane.
 */
export class ComponentPortal<T = unknown> implements Portal {
  private _componentRef: ComponentRef<T> | null = null;
  private _attachedHost: HTMLElement | null = null;

  constructor(
    private readonly component: Type<T>,
    private readonly viewContainerRef: ViewContainerRef,
    private readonly injector?: Injector,
  ) {}

  get isAttached(): boolean {
    return this._attachedHost !== null;
  }

  /** The created component ref when attached; null when detached. */
  get componentRef(): ComponentRef<T> | null {
    return this._componentRef;
  }

  attach(host: HTMLElement): void {
    if (this._attachedHost) {
      this.detach();
    }

    this._componentRef = this.viewContainerRef.createComponent(this.component, {
      injector: this.injector,
    });

    this._componentRef.changeDetectorRef.detectChanges();
    const hostElement = this._componentRef.location.nativeElement as HTMLElement;

    host.appendChild(hostElement);

    this._attachedHost = host;
  }

  detach(): void {
    if (!this._componentRef || !this._attachedHost) return;

    const hostElement = this._componentRef.location.nativeElement as HTMLElement;

    if (hostElement.parentNode === this._attachedHost) {
      this._attachedHost.removeChild(hostElement);
    }

    this._componentRef.destroy();
    this._componentRef = null;
    this._attachedHost = null;
  }
}
